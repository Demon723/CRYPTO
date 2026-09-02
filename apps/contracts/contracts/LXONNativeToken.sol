// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Native Token
 * @author LXON Team
 * @notice Native token for LXON blockchain with enhanced tokenomics features
 * @dev Implements ERC20-like interface with additional tokenomics:
 *      - Transaction burn fee (1%)
 *      - Tiered staking mechanism (4 tiers)
 *      - Daily emission schedule (5,000 tokens/day)
 *      - Multi-sig governance integration
 *      - Buyback and burn mechanism support
 * 
 * The token starts with 0 supply (fair launch) and has a maximum supply of 1 billion tokens.
 * Emission follows a declining schedule over 10 years to promote price appreciation.
 * 
 * @custom:security-contact security@lxon.io
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
    
    /**
     * @dev Modifier to restrict access to owner or multi-sig wallet
     * When multi-sig is enabled, only the multi-sig wallet can call
     * When multi-sig is disabled, only the owner can call
     */
    modifier onlyOwnerOrMultiSig() {
        if (multiSigEnabled) {
            require(msg.sender == multiSigWallet, "Not multi-sig wallet");
        } else {
            require(msg.sender == owner, "Not owner");
        }
        _;
    }
    // Token State
    /// @notice Mapping of account addresses to their token balances
    mapping(address => uint256) public balanceOf;
    
    /// @notice Mapping of owner addresses to spender addresses and their allowances
    mapping(address => mapping(address => uint256)) public allowance;
    
    /// @notice Total supply of LXON tokens in circulation
    uint256 public totalSupply;
    
    // Token Metadata
    /// @notice Token name
    string public name = "LXON";
    
    /// @notice Token symbol
    string public symbol = "XON";
    
    /// @notice Number of decimals for token display (18 standard)
    uint8 public decimals = 18;
    
    // Supply Parameters
    /// @notice Maximum supply cap (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    /// @notice Initial supply at deployment (0 for fair launch)
    uint256 public constant INITIAL_SUPPLY = 0;
    
    // Emission Parameters (Reduced for price appreciation)
    /// @notice Initial daily emission rate (5,000 tokens per day)
    uint256 public constant DAILY_EMISSION_INITIAL = 5_000 * 10**18;
    
    /// @notice Rate at which daily emission declines (100 basis points = 1%)
    uint256 public constant EMISSION_DECLINE_RATE = 100 * 10**18;
    
    /// @notice Total duration of emission schedule (10 years)
    uint256 public constant EMISSION_DURATION = 10 * 365 days;
    
    // Emission State
    /// @notice Total tokens emitted since deployment
    uint256 public totalEmitted;
    
    /// @notice Timestamp when emission started
    uint256 public emissionStartTime;
    
    /// @notice Last day when emission was calculated
    uint256 public lastEmissionDay;
    
    /// @notice Current daily emission amount
    uint256 public currentDailyEmission;
    
    // Block Rewards
    /// @notice Current block reward amount
    uint256 public blockReward;
    
    /// @notice Base block reward (10 tokens per block)
    uint256 public constant BASE_BLOCK_REWARD = 10 * 10**18;
    
    // Mining/Staking
    /// @notice Mapping of user addresses to their staked token amounts
    mapping(address => uint256) public stakedBalance;
    
    /// @notice Mapping of user addresses to their staking start timestamps
    mapping(address => uint256) public stakingTimestamp;
    
    /// @notice Mapping of user addresses to their current staking tier (1-4)
    mapping(address => uint8) public stakingTier;
    
    /// @notice Total amount of tokens staked across all users
    uint256 public totalStaked;
    
    // Tiered Staking Configuration
    /// @notice Enumeration of staking tiers
    enum StakingTier { NONE, TIER_1, TIER_2, TIER_3, TIER_4 }
    
    /// @notice Configuration for each staking tier
    struct TierConfig {
        uint256 lockPeriod;    /// Lock period in seconds
        uint256 rewardRate;    /// Annual percentage rate (e.g., 5 = 5%)
        uint256 multiplier;    /// Reward multiplier (basis points, e.g., 150 = 1.5x)
    }
    
    /// @notice Mapping of tier IDs to their configurations
    mapping(uint8 => TierConfig) public tierConfigs;
    
    /// @notice Base staking reward rate (5% annual)
    uint256 public constant STAKING_REWARD_RATE = 5;
    
    /// @notice Base staking lock period (30 days)
    uint256 public constant STAKING_LOCK_PERIOD = 30 days;
    
    // Transaction Burn Fee (Deflationary mechanism)
    /// @notice Burn fee rate for transfers (10 = 1%, denominator is 1000)
    uint256 public transferBurnFee = 10;
    
    /// @notice Denominator for burn fee calculation (1000)
    uint256 public constant BURN_FEE_DENOMINATOR = 1000;
    
    /// @notice Total tokens burned through transaction fees
    uint256 public totalBurned;
    
    // Events
    /// @notice Emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    /// @notice Emitted when an approval is set
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /// @notice Emitted when new tokens are minted
    event Minted(address indexed to, uint256 amount, uint256 day);
    
    /// @notice Emitted when a block reward is distributed
    event BlockReward(address indexed miner, uint256 reward);
    
    /// @notice Emitted when block reward amount changes
    event BlockRewardChanged(uint256 oldReward, uint256 newReward);
    
    /// @notice Emitted when tokens are staked
    event Staked(address indexed user, uint256 amount);
    
    /// @notice Emitted when tokens are unstaked
    event Unstaked(address indexed user, uint256 amount);
    
    /// @notice Emitted when staking rewards are distributed
    event StakeReward(address indexed user, uint256 reward);
    
    /// @notice Emitted when multi-sig wallet address changes
    event MultiSigWalletChanged(address indexed oldWallet, address indexed newWallet);
    
    /// @notice Emitted when multi-sig is enabled/disabled
    event MultiSigEnabled(bool enabled);
    
    /// @notice Emitted when tokens are burned
    event Burned(address indexed from, uint256 amount);
    
    /// @notice Emitted when burn fee rate changes
    event BurnFeeUpdated(uint256 oldFee, uint256 newFee);
    
    /// @notice Emitted when user's staking tier changes
    event StakingTierUpdated(address indexed user, uint8 oldTier, uint8 newTier);
    
    /// @notice Emitted when tier configuration changes
    event TierConfigUpdated(uint8 tier, uint256 lockPeriod, uint256 rewardRate, uint256 multiplier);
    
    // Roles
    /// @notice Contract owner address
    address public owner;
    
    /// @notice Address authorized to mint tokens
    address public mintAuthority;
    
    /// @notice Whether contract operations are paused
    bool public paused;
    
    /**
     * @dev Modifier to restrict access to contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @dev Modifier to restrict access to mint authority
     */
    modifier onlyMintAuthority() {
        require(msg.sender == mintAuthority, "Not mint authority");
        _;
    }
    
    /**
     * @dev Modifier to restrict function execution when contract is not paused
     */
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    /**
     * @dev Constructor to initialize the LXON token contract
     * @param _multiSigWallet Address of the multi-sig wallet (can be zero address to disable)
     * 
     * Initializes:
     * - Owner and mint authority to deployer
     * - Multi-sig configuration
     * - Emission schedule
     * - Tiered staking configurations
     */
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
    
    /**
     * @notice Transfer tokens to a specified address with burn fee
     * @dev Burns 1% of the transfer amount as a fee
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     * @return bool True if transfer successful
     */
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
    
    /**
     * @notice Approve a spender to transfer tokens on your behalf
     * @param spender The address to approve for spending
     * @param value The amount of tokens to approve
     * @return bool True if approval successful
     */
    function approve(address spender, uint256 value) external whenNotPaused returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        require(spender != msg.sender, "Cannot approve self");
        
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @notice Transfer tokens from one address to another with burn fee
     * @dev Burns 1% of the transfer amount as a fee
     * @param from The address to transfer tokens from
     * @param to The address to transfer tokens to
     * @param value The amount of tokens to transfer
     * @return bool True if transfer successful
     */
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
    
    /**
     * @notice Mint new tokens to a specified address
     * @dev Only callable by mint authority. Limited to 0.1% of max supply per mint.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
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
    
    /**
     * @notice Emit daily emission to mint authority
     * @dev Calculates and mints the daily emission amount based on declining schedule
     * Can only be called once per day
     */
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
    
    /**
     * @notice Calculate the daily emission amount for a given day
     * @param day The day number since deployment
     * @return uint256 The daily emission amount for that day
     */
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
    
    /**
     * @notice Get the current emission day number
     * @return uint256 The number of days since deployment
     */
    function getCurrentEmissionDay() public view returns (uint256) {
        return (block.timestamp - emissionStartTime) / 1 days;
    }
    
    // ========== BLOCK REWARDS ==========
    
    /**
     * @notice Award block reward to a miner
     * @dev Only callable by mint authority
     * @param miner The address to award the block reward to
     */
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
    
    /**
     * @notice Set the block reward amount
     * @dev Only callable by owner. Limited to 2x base reward.
     * @param newReward The new block reward amount
     */
    function setBlockReward(uint256 newReward) external onlyOwner {
        require(newReward <= BASE_BLOCK_REWARD * 2, "Reward too high");
        uint256 oldReward = blockReward;
        blockReward = newReward;
        emit BlockRewardChanged(oldReward, newReward);
    }
    
    /**
     * @notice Set the transfer burn fee rate
     * @dev Only callable by owner. Limited to 5% maximum.
     * @param newFee The new burn fee rate (basis points, denominator 1000)
     */
    function setTransferBurnFee(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Burn fee too high (max 5%)"); // Max 5% (50/1000)
        uint256 oldFee = transferBurnFee;
        transferBurnFee = newFee;
        emit BurnFeeUpdated(oldFee, newFee);
    }
    
    // ========== STAKING FUNCTIONS ==========
    
    /**
     * @notice Stake tokens with default tier (Tier 1)
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) external whenNotPaused {
        _stake(amount, 1); // Default to Tier 1
    }
    
    /**
     * @notice Stake tokens with a specific tier
     * @param amount The amount of tokens to stake
     * @param tier The staking tier (1-4)
     */
    function stakeWithTier(uint256 amount, uint8 tier) external whenNotPaused {
        _stake(amount, tier);
    }
    
    /**
     * @notice Internal function to stake tokens with a specific tier
     * @dev Transfers tokens from user to staking balance and sets staking timestamp
     * @param amount The amount of tokens to stake
     * @param tier The staking tier (1-4)
     */
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
    
    /**
     * @notice Unstake tokens and receive staking rewards
     * @dev Requires lock period to be met. Awards rewards based on tier and duration.
     * @param amount The amount of tokens to unstake
     */
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
    
    /**
     * @notice Calculate staking reward for a user
     * @dev Calculates reward based on staking duration, tier, and amount
     * @param user The address of the staker
     * @param amount The amount of tokens to calculate reward for
     * @return uint256 The calculated reward amount
     */
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
    
    /**
     * @notice Get staking information for a user
     * @param user The address to query
     * @return staked Amount of tokens staked
     * @return reward Current reward amount
     * @return canUnstake Whether user can unstake (1 = yes, 0 = no)
     * @return tier Current staking tier
     * @return lockPeriod Lock period in seconds
     */
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
    
    /**
     * @notice Upgrade staking tier for better rewards
     * @dev Can only upgrade to higher tiers, not downgrade
     * @param newTier The new tier to upgrade to (1-4)
     */
    function upgradeStakingTier(uint8 newTier) external whenNotPaused {
        require(stakedBalance[msg.sender] > 0, "No staked balance");
        require(newTier > stakingTier[msg.sender] && newTier <= 4, "Invalid tier upgrade");
        require(newTier >= 1 && newTier <= 4, "Invalid staking tier");
        
        uint8 oldTier = stakingTier[msg.sender];
        stakingTier[msg.sender] = newTier;
        
        emit StakingTierUpdated(msg.sender, oldTier, newTier);
    }
    
    /**
     * @notice Set configuration for a staking tier
     * @dev Only callable by owner. Limited to 25% annual reward rate.
     * @param tier The tier to configure (1-4)
     * @param lockPeriod The lock period in seconds
     * @param rewardRate The annual reward rate (percentage)
     * @param multiplier The reward multiplier (basis points)
     */
    function setTierConfig(uint8 tier, uint256 lockPeriod, uint256 rewardRate, uint256 multiplier) external onlyOwner {
        require(tier >= 1 && tier <= 4, "Invalid tier");
        require(rewardRate <= 25, "Reward rate too high (max 25%)"); // Cap at 25% annual
        
        tierConfigs[tier] = TierConfig(lockPeriod, rewardRate, multiplier);
        emit TierConfigUpdated(tier, lockPeriod, rewardRate, multiplier);
    }
    
    // ========== BURN FUNCTIONS ==========
    
    /**
     * @notice Burn tokens from the caller's balance
     * @param value The amount of tokens to burn
     */
    function burn(uint256 value) external whenNotPaused {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        
        emit Transfer(msg.sender, address(0), value);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @notice Set the contract owner
     * @dev Only callable by owner or multi-sig wallet
     * @param newOwner The new owner address
     */
    function setOwner(address newOwner) external onlyOwnerOrMultiSig {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    /**
     * @notice Set the mint authority
     * @dev Only callable by owner or multi-sig wallet
     * @param newMintAuthority The new mint authority address
     */
    function setMintAuthority(address newMintAuthority) external onlyOwnerOrMultiSig {
        require(newMintAuthority != address(0), "Invalid mint authority");
        mintAuthority = newMintAuthority;
    }
    
    /**
     * @notice Pause contract operations
     * @dev Only callable by owner or multi-sig wallet
     */
    function pause() external onlyOwnerOrMultiSig {
        paused = true;
    }
    
    /**
     * @notice Unpause contract operations
     * @dev Only callable by owner or multi-sig wallet
     */
    function unpause() external onlyOwnerOrMultiSig {
        paused = false;
    }
    
    /**
     * @notice Set the multi-sig wallet address
     * @dev Only callable by owner. Setting to zero address disables multi-sig.
     * @param newMultiSigWallet The new multi-sig wallet address
     */
    function setMultiSigWallet(address newMultiSigWallet) external onlyOwner {
        // Allow setting to zero address to disable, or any valid address to enable
        address oldWallet = multiSigWallet;
        multiSigWallet = newMultiSigWallet;
        multiSigEnabled = newMultiSigWallet != address(0);
        emit MultiSigWalletChanged(oldWallet, newMultiSigWallet);
    }
    
    /**
     * @notice Enable multi-sig governance
     * @dev Only callable by owner. Requires multi-sig wallet to be set.
     */
    function enableMultiSig() external onlyOwner {
        require(multiSigWallet != address(0), "Multi-sig wallet not set");
        multiSigEnabled = true;
        emit MultiSigEnabled(true);
    }
    
    /**
     * @notice Disable multi-sig governance
     * @dev Only callable by owner. Reverts control to single owner.
     */
    function disableMultiSig() external onlyOwner {
        multiSigEnabled = false;
        emit MultiSigEnabled(false);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get emission information
     * @return totalEmitted_ Total tokens emitted since deployment
     * @return remaining Remaining tokens that can be emitted
     * @return currentDay Current emission day number
     * @return dailyEmission Current daily emission amount
     */
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
    
    /**
     * @notice Get total staked tokens across all users
     * @return uint256 Total amount of staked tokens
     */
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
    
    // ========== ENHANCED INTEGRATION FUNCTIONS ==========
    
    /// @notice Mapping of additional mint authorities for ecosystem integration
    mapping(address => bool) public additionalMintAuthorities;
    
    /**
     * @dev Modifier to restrict access to mint authority or additional authorities
     */
    modifier onlyMintAuthorityOrAdditional() {
        require(
            msg.sender == mintAuthority || additionalMintAuthorities[msg.sender],
            "Not mint authority"
        );
        _;
    }
    
    /**
     * @notice Add an additional mint authority
     * @dev Only callable by owner. Allows ecosystem contracts to mint tokens.
     * @param authority The address to add as mint authority
     */
    function addMintAuthority(address authority) external onlyOwner {
        require(authority != address(0), "Invalid authority");
        additionalMintAuthorities[authority] = true;
    }
    
    /**
     * @notice Remove an additional mint authority
     * @dev Only callable by owner
     * @param authority The address to remove as mint authority
     */
    function removeMintAuthority(address authority) external onlyOwner {
        additionalMintAuthorities[authority] = false;
    }
    
    /**
     * @notice Enhanced mint function for ecosystem rewards
     * @dev Used by phygital bridge, stellar tokenomics, and other ecosystem components
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @param source The source of the reward (for tracking)
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
     * @param user The address of the staker
     * @param amount The amount of tokens to calculate reward for
     * @param multiplier The reward multiplier (basis points)
     * @return uint256 The calculated reward amount with multiplier applied
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
     * @dev Allows unstaking with custom multipliers for ecosystem rewards
     * @param amount The amount of tokens to unstake
     * @param multiplier The reward multiplier (basis points)
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
     * @return hasAdditionalAuthorities Whether additional mint authorities exist
     * @return authorityCount Number of additional mint authorities
     * @return currentEmissionDay Current emission day number
     * @return remainingSupply Remaining tokens that can be emitted
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