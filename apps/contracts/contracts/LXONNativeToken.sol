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
    
    // Emission Parameters
    uint256 public constant DAILY_EMISSION_INITIAL = 13_800 * 10**18;
    uint256 public constant EMISSION_DECLINE_RATE = 50 * 10**18;
    uint256 public constant EMISSION_DURATION = 16 * 365 days;
    
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
    uint256 public totalStaked; // Track total staked amount
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% annual reward
    uint256 public constant STAKING_LOCK_PERIOD = 30 days;
    
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
    }
    
    // ========== TRANSFER FUNCTIONS ==========
    
    function transfer(address to, uint256 value) external whenNotPaused returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        require(to != address(this), "Cannot transfer to contract");
        require(value <= balanceOf[msg.sender], "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
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
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
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
        require(newReward <= 100 * 10**18, "Block reward too high"); // Max 100 XON
        require(newReward >= 1 * 10**18, "Block reward too low"); // Min 1 XON
        uint256 oldReward = blockReward;
        blockReward = newReward;
        emit BlockRewardChanged(oldReward, newReward);
    }
    
    // ========== STAKING FUNCTIONS ==========
    
    function stake(uint256 amount) external whenNotPaused {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        emit Transfer(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external whenNotPaused nonReentrant {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + STAKING_LOCK_PERIOD, "Staking lock period not met");
        
        // Calculate and award staking reward
        uint256 reward = calculateStakingReward(msg.sender, amount);
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        balanceOf[msg.sender] += amount + reward;
        totalSupply += reward;
        totalEmitted += reward;
        
        emit Transfer(address(this), msg.sender, amount + reward);
        emit Unstaked(msg.sender, amount);
        emit StakeReward(msg.sender, reward);
    }
    
    function calculateStakingReward(address user, uint256 amount) public view returns (uint256) {
        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        if (stakingDuration < STAKING_LOCK_PERIOD) {
            return 0;
        }
        
        // Simple reward calculation: (amount * rate * duration) / (365 days * 100)
        uint256 reward = (amount * STAKING_REWARD_RATE * stakingDuration) / (365 days * 100);
        return reward;
    }
    
    function getStakingInfo(address user) external view returns (uint256 staked, uint256 reward, uint256 canUnstake) {
        staked = stakedBalance[user];
        reward = calculateStakingReward(user, staked);
        canUnstake = block.timestamp >= stakingTimestamp[user] + STAKING_LOCK_PERIOD ? 1 : 0;
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
}