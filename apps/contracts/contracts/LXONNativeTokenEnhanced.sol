// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONChipRegistry.sol";
import "./LXONCardRegistry.sol";
import "./LXONTBAccount.sol";

/**
 * @title LXON Native Token Enhanced (Standalone Blockchain)
 * @dev Enhanced native token with phygital features from Helios architecture
 * Combines standalone blockchain with physical-digital binding
 */
contract LXONNativeTokenEnhanced {
    // Token State
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;
    
    // Token Metadata
    string public name = "LXON";
    string public symbol = "XON";
    uint8 public decimals = 18;
    
    // Supply Parameters
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant INITIAL_SUPPLY = 0;
    
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
    uint256 public constant BASE_BLOCK_REWARD = 10 * 10**18;
    
    // Staking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant STAKING_REWARD_RATE = 5;
    uint256 public constant STAKING_LOCK_PERIOD = 30 days;
    
    // Phygital Features (Helios-inspired)
    LXONChipRegistry public chipRegistry;
    LXONCardRegistry public cardRegistry;
    
    // Token lifecycle states
    enum TokenStatus { INACTIVE, ACTIVE, FROZEN, DEACTIVATED }
    mapping(uint256 => TokenStatus) public tokenStatus;
    mapping(uint256 => uint256) public tapCount;
    mapping(uint256 => uint256) public lastTapTime;
    
    // Chip binding
    mapping(uint256 => uint256) public chipIdByTokenId;
    mapping(uint256 => uint256) public tokenIdByChipId;
    
    // Wallet binding
    mapping(uint256 => address) public boundWallet;
    mapping(address => uint256) public walletOwnerTokenId;
    
    // Token Bound Accounts
    mapping(uint256 => address) public tbaByTokenId;
    
    // Tier system (stellar evolution)
    enum Tier { GENESIS, SOLAR, MAIN_SEQUENCE, RED_GIANT, SUPERNOVA }
    mapping(uint256 => Tier) public tokenTier;
    
    // Admin
    address public owner;
    address public mintAuthority;
    address public founder;
    bool public paused;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed to, uint256 amount, uint256 day);
    event BlockReward(address indexed miner, uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakeReward(address indexed user, uint256 reward);
    
    // Phygital events
    event TokenActivated(uint256 indexed tokenId, uint256 chipId);
    event TokenFrozen(uint256 indexed tokenId);
    event TokenDeactivated(uint256 indexed tokenId);
    event ChipBound(uint256 indexed tokenId, uint256 indexed chipId);
    event WalletBound(uint256 indexed tokenId, address indexed wallet);
    event TBAccountCreated(uint256 indexed tokenId, address indexed tba);
    event TokenTapped(uint256 indexed tokenId, uint256 tapCount);
    event TierAssigned(uint256 indexed tokenId, Tier tier);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyFounder() {
        require(msg.sender == founder, "Not founder");
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
    
    modifier whenTokenActive(uint256 tokenId) {
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        _;
    }
    
    modifier onlyPremium(uint256 tokenId) {
        Tier tier = tokenTier[tokenId];
        require(tier == Tier.GENESIS || tier == Tier.SUPERNOVA, "Not premium tier");
        _;
    }
    
    constructor(address _chipRegistry, address _cardRegistry) {
        owner = msg.sender;
        founder = msg.sender;
        mintAuthority = msg.sender;
        emissionStartTime = block.timestamp;
        currentDailyEmission = DAILY_EMISSION_INITIAL;
        blockReward = BASE_BLOCK_REWARD;
        
        chipRegistry = LXONChipRegistry(_chipRegistry);
        cardRegistry = LXONCardRegistry(_cardRegistry);
    }
    
    // ========== TRANSFER FUNCTIONS ==========
    
    function transfer(address to, uint256 value) external whenNotPaused returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external whenNotPaused returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external whenNotPaused returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Allowance exceeded");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    function mint(address to, uint256 value) external onlyMintAuthority whenNotPaused {
        require(totalEmitted + value <= MAX_SUPPLY, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply += value;
        totalEmitted += value;
        balanceOf[to] += value;
        
        emit Transfer(address(0), to, value);
        emit Minted(to, value, getCurrentEmissionDay());
    }
    
    function emitDailyEmission() external onlyMintAuthority whenNotPaused {
        uint256 currentDay = getCurrentEmissionDay();
        require(currentDay > lastEmissionDay, "Already emitted today");
        
        uint256 dailyEmission = calculateDailyEmission(currentDay);
        require(totalEmitted + dailyEmission <= MAX_SUPPLY, "Exceeds max supply");
        
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
            return 0;
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
        blockReward = newReward;
    }
    
    // ========== STAKING FUNCTIONS ==========
    
    function stake(uint256 amount) external whenNotPaused {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Transfer(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external whenNotPaused {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + STAKING_LOCK_PERIOD, "Staking lock period not met");
        
        uint256 reward = calculateStakingReward(msg.sender, amount);
        
        stakedBalance[msg.sender] -= amount;
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
        
        uint256 reward = (amount * STAKING_REWARD_RATE * stakingDuration) / (365 days * 100);
        return reward;
    }
    
    // ========== BURN FUNCTIONS ==========
    
    function burn(uint256 value) external whenNotPaused {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        totalSupply -= value;
        balanceOf[msg.sender] -= value;
        
        emit Transfer(msg.sender, address(0), value);
    }
    
    // ========== PHYGITAL FUNCTIONS ==========
    
    /**
     * @notice Activate a token with chip binding (founder only)
     * @param tokenId The token ID
     * @param chipId The chip ID to bind
     */
    function activateToken(uint256 tokenId, uint256 chipId) external onlyFounder {
        require(tokenStatus[tokenId] == TokenStatus.INACTIVE, "Token already active");
        require(chipRegistry.isChipValid(chipId), "Invalid chip");
        require(tokenIdByChipId[chipId] == 0, "Chip already bound");
        
        tokenStatus[tokenId] = TokenStatus.ACTIVE;
        chipIdByTokenId[tokenId] = chipId;
        tokenIdByChipId[chipId] = tokenId;
        
        emit TokenActivated(tokenId, chipId);
        emit ChipBound(tokenId, chipId);
    }
    
    /**
     * @notice Bind a wallet to a token (chip signature required)
     * @param tokenId The token ID
     * @param wallet The wallet address
     * @param signature The chip signature
     */
    function bindWallet(uint256 tokenId, address wallet, bytes memory signature) external whenTokenActive(tokenId) {
        uint256 chipId = chipIdByTokenId[tokenId];
        require(chipId > 0, "No chip bound");
        require(_verifyChipSignature(chipId, wallet, signature), "Invalid signature");
        require(boundWallet[tokenId] == address(0), "Wallet already bound");
        
        boundWallet[tokenId] = wallet;
        walletOwnerTokenId[wallet] = tokenId;
        
        emit WalletBound(tokenId, wallet);
    }
    
    /**
     * @notice Create TBA for premium token (founder only)
     * @param tokenId The token ID
     */
    function createTBA(uint256 tokenId) external onlyFounder onlyPremium(tokenId) {
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        require(tbaByTokenId[tokenId] == address(0), "TBA already exists");
        
        LXONTBAccount tba = new LXONTBAccount(address(this), tokenId, address(this));
        tbaByTokenId[tokenId] = address(tba);
        
        emit TBAccountCreated(tokenId, address(tba));
    }
    
    /**
     * @notice Record a tap interaction (chip signature required)
     * @param tokenId The token ID
     * @param signature The chip signature
     */
    function recordTap(uint256 tokenId, bytes memory signature) external whenTokenActive(tokenId) {
        uint256 chipId = chipIdByTokenId[tokenId];
        require(chipId > 0, "No chip bound");
        require(_verifyChipSignature(chipId, msg.sender, signature), "Invalid signature");
        
        tapCount[tokenId]++;
        lastTapTime[tokenId] = block.timestamp;
        
        emit TokenTapped(tokenId, tapCount[tokenId]);
    }
    
    /**
     * @notice Assign tier to token (founder only)
     * @param tokenId The token ID
     * @param tier The tier to assign
     */
    function assignTier(uint256 tokenId, Tier tier) external onlyFounder {
        tokenTier[tokenId] = tier;
        emit TierAssigned(tokenId, tier);
    }
    
    /**
     * @notice Freeze a token (founder only)
     * @param tokenId The token ID
     */
    function freezeToken(uint256 tokenId) external onlyFounder {
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        tokenStatus[tokenId] = TokenStatus.FROZEN;
        emit TokenFrozen(tokenId);
    }
    
    /**
     * @notice Deactivate a token (founder only)
     * @param tokenId The token ID
     */
    function deactivateToken(uint256 tokenId) external onlyFounder {
        require(tokenStatus[tokenId] != TokenStatus.DEACTIVATED, "Token already deactivated");
        
        tokenStatus[tokenId] = TokenStatus.DEACTIVATED;
        
        // Clear bindings
        uint256 chipId = chipIdByTokenId[tokenId];
        if (chipId > 0) {
            tokenIdByChipId[chipId] = 0;
            chipIdByTokenId[tokenId] = 0;
        }
        
        address wallet = boundWallet[tokenId];
        if (wallet != address(0)) {
            walletOwnerTokenId[wallet] = 0;
            boundWallet[tokenId] = address(0);
        }
        
        emit TokenDeactivated(tokenId);
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function _verifyChipSignature(uint256 chipId, address wallet, bytes memory signature) internal view returns (bool) {
        // Simplified signature verification
        // In production, this would use proper ECDSA verification
        return signature.length > 0;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    function setFounder(address newFounder) external onlyOwner {
        require(newFounder != address(0), "Invalid founder address");
        founder = newFounder;
    }
    
    function setMintAuthority(address newMintAuthority) external onlyOwner {
        require(newMintAuthority != address(0), "Invalid mint authority");
        mintAuthority = newMintAuthority;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
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
    
    function getTokenInfo(uint256 tokenId) external view returns (
        TokenStatus status,
        uint256 chipId,
        address wallet,
        address tba,
        Tier tier,
        uint256 taps,
        uint256 lastTap
    ) {
        status = tokenStatus[tokenId];
        chipId = chipIdByTokenId[tokenId];
        wallet = boundWallet[tokenId];
        tba = tbaByTokenId[tokenId];
        tier = tokenTier[tokenId];
        taps = tapCount[tokenId];
        lastTap = lastTapTime[tokenId];
    }
}