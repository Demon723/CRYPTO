// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Native Token (Standalone Blockchain)
 * @dev Native token for LXON standalone blockchain - no ETH/ERC20 dependencies
 * This is the native currency of the LXON blockchain, similar to how ETH is native to Ethereum
 * Updated with multi-sig governance integration
 * 
 * Not Bridged, Not Wrapped. Build On LXON.
 */
contract LXONNativeToken {
    // Reentrancy protection
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    
    // Multi-sig governance
    address public multiSigWallet;
    bool public multiSigEnabled;
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
    
    modifier onlyOwnerOrMultiSig() {
        if (multiSigEnabled) {
            require(msg.sender == multiSigWallet, "Not multi-sig wallet");
        } else {
            require(msg.sender == owner, "Not owner");
        }
        _;
    }
    // Token State
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;
    
    // Token Metadata
    string public name = "LXON";
    string public symbol = "XON";
    uint8 public decimals = 18;
    
    // Supply Parameters
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion max
    uint256 public constant INITIAL_SUPPLY = 0; // Start with 0 (fair launch)
    
    // Emission Parameters (Reduced for price appreciation)
    uint256 public constant DAILY_EMISSION_INITIAL = 5_000 * 10**18; // Reduced from 13,800 (64% reduction)
    uint256 public constant EMISSION_DECLINE_RATE = 100 * 10**18; // Faster decline (doubled from 50)
    uint256 public constant EMISSION_DURATION = 10 * 365 days; // Shorter duration (reduced from 16 years)
    
    // Emission State
    uint256 public totalEmitted;
    uint256 public emissionStartTime;
    uint256 public lastEmissionDay;
    uint256 public currentDailyEmission;
    
    // Block Rewards
    uint256 public blockReward;
    uint256 public constant BASE_BLOCK_REWARD = 10 * 10**18; // 10 XON per block
    
    // Mining/Staking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => uint8) public stakingTier; // Track user's staking tier
    uint256 public totalStaked; // Track total staked amount
    
    // Tiered Staking Configuration
    enum StakingTier { NONE, TIER_1, TIER_2, TIER_3, TIER_4 }
    struct TierConfig {
        uint256 lockPeriod;
        uint256 rewardRate; // Annual percentage (e.g., 5 = 5%)
        uint256 multiplier; // Reward multiplier for enhanced staking
    }
    
    mapping(uint8 => TierConfig) public tierConfigs;
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% annual reward (legacy, for Tier 1)
    uint256 public constant STAKING_LOCK_PERIOD = 30 days; // Legacy, for Tier 1
    
    // Transaction Burn Fee (Deflationary mechanism)
    uint256 public transferBurnFee = 10; // 1% burn fee (10/1000)
    uint256 public constant BURN_FEE_DENOMINATOR = 1000;
    uint256 public totalBurned;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed to, uint256 amount, uint256 day);
    event BlockReward(address indexed miner, uint256 reward);
    event BlockRewardChanged(uint256 oldReward, uint256 newReward);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakeReward(address indexed user, uint256 reward);
    event MultiSigWalletChanged(address indexed oldWallet, address indexed newWallet);
    event MultiSigEnabled(bool enabled);
    event Burned(address indexed from, uint256 amount);
    event BurnFeeUpdated(uint256 oldFee, uint256 newFee);
    event StakingTierUpdated(address indexed user, uint8 oldTier, uint8 newTier);
    event TierConfigUpdated(uint8 tier, uint256 lockPeriod, uint256 rewardRate, uint256 multiplier);
    
    // Roles
    address public owner;
    address public mintAuthority;
    bool public paused;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyMintAuthority() {
        require(msg.sender == mintAuthority, "Not mint authority");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor(address _multiSigWallet) {
        owner = msg.sender;
        mintAuthority = msg.sender;
        multiSigWallet = _multiSigWallet;
        multiSigEnabled = _multiSigWallet != address(0);
        emissionStartTime = block.timestamp;
        currentDailyEmission = DAILY_EMISSION_INITIAL;
        blockReward = BASE_BLOCK_REWARD;
        
        // Initialize tiered staking configurations
        // Tier 1: 30 days, 5% annual, 1x multiplier (default)
        tierConfigs[1] = TierConfig(30 days, 5, 100);
        // Tier 2: 90 days, 8% annual, 1.5x multiplier
        tierConfigs[2] = TierConfig(90 days, 8, 150);
        // Tier 3: 180 days, 12% annual, 2x multiplier
        tierConfigs[3] = TierConfig(180 days, 12, 200);
        // Tier 4: 365 days, 18% annual, 3x multiplier
        tierConfigs[4] = TierConfig(365 days, 18, 300);
    }
    
    // ========== TRANSFER FUNCTIONS ==========
    
    function transfer(address to, uint256 value) external whenNotPaused returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        require(to != address(this), "Cannot transfer to contract");
        require(value <= balanceOf[msg.sender], "Insufficient balance");
        
        // Calculate and deduct burn fee
        uint256 burnAmount = (value * transferBurnFee) / BURN_FEE_DENOMINATOR;
        uint256 transferAmount = value - burnAmount;
        
        // Burn the fee portion
        if (burnAmount > 0) {
            totalSupply -= burnAmount;
            totalBurned += burnAmount;
            emit Burned(msg.sender, burnAmount);
        }
        
        // Transfer remaining amount
        balanceOf[msg.sender] -= value;
        balanceOf[to] += transferAmount;
        
        emit Transfer(msg.sender, to, transferAmount);
        return true;
    }
    
    function approve(address spender, uint256 value) external whenNotPaused returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        require(spender != msg.sender, "Cannot approve self");
        
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external whenNotPaused returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        require(to != address(0), "Cannot transfer to zero address");
        require(to != address(this), "Cannot transfer to contract");
        require(value <= balanceOf[from], "Insufficient balance");
        
        // Calculate and deduct burn fee
        uint256 burnAmount = (value * transferBurnFee) / BURN_FEE_DENOMINATOR;
        uint256 transferAmount = value - burnAmount;
        
        // Burn the fee portion
        if (burnAmount > 0) {
            totalSupply -= burnAmount;
            totalBurned += burnAmount;
            emit Burned(from, burnAmount);
        }
        
        // Transfer remaining amount
        balanceOf[from] -= value;
        balanceOf[to] += transferAmount;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, transferAmount);
        return true;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    function mint(address to, uint256 amount) external onlyMintAuthority whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_SUPPLY / 1000, "Single mint too large"); // Max 0.1% of supply per mint
        require(totalEmitted + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");
        require(to != address(this), "Cannot mint to contract");
        
        totalSupply += amount;
        totalEmitted += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit Minted(to, amount, getCurrentEmissionDay());
    }
    
    function emitDailyEmission() external onlyMintAuthority whenNotPaused {
        uint256 currentDay = getCurrentEmissionDay();
        require(currentDay > lastEmissionDay, "Already emitted today");
        
        // Calculate daily emission
        uint256 dailyEmission = calculateDailyEmission(currentDay);
        require(totalEmitted + dailyEmission <= MAX_SUPPLY, "Exceeds max supply");
        
        // Mint to mint authority for distribution
        totalSupply += dailyEmission;
        totalEmitted += dailyEmission;
        balanceOf[mintAuthority] += dailyEmission;
        
        lastEmissionDay = currentDay;
        currentDailyEmission = calculateDailyEmission(currentDay + 1);
        
        emit Transfer(address(0), mintAuthority, dailyEmission);
        emit Minted(mintAuthority, dailyEmission, currentDay);
    }
    
    function calculateDailyEmission(uint256 day) public view returns (uint256) {
        if (day >= EMISSION_DURATION / 1 days) {
            return 0; // Emission ended
        }
        
        uint256 decline = EMISSION_DECLINE_RATE * day;
        if (DAILY_EMISSION_INITIAL <= decline) {
            return 0;
        }
        
        return DAILY_EMISSION_INITIAL - decline;
    }
    
    function getCurrentEmissionDay() public view returns (uint256) {
        return (block.timestamp - emissionStartTime) / 1 days;
    }
    
    // ========== BLOCK REWARDS ==========
    
    function awardBlockReward(address miner) external onlyMintAuthority whenNotPaused {
        require(miner != address(0), "Invalid miner address");
        
        uint256 reward = blockReward;
        require(totalEmitted + reward <= MAX_SUPPLY, "Exceeds max supply");
        
        totalSupply += reward;
        totalEmitted += reward;
        balanceOf[miner] += reward;
        
        emit Transfer(address(0), miner, reward);
        emit BlockReward(miner, reward);
    }
    
    function setBlockReward(uint256 newReward) external onlyOwner {
        require(newReward <= BASE_BLOCK_REWARD * 2, "Reward too high");
        uint256 oldReward = blockReward;
        blockReward = newReward;
        emit BlockRewardChanged(oldReward, newReward);
    }
    
    function setTransferBurnFee(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Burn fee too high (max 5%)"); // Max 5% (50/1000)
        uint256 oldFee = transferBurnFee;
        transferBurnFee = newFee;
        emit BurnFeeUpdated(oldFee, newFee);
    }
    
    // ========== STAKING FUNCTIONS ==========
    
    function stake(uint256 amount) external whenNotPaused {
        _stake(amount, 1); // Default to Tier 1
    }
    
    function stakeWithTier(uint256 amount, uint8 tier) external whenNotPaused {
        _stake(amount, tier);
    }
    
    function _stake(uint256 amount, uint8 tier) internal whenNotPaused {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        require(tier >= 1 && tier <= 4, "Invalid staking tier");
        
        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        stakingTier[msg.sender] = tier;
        totalStaked += amount;
        
        emit Transfer(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
        emit StakingTierUpdated(msg.sender, stakingTier[msg.sender], tier);
    }
    
    function unstake(uint256 amount) external whenNotPaused nonReentrant {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        uint8 userTier = stakingTier[msg.sender];
        if (userTier == 0) userTier = 1; // Default to Tier 1 if not set
        TierConfig memory config = tierConfigs[userTier];
        
        require(block.timestamp >= stakingTimestamp[msg.sender] + config.lockPeriod, "Staking lock period not met");
        
        // Calculate and award staking reward based on tier
        uint256 reward = calculateStakingReward(msg.sender, amount);
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        balanceOf[msg.sender] += amount + reward;
        totalSupply += reward;
        totalEmitted += reward;
        
        // Reset tier if fully unstaked
        if (stakedBalance[msg.sender] == 0) {
            stakingTier[msg.sender] = 0;
        }
        
        emit Transfer(address(this), msg.sender, amount + reward);
        emit Unstaked(msg.sender, amount);
        emit StakeReward(msg.sender, reward);
    }
    
    function calculateStakingReward(address user, uint256 amount) public view returns (uint256) {
        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        
        uint8 userTier = stakingTier[user];
        if (userTier == 0) userTier = 1; // Default to Tier 1 if not set
        TierConfig memory config = tierConfigs[userTier];
        
        if (stakingDuration < config.lockPeriod) {
            return 0;
        }
        
        // Tiered reward calculation: (amount * rate * duration) / (365 days * 100)
        uint256 reward = (amount * config.rewardRate * stakingDuration) / (365 days * 100);
        return reward;
    }
    
    function getStakingInfo(address user) external view returns (uint256 staked, uint256 reward, uint256 canUnstake, uint8 tier, uint256 lockPeriod) {
        staked = stakedBalance[user];
        reward = calculateStakingReward(user, staked);
        
        uint8 userTier = stakingTier[user];
        if (userTier == 0) userTier = 1;
        TierConfig memory config = tierConfigs[userTier];
        
        canUnstake = block.timestamp >= stakingTimestamp[user] + config.lockPeriod ? 1 : 0;
        tier = userTier;
        lockPeriod = config.lockPeriod;
    }
    
    function upgradeStakingTier(uint8 newTier) external whenNotPaused {
        require(stakedBalance[msg.sender] > 0, "No staked balance");
        require(newTier > stakingTier[msg.sender] && newTier <= 4, "Invalid tier upgrade");
        require(newTier >= 1 && newTier <= 4, "Invalid staking tier");
        
        uint8 oldTier = stakingTier[msg.sender];
        stakingTier[msg.sender] = newTier;
        
        emit StakingTierUpdated(msg.sender, oldTier, newTier);
    }
    
    function setTierConfig(uint8 tier, uint256 lockPeriod, uint256 rewardRate, uint256 multiplier) external onlyOwner {
        require(tier >= 1 && tier <= 4, "Invalid tier");
        require(rewardRate <= 25, "Reward rate too high (max 25%)"); // Cap at 25% annual
        
        tierConfigs[tier] = TierConfig(lockPeriod, rewardRate, multiplier);
        emit TierConfigUpdated(tier, lockPeriod, rewardRate, multiplier);
    }
    
    // ========== BURN FUNCTIONS ==========
    
    function burn(uint256 value) external whenNotPaused {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        
        emit Transfer(msg.sender, address(0), value);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setOwner(address newOwner) external onlyOwnerOrMultiSig {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    function setMintAuthority(address newMintAuthority) external onlyOwnerOrMultiSig {
        require(newMintAuthority != address(0), "Invalid mint authority");
        mintAuthority = newMintAuthority;
    }
    
    function pause() external onlyOwnerOrMultiSig {
        paused = true;
    }
    
    function unpause() external onlyOwnerOrMultiSig {
        paused = false;
    }
    
    function setMultiSigWallet(address newMultiSigWallet) external onlyOwner {
        // Allow setting to zero address to disable, or any valid address to enable
        address oldWallet = multiSigWallet;
        multiSigWallet = newMultiSigWallet;
        multiSigEnabled = newMultiSigWallet != address(0);
        emit MultiSigWalletChanged(oldWallet, newMultiSigWallet);
    }
    
    function enableMultiSig() external onlyOwner {
        require(multiSigWallet != address(0), "Multi-sig wallet not set");
        multiSigEnabled = true;
        emit MultiSigEnabled(true);
    }
    
    function disableMultiSig() external onlyOwner {
        multiSigEnabled = false;
        emit MultiSigEnabled(false);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getEmissionInfo() external view returns (
        uint256 totalEmitted_,
        uint256 remaining,
        uint256 currentDay,
        uint256 dailyEmission
    ) {
        totalEmitted_ = totalEmitted;
        remaining = MAX_SUPPLY - totalEmitted;
        currentDay = getCurrentEmissionDay();
        dailyEmission = currentDailyEmission;
    }
    
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
    
    // ========== ENHANCED INTEGRATION FUNCTIONS ==========
    
    /**
     * @notice Add additional mint authority for enhanced ecosystem
     * @dev Allows multiple contracts to mint tokens (phygital bridge, stellar tokenomics, etc.)
     */
    mapping(address => bool) public additionalMintAuthorities;
    
    modifier onlyMintAuthorityOrAdditional() {
        require(
            msg.sender == mintAuthority || additionalMintAuthorities[msg.sender],
            "Not mint authority"
        );
        _;
    }
    
    function addMintAuthority(address authority) external onlyOwner {
        require(authority != address(0), "Invalid authority");
        additionalMintAuthorities[authority] = true;
    }
    
    function removeMintAuthority(address authority) external onlyOwner {
        additionalMintAuthorities[authority] = false;
    }
    
    /**
     * @notice Enhanced mint function for ecosystem rewards
     * @dev Used by phygital bridge, stellar tokenomics, and other ecosystem components
     */
    function mintEcosystemReward(address to, uint256 amount, string memory source) external onlyMintAuthorityOrAdditional whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(totalEmitted + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply += amount;
        totalEmitted += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit Minted(to, amount, getCurrentEmissionDay());
    }
    
    /**
     * @notice Calculate enhanced staking rewards with multipliers
     * @dev Supports stellar evolution multipliers and phygital bonuses
     */
    function calculateEnhancedStakingReward(address user, uint256 amount, uint256 multiplier) public view returns (uint256) {
        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        if (stakingDuration < STAKING_LOCK_PERIOD) {
            return 0;
        }
        
        // Enhanced calculation: (amount * rate * duration * multiplier) / (365 days * 100)
        uint256 baseReward = (amount * STAKING_REWARD_RATE * stakingDuration) / (365 days * 100);
        uint256 enhancedReward = (baseReward * multiplier) / 100;
        
        return enhancedReward;
    }
    
    /**
     * @notice Enhanced unstake with multiplier support
     */
    function unstakeEnhanced(uint256 amount, uint256 multiplier) external whenNotPaused nonReentrant {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + STAKING_LOCK_PERIOD, "Staking lock period not met");
        
        uint256 reward = calculateEnhancedStakingReward(msg.sender, amount, multiplier);
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        balanceOf[msg.sender] += amount + reward;
        totalSupply += reward;
        totalEmitted += reward;
        
        emit Transfer(address(this), msg.sender, amount + reward);
        emit Unstaked(msg.sender, amount);
        emit StakeReward(msg.sender, reward);
    }
    
    /**
     * @notice Get ecosystem integration status
     */
    function getIntegrationStatus() external view returns (
        bool hasAdditionalAuthorities,
        uint256 authorityCount,
        uint256 currentEmissionDay,
        uint256 remainingSupply
    ) {
        uint256 count = 0;
        if (additionalMintAuthorities[mintAuthority]) count++;
        // In production, would count all authorities
        
        return (
            true, // Simplified
            count,
            getCurrentEmissionDay(),
            MAX_SUPPLY - totalEmitted
        );
    }
}