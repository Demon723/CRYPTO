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

    uint256 public constant REWARD_RATE = 12; // 12% annual
    uint256 public constant LOCK_PERIOD = 30 days;
    uint256 public constant EARLY_UNSTAKE_PENALTY = 10; // 10% penalty

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
        bool active;
    }

    mapping(address => StakeInfo[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    uint256 public totalStakedAmount;
    uint256 public rewardPool;

    event Staked(address indexed user, uint256 amount, uint256 stakeIndex);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(stakingToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 stakeIndex = userStakes[msg.sender].length;
        userStakes[msg.sender].push(StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            rewardDebt: 0,
            active: true
        }));

        totalStaked[msg.sender] += amount;
        totalStakedAmount += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, stakeIndex);
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
}
