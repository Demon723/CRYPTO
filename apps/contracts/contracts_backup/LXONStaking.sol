// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LXONStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable lxonToken;
    
    uint256 public constant MIN_STAKE = 1000 * 10**18;
    uint256 public constant MAX_STAKE = 1_000_000 * 10**18;
    uint256 public rewardPool;
    uint256 public totalStakedAmount;
    
    struct StakePosition {
        address user;
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 tier;
        bool active;
        uint256 claimedReward;
    }
    
    struct LPSecurityToken {
        address holder;
        uint256 amount;
    }
    
    mapping(address => uint256) public totalStaked;
    mapping(uint256 => StakePosition) public stakes;
    mapping(uint256 => LPSecurityToken) public lpSecurityTokens;
    uint256 public nextStakeId;
    
    event Staked(address indexed user, uint256 amount, uint256 tier, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardPoolFunded(uint256 amount);
    event SlashApplied(address indexed user, uint256 amount, uint256 newTier);
    event LPSecurityTokenIssued(address indexed user, uint256 amount);
    
    constructor(address _lxonToken) Ownable(msg.sender) {
        require(_lxonToken != address(0), "Zero address");
        lxonToken = IERC20(_lxonToken);
    }
    
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero amount");
        lxonToken.transferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(amount);
    }
    
    function stake(uint256 amount, uint256 tier) external nonReentrant {
        require(amount >= MIN_STAKE, "Below minimum stake");
        require(amount <= MAX_STAKE, "Above maximum");
        require(tier < 3, "Invalid tier");
        
        lxonToken.transferFrom(msg.sender, address(this), amount);
        
        uint256 lockPeriod = tier == 2 ? 365 * 24 * 60 * 60 : 
                            tier == 1 ? 90 * 24 * 60 * 60 : 
                            30 * 24 * 60 * 60;
        
        uint256 stakeId = nextStakeId++;
        stakes[stakeId] = StakePosition({
            user: msg.sender,
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            tier: tier,
            active: true,
            claimedReward: 0
        });
        
        totalStaked[msg.sender] += amount;
        totalStakedAmount += amount;
        
        emit Staked(msg.sender, amount, tier, 0);
        
        if (tier == 1) {
            lpSecurityTokens[stakeId] = LPSecurityToken({holder: msg.sender, amount: amount});
            emit LPSecurityTokenIssued(msg.sender, amount);
        }
    }
    
    function unstake(uint256 stakeId) external nonReentrant {
        StakePosition storage pos = stakes[stakeId];
        require(pos.active, "No active stake");
        require(pos.user == msg.sender, "Not your stake");
        
        uint256 penalty = 0;
        if (block.timestamp < pos.startTime + pos.lockPeriod) {
            penalty = pos.amount / 10;
        }
        
        uint256 payout = pos.amount - penalty;
        totalStaked[msg.sender] -= pos.amount;
        totalStakedAmount -= pos.amount;
        pos.active = false;
        
        lxonToken.transfer(msg.sender, payout);
        emit Unstaked(msg.sender, payout, penalty);
    }
    
    function claimReward(uint256 stakeId) external {
        StakePosition storage pos = stakes[stakeId];
        require(pos.active, "No active stake");
        require(pos.user == msg.sender, "Not your stake");
        
        uint256 reward = calculateReward(stakeId);
        require(reward > 0, "No reward");
        require(rewardPool >= reward, "Insufficient reward pool");
        
        pos.claimedReward += reward;
        rewardPool -= reward;
        lxonToken.transfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }
    
    function calculateReward(uint256 stakeId) public view returns (uint256) {
        StakePosition memory pos = stakes[stakeId];
        if (!pos.active) return 0;
        
        uint256 elapsed = block.timestamp - pos.startTime;
        uint256 multiplier = pos.tier == 2 ? 150 : pos.tier == 1 ? 125 : 100;
        return (pos.amount * elapsed * multiplier) / (365 * 24 * 60 * 60 * 100);
    }
    
    function applySlash(address user, uint256 bps, uint256 tier) external onlyOwner {
        require(bps <= 1000, "Penalty too high");
        uint256 userBalance = lxonToken.balanceOf(user);
        uint256 slashAmount = (userBalance * bps) / 10000;
        
        require(slashAmount > 0, "No balance");
        lxonToken.transferFrom(user, owner(), slashAmount);
        emit SlashApplied(user, slashAmount, tier);
    }
}
