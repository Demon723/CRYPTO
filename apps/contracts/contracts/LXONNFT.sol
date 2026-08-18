// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONChipRegistry.sol";
import "./LXONCardRegistry.sol";
import "./LXONTBAccount.sol";
import "./LXONTOTPAuth.sol";

/**
 * @title LXON NFT (Standalone Blockchain)
 * @dev ERC-721 NFT representing physical LXON coins with phygital features
 * Based on Helios PBT architecture adapted for standalone blockchain
 */
contract LXONNFT {
    // ERC-721 Token Standard
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    
    // Token Metadata
    string public name = "LXON Physical Coin";
    string public symbol = "LXON";
    uint256 public totalSupply;
    
    // Token Counter
    uint256 private _tokenIdCounter;
    
    // Token URI
    mapping(uint256 => string) public tokenURI;
    
    // Phygital Features
    LXONChipRegistry public chipRegistry;
    LXONCardRegistry public cardRegistry;
    LXONTOTPAuth public totpAuth;
    
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
    
    // Token metadata
    mapping(uint256 => string) public tokenMetadata;
    
    // Admin
    address public owner;
    address public founder;
    bool public paused;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    // Phygital events
    event TokenMinted(uint256 indexed tokenId, address indexed to, Tier tier);
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
    
    modifier withFounderTOTP(uint256 totpCode) {
        require(totpAuth.verifyTOTP(founder, totpCode), "Invalid TOTP code");
        _;
    }
    
    constructor(address _chipRegistry, address _cardRegistry, address _totpAuth) {
        owner = msg.sender;
        founder = msg.sender;
        _tokenIdCounter = 1;
        
        chipRegistry = LXONChipRegistry(_chipRegistry);
        cardRegistry = LXONCardRegistry(_cardRegistry);
        totpAuth = LXONTOTPAuth(_totpAuth);
    }
    
    // ========== ERC-721 FUNCTIONS ==========
    
    function mint(address to, Tier tier, string memory _tokenURI) external onlyFounder whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        totalSupply++;
        
        tokenURI[tokenId] = _tokenURI;
        tokenTier[tokenId] = tier;
        tokenStatus[tokenId] = TokenStatus.INACTIVE;
        
        emit Transfer(address(0), to, tokenId);
        emit TokenMinted(tokenId, to, tier);
        emit TierAssigned(tokenId, tier);
        
        return tokenId;
    }
    
    function transferFrom(address from, address to, uint256 tokenId) external whenNotPaused {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        require(ownerOf[tokenId] == from, "From address is not owner");
        require(to != address(0), "Cannot transfer to zero address");
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) external whenNotPaused {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public whenNotPaused {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        require(ownerOf[tokenId] == from, "From address is not owner");
        require(to != address(0), "Cannot transfer to zero address");
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        
        _transfer(from, to, tokenId);
        
        if (_isContract(to)) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                require(retval == IERC721Receiver.onERC721Received.selector, "ERC721 Receiver rejected tokens");
            } catch {
                revert("ERC721 transfer to non ERC721Receiver implementer");
            }
        }
    }
    
    function approve(address to, uint256 tokenId) external whenNotPaused {
        address owner = ownerOf[tokenId];
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "Not approved or owner");
        require(to != owner, "Cannot approve to owner");
        
        getApproved[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    
    function setApprovalForAll(address operator, bool approved) external whenNotPaused {
        require(operator != msg.sender, "Cannot approve to self");
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf[tokenId];
        return (spender == owner || getApproved[tokenId] == spender || isApprovedForAll[owner][spender]);
    }
    
    function _isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        // Clear approvals
        delete getApproved[tokenId];
        
        // Update balances
        balanceOf[from]--;
        balanceOf[to]++;
        
        // Update owner
        ownerOf[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    // ========== PHYGITAL FUNCTIONS ==========
    
    /**
     * @notice Activate a token with chip binding (founder only with TOTP)
     * @param tokenId The token ID
     * @param chipId The chip ID to bind
     * @param totpCode The founder's TOTP code
     */
    function activateToken(uint256 tokenId, uint256 chipId, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
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
     * @param nativeToken Address of native token for TBA (optional)
     */
    function createTBA(uint256 tokenId, address nativeToken) external onlyFounder onlyPremium(tokenId) {
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        require(tbaByTokenId[tokenId] == address(0), "TBA already exists");
        
        LXONTBAccount tba = new LXONTBAccount(address(this), tokenId, nativeToken);
        tbaByTokenId[tokenId] = address(tba);
        
        // The TBA is created with deployer as owner, will be managed through NFT contract
        // NFT owner will control TBA through the execute functions
        
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
     * @notice Freeze a token (founder only with TOTP)
     * @param tokenId The token ID
     * @param totpCode The founder's TOTP code
     */
    function freezeToken(uint256 tokenId, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        require(tokenStatus[tokenId] == TokenStatus.ACTIVE, "Token not active");
        tokenStatus[tokenId] = TokenStatus.FROZEN;
        emit TokenFrozen(tokenId);
    }
    
    /**
     * @notice Deactivate a token (founder only with TOTP)
     * @param tokenId The token ID
     * @param totpCode The founder's TOTP code
     */
    function deactivateToken(uint256 tokenId, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
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
    
    /**
     * @notice Update token metadata (founder only with TOTP)
     * @param tokenId The token ID
     * @param metadata New metadata
     * @param totpCode The founder's TOTP code
     */
    function updateTokenMetadata(uint256 tokenId, string memory metadata, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        tokenMetadata[tokenId] = metadata;
    }
    
    /**
     * @notice Execute transaction through TBA (NFT owner only)
     * @param tokenId The token ID
     * @param target The target address
     * @param value The amount to send
     * @param data The call data
     */
    function executeFromTBA(uint256 tokenId, address target, uint256 value, bytes memory data) external whenTokenActive(tokenId) {
        require(msg.sender == ownerOf[tokenId], "Not token owner");
        require(tbaByTokenId[tokenId] != address(0), "No TBA exists");
        
        LXONTBAccount tba = LXONTBAccount(tbaByTokenId[tokenId]);
        (bool success, ) = tba.execute(target, value, data);
        require(success, "Execution failed");
    }
    
    /**
     * @notice Execute batch transactions through TBA (NFT owner only)
     * @param tokenId The token ID
     * @param targets Array of target addresses
     * @param values Array of values to send
     * @param calldatas Array of call data
     */
    function executeBatchFromTBA(uint256 tokenId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas) external whenTokenActive(tokenId) {
        require(msg.sender == ownerOf[tokenId], "Not token owner");
        require(tbaByTokenId[tokenId] != address(0), "No TBA exists");
        
        LXONTBAccount tba = LXONTBAccount(tbaByTokenId[tokenId]);
        (bool success, ) = tba.executeBatch(targets, values, calldatas);
        require(success, "Execution failed");
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
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getTokenInfo(uint256 tokenId) external view returns (
        address owner,
        TokenStatus status,
        uint256 chipId,
        address wallet,
        address tba,
        Tier tier,
        uint256 taps,
        uint256 lastTap,
        string memory uri,
        string memory metadata
    ) {
        owner = ownerOf[tokenId];
        status = tokenStatus[tokenId];
        chipId = chipIdByTokenId[tokenId];
        wallet = boundWallet[tokenId];
        tba = tbaByTokenId[tokenId];
        tier = tokenTier[tokenId];
        taps = tapCount[tokenId];
        lastTap = lastTapTime[tokenId];
        uri = tokenURI[tokenId];
        metadata = tokenMetadata[tokenId];
    }
}

// ERC-721 Receiver Interface
interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}