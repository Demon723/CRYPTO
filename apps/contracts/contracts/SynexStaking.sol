// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SynexStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public constant REWARD_RATE = 12;
    uint256 public constant LOCK_PERIOD = 30 days;
    uint256 public constant EARLY_UNSTAKE_PENALTY = 10;
    uint256 public constant SLASH_PENALTY = 5;
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18;

    enum StakeTier { STANDARD, PREMIUM, INSTITUTIONAL }

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
        bool active;
        StakeTier tier;
        uint256 lpSecurityTokenId;
    }

    struct LPSecurityToken {
        uint256 stakeIndex;
        uint256 amount;
        uint256 unlockTime;
        bool transferable;
        address holder;
    }

    mapping(address => StakeInfo[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    uint256 public totalStakedAmount;
    uint256 public rewardPool;

    mapping(uint256 => LPSecurityToken) public lpSecurityTokens;
    uint256 public nextLPTokenId;

    mapping(address => uint256) public slashCooldown;
    mapping(address => uint256) public slashPenaltyAccumulated;

    event Staked(address indexed user, uint256 amount, uint256 stakeIndex, StakeTier tier);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event LPSecurityTokenIssued(uint256 tokenId, address indexed holder, uint256 stakeIndex, uint256 amount);
    event SlashApplied(address indexed user, uint256 penalty, uint256 reason);
    event LPStaked(address indexed user, uint256 lpTokenId, uint256 amount);
    event LPUnstaked(address indexed user, uint256 lpTokenId, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount, StakeTier tier) external nonReentrant {
        require(amount >= MIN_STAKE_AMOUNT, "Below minimum stake");
        require(stakingToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 stakeIndex = userStakes[msg.sender].length;
        userStakes[msg.sender].push(StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            rewardDebt: 0,
            active: true,
            tier: tier,
            lpSecurityTokenId: 0
        }));

        totalStaked[msg.sender] += amount;
        totalStakedAmount += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        if (tier == StakeTier.PREMIUM || tier == StakeTier.INSTITUTIONAL) {
            _issueLPToken(msg.sender, stakeIndex, amount);
        }

        emit Staked(msg.sender, amount, stakeIndex, tier);
    }

    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        StakeInfo storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");

        uint256 elapsed = block.timestamp - userStake.startTime;
        uint256 penalty = 0;

        if (elapsed < LOCK_PERIOD) {
            penalty = (userStake.amount * EARLY_UNSTAKE_PENALTY) / 100;
        }

        uint256 reward = (userStake.amount * REWARD_RATE * elapsed) / (365 days * 100);
        uint256 returnAmount = userStake.amount - penalty;

        if (userStake.lpSecurityTokenId > 0) {
            _burnLPToken(userStake.lpSecurityTokenId);
        }

        userStake.active = false;
        totalStaked[msg.sender] -= userStake.amount;
        totalStakedAmount -= userStake.amount;

        if (returnAmount > 0) {
            stakingToken.safeTransfer(msg.sender, returnAmount);
        }
        if (reward > 0 && rewardPool >= reward) {
            rewardPool -= reward;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }

        emit Unstaked(msg.sender, returnAmount, penalty);
    }

    function claimReward(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        StakeInfo storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");

        uint256 elapsed = block.timestamp - userStake.startTime;
        uint256 reward = (userStake.amount * REWARD_RATE * elapsed) / (365 days * 100);

        require(rewardPool >= reward, "Insufficient reward pool");
        rewardPool -= reward;
        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Cannot fund with 0");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
    }

    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }

    function getUserTotalStaked(address user) external view returns (uint256) {
        return totalStaked[user];
    }

    function getStakeTier(address user, uint256 stakeIndex) external view returns (StakeTier) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        return userStakes[user][stakeIndex].tier;
    }

    function applySlash(address user, uint256 penaltyBps, uint256 reason) external onlyOwner {
        require(penaltyBps <= 1000, "Penalty too high");
        require(block.timestamp >= slashCooldown[user], "Slash cooldown active");

        uint256 userBalance = stakingToken.balanceOf(user);
        uint256 slashAmount = (userBalance * penaltyBps) / 10000;

        if (slashAmount > 0) {
            stakingToken.safeTransferFrom(user, address(this), slashAmount);
            slashPenaltyAccumulated[user] += slashAmount;
            slashCooldown[user] = block.timestamp + 7 days;

            for (uint256 i = 0; i < userStakes[user].length; i++) {
                StakeInfo storage userStake = userStakes[user][i];
                if (userStake.active && userStake.amount >= slashAmount) {
                    userStake.amount -= slashAmount;
                    totalStaked[user] -= slashAmount;
                    totalStakedAmount -= slashAmount;
                    break;
                }
            }

            emit SlashApplied(user, slashAmount, reason);
        }
    }

    function _issueLPToken(address holder, uint256 stakeIndex, uint256 amount) internal returns (uint256) {
        uint256 tokenId = nextLPTokenId++;
        lpSecurityTokens[tokenId] = LPSecurityToken({
            stakeIndex: stakeIndex,
            amount: amount,
            unlockTime: block.timestamp + LOCK_PERIOD,
            transferable: false,
            holder: holder
        });

        userStakes[holder][stakeIndex].lpSecurityTokenId = tokenId;
        emit LPSecurityTokenIssued(tokenId, holder, stakeIndex, amount);
        return tokenId;
    }

    function _burnLPToken(uint256 tokenId) internal {
        LPSecurityToken storage lpToken = lpSecurityTokens[tokenId];
        require(lpToken.holder != address(0), "LP token does not exist");
        delete lpSecurityTokens[tokenId];
        emit LPUnstaked(lpToken.holder, tokenId, lpToken.amount);
    }

    function transferLPToken(uint256 tokenId, address newHolder) external nonReentrant {
        LPSecurityToken storage lpToken = lpSecurityTokens[tokenId];
        require(lpToken.holder == msg.sender, "Not the token holder");
        require(block.timestamp >= lpToken.unlockTime, "Token still locked");
        require(lpToken.transferable == false, "Token already transferred");

        lpToken.holder = newHolder;
        lpToken.transferable = true;
        emit LPStaked(newHolder, tokenId, lpToken.amount);
    }
}
