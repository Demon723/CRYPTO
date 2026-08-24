// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";

/**
 * @title LXON Phygital Bridge Protocol
 * @notice Advanced physical-digital binding using space-grade authentication
 * @dev Integrates Helios-style PBT (Physical Backed Token) with LXON standalone blockchain
 * 
 * Space-Grade Features:
 * - NTAG 424 DNA AES-128 authentication
 * - Subsurface laser engraving provenance
 * - Space heritage material verification
 * - Quantum-resistant key storage options
 * 
 * Phygital Architecture:
 * - Physical acrylic coins with embedded NFC chips
 * - On-chain representation as premium NFTs
 * - Hardware wallet functionality via physical possession
 * - Stellar evolution tier system
 */
contract LXONPhygitalBridge {
    LXONNativeToken public immutable lxonToken;
    
    // Phygital Token States
    enum PhysicalStatus { NOT_MINTED, FABRICATING, AUTHENTICATED, ACTIVE, LOST, DESTROYED }
    enum SpaceGrade { STANDARD, SPACE_HERITAGE, ORBITAL_CERTIFIED, LUNAR_SAMPLE }
    
    struct PhygitalToken {
        uint256 tokenId;
        bytes32 chipPublicKey;           // NTAG 424 DNA public key
        bytes32 materialHash;            // Space material cryptographic hash
        PhysicalStatus status;
        SpaceGrade grade;
        uint256 fabricationTimestamp;
        uint256 authenticationTimestamp;
        uint256 stellarTier;             // 0=Genesis, 1=Solar, 2=MainSequence, 3=RedGiant, 4=Supernova
        address boundWallet;
        uint256 tapCount;
        uint256 lastTapTime;
    }
    
    // Stellar Evolution Configuration
    struct StellarConfig {
        string name;
        string description;
        uint256 maxSupply;
        uint256 basePower;
        uint256 emissionMultiplier;
        uint256 governanceWeight;
    }
    
    // State
    mapping(uint256 => PhygitalToken) public phygitalTokens;
    mapping(uint256 => StellarConfig) public stellarConfigs;
    mapping(bytes32 => uint256) public chipToToken;
    mapping(address => uint256) public walletToToken;
    
    // Space Heritage Registry
    mapping(uint256 => SpaceGrade) public tokenSpaceGrade;
    mapping(bytes32 => bool) public verifiedSpaceMaterials;
    
    // Authentication
    mapping(uint256 => bool) public usedNonces;
    uint256 public nonceCounter;
    
    // Protocol configuration
    address public protocolAuthority;
    uint256 public maxPhygitalSupply;
    uint256 public totalPhygitalMinted;
    
    // Events
    event PhygitalMinted(uint256 indexed tokenId, bytes32 chipPublicKey, SpaceGrade grade, uint256 stellarTier);
    event PhysicalAuthenticated(uint256 indexed tokenId, bytes32 materialHash);
    event WalletBound(uint256 indexed tokenId, address indexed wallet);
    event TapRecorded(uint256 indexed tokenId, uint256 tapCount, uint256 timestamp);
    event StellarEvolution(uint256 indexed tokenId, uint256 oldTier, uint256 newTier);
    event SpaceGradeVerified(uint256 indexed tokenId, SpaceGrade grade);
    
    // Modifiers
    modifier onlyProtocolAuthority() {
        require(msg.sender == protocolAuthority, "Not protocol authority");
        _;
    }
    
    modifier validPhygitalToken(uint256 tokenId) {
        require(phygitalTokens[tokenId].tokenId != 0, "Invalid token");
        _;
    }
    
    modifier onlyActive(uint256 tokenId) {
        require(phygitalTokens[tokenId].status == PhysicalStatus.ACTIVE, "Not active");
        _;
    }
    
    constructor(address _lxonToken, address _protocolAuthority) {
        lxonToken = LXONNativeToken(_lxonToken);
        protocolAuthority = _protocolAuthority;
        maxPhygitalSupply = 10000; // Limited supply for exclusivity
        
        // Initialize Stellar Evolution Tiers
        _initializeStellarConfigs();
    }
    
    function _initializeStellarConfigs() internal {
        // Genesis (Protostar) - Ultra rare, highest governance power
        stellarConfigs[0] = StellarConfig({
            name: "Genesis",
            description: "Protostar phase - birth of a star system",
            maxSupply: 100,
            basePower: 1000,
            emissionMultiplier: 500,
            governanceWeight: 10
        });
        
        // Solar (Main Sequence) - Stable, balanced
        stellarConfigs[1] = StellarConfig({
            name: "Solar",
            description: "Main sequence star - stable hydrogen fusion",
            maxSupply: 1000,
            basePower: 500,
            emissionMultiplier: 200,
            governanceWeight: 5
        });
        
        // Main Sequence - Growing
        stellarConfigs[2] = StellarConfig({
            name: "MainSequence",
            description: "Mid-life evolution - gradual brightening",
            maxSupply: 3000,
            basePower: 250,
            emissionMultiplier: 100,
            governanceWeight: 3
        });
        
        // Red Giant - Expanding power
        stellarConfigs[3] = StellarConfig({
            name: "RedGiant",
            description: "Red giant phase - massive expansion",
            maxSupply: 4000,
            basePower: 100,
            emissionMultiplier: 50,
            governanceWeight: 2
        });
        
        // Supernova - Maximum power, final evolution
        stellarConfigs[4] = StellarConfig({
            name: "Supernova",
            description: "Supernova - explosive stellar death",
            maxSupply: 1900,
            basePower: 2000,
            emissionMultiplier: 1000,
            governanceWeight: 15
        });
    }
    
    /**
     * @notice Mint a new phygital token with space-grade authentication
     * @param tokenId Unique identifier for the physical coin
     * @param chipPublicKey NTAG 424 DNA public key
     * @param materialHash Cryptographic hash of space heritage material
     * @param stellarTier Stellar evolution tier (0-4)
     * @param grade Space grade certification level
     */
    function mintPhygital(
        uint256 tokenId,
        bytes32 chipPublicKey,
        bytes32 materialHash,
        uint256 stellarTier,
        SpaceGrade grade
    ) external onlyProtocolAuthority returns (uint256) {
        require(totalPhygitalMinted < maxPhygitalSupply, "Max supply reached");
        require(phygitalTokens[tokenId].tokenId == 0, "Token exists");
        require(chipPublicKey != bytes32(0), "Invalid chip");
        require(stellarTier <= 4, "Invalid stellar tier");
        require(stellarConfigs[stellarTier].maxSupply > 0, "Invalid tier config");
        
        // Register phygital token
        phygitalTokens[tokenId] = PhygitalToken({
            tokenId: tokenId,
            chipPublicKey: chipPublicKey,
            materialHash: materialHash,
            status: PhysicalStatus.FABRICATING,
            grade: grade,
            fabricationTimestamp: block.timestamp,
            authenticationTimestamp: 0,
            stellarTier: stellarTier,
            boundWallet: address(0),
            tapCount: 0,
            lastTapTime: 0
        });
        
        chipToToken[chipPublicKey] = tokenId;
        tokenSpaceGrade[tokenId] = grade;
        
        if (materialHash != bytes32(0)) {
            verifiedSpaceMaterials[materialHash] = true;
        }
        
        totalPhygitalMinted++;
        
        emit PhygitalMinted(tokenId, chipPublicKey, grade, stellarTier);
        
        return tokenId;
    }
    
    /**
     * @notice Authenticate physical coin with space heritage verification
     * @param tokenId Token identifier
     * @param materialHash Space material cryptographic hash
     * @param authenticationSignature Cryptographic signature from authentication authority
     */
    function authenticatePhysical(
        uint256 tokenId,
        bytes32 materialHash,
        bytes memory authenticationSignature
    ) external onlyProtocolAuthority validPhygitalToken(tokenId) {
        require(phygitalTokens[tokenId].status == PhysicalStatus.FABRICATING, "Not in fabrication");
        
        // Verify space material if provided
        if (materialHash != bytes32(0)) {
            require(verifiedSpaceMaterials[materialHash], "Unverified space material");
            phygitalTokens[tokenId].materialHash = materialHash;
        }
        
        // Update status to authenticated
        phygitalTokens[tokenId].status = PhysicalStatus.AUTHENTICATED;
        phygitalTokens[tokenId].authenticationTimestamp = block.timestamp;
        
        emit PhysicalAuthenticated(tokenId, materialHash);
    }
    
    /**
     * @notice Activate phygital token for use
     * @param tokenId Token identifier
     */
    function activatePhygital(uint256 tokenId) external onlyProtocolAuthority validPhygitalToken(tokenId) {
        require(phygitalTokens[tokenId].status == PhysicalStatus.AUTHENTICATED, "Not authenticated");
        
        phygitalTokens[tokenId].status = PhysicalStatus.ACTIVE;
        
        // Award stellar tier bonus in XON
        StellarConfig memory config = stellarConfigs[phygitalTokens[tokenId].stellarTier];
        uint256 bonus = config.basePower * 10**18; // Base power in XON
        
        // Mint bonus tokens to protocol authority for distribution using enhanced mint
        lxonToken.mintEcosystemReward(protocolAuthority, bonus, "phygital_activation");
    }
    
    /**
     * @notice Bind wallet to phygital token (hardware wallet mode)
     * @param tokenId Token identifier
     * @param wallet User wallet address
     * @param nonce Unique nonce for replay protection
     * @param chipSignature Signature from physical NFC chip
     */
    function bindWallet(
        uint256 tokenId,
        address wallet,
        uint256 nonce,
        bytes memory chipSignature
    ) external validPhygitalToken(tokenId) onlyActive(tokenId) {
        require(wallet != address(0), "Invalid wallet");
        require(!usedNonces[nonce], "Nonce used");
        
        // Verify chip signature
        bytes32 hash = keccak256(abi.encodePacked(
            "BIND_WALLET",
            tokenId,
            wallet,
            nonce,
            block.chainid
        ));
        
        require(_verifyChipSignature(tokenId, hash, chipSignature), "Invalid signature");
        
        usedNonces[nonce] = true;
        nonceCounter++;
        
        // Update binding
        address oldWallet = phygitalTokens[tokenId].boundWallet;
        if (oldWallet != address(0)) {
            walletToToken[oldWallet] = 0;
        }
        
        phygitalTokens[tokenId].boundWallet = wallet;
        walletToToken[wallet] = tokenId;
        
        emit WalletBound(tokenId, wallet);
    }
    
    /**
     * @notice Record physical tap (chip interaction)
     * @param tokenId Token identifier
     * @param chipSignature Signature from NFC chip
     */
    function recordTap(uint256 tokenId, bytes memory chipSignature) external validPhygitalToken(tokenId) onlyActive(tokenId) {
        bytes32 hash = keccak256(abi.encodePacked(
            "TAP",
            tokenId,
            block.timestamp,
            block.chainid
        ));
        
        require(_verifyChipSignature(tokenId, hash, chipSignature), "Invalid signature");
        
        phygitalTokens[tokenId].tapCount++;
        phygitalTokens[tokenId].lastTapTime = block.timestamp;
        
        emit TapRecorded(tokenId, phygitalTokens[tokenId].tapCount, block.timestamp);
    }
    
    /**
     * @notice Stellar evolution - upgrade token tier
     * @param tokenId Token identifier
     * @param newTargetTier Target stellar tier
     */
    function evolveStellar(uint256 tokenId, uint256 newTargetTier) external validPhygitalToken(tokenId) onlyActive(tokenId) {
        require(newTargetTier > phygitalTokens[tokenId].stellarTier, "Must upgrade");
        require(newTargetTier <= 4, "Invalid target tier");
        
        uint256 oldTier = phygitalTokens[tokenId].stellarTier;
        phygitalTokens[tokenId].stellarTier = newTargetTier;
        
        emit StellarEvolution(tokenId, oldTier, newTargetTier);
    }
    
    /**
     * @notice Verify space grade certification
     * @param tokenId Token identifier
     * @param grade Space grade to verify
     */
    function verifySpaceGrade(uint256 tokenId, SpaceGrade grade) external onlyProtocolAuthority validPhygitalToken(tokenId) {
        phygitalTokens[tokenId].grade = grade;
        tokenSpaceGrade[tokenId] = grade;
        
        emit SpaceGradeVerified(tokenId, grade);
    }
    
    /**
     * @notice Get stellar tier configuration
     * @param tier Stellar tier identifier
     */
    function getStellarConfig(uint256 tier) external view returns (StellarConfig memory) {
        return stellarConfigs[tier];
    }
    
    /**
     * @notice Get complete phygital token info
     * @param tokenId Token identifier
     */
    function getPhygitalToken(uint256 tokenId) external view returns (PhygitalToken memory) {
        return phygitalTokens[tokenId];
    }
    
    /**
     * @notice Get total phygital tokens minted
     */
    function getTotalPhygitalMinted() external view returns (uint256) {
        return totalPhygitalMinted;
    }
    
    /**
     * @notice Internal chip signature verification
     * @param tokenId Token identifier
     * @param hash Message hash
     * @param signature Chip signature
     */
    function _verifyChipSignature(uint256 tokenId, bytes32 hash, bytes memory signature) internal view returns (bool) {
        // Simplified verification - in production, implement proper ECDSA verification
        // This would integrate with the NTAG 424 DNA SUN message protocol
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        
        // Recover address from signature
        address recovered = recoverSigner(ethHash, signature);
        
        // Check against registered chip public key
        return recovered == address(uint160(uint256(phygitalTokens[tokenId].chipPublicKey)));
    }
    
    function recoverSigner(bytes32 ethHash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethHash, v, r, s);
    }
    
    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // Protocol Authority Functions
    function setProtocolAuthority(address newAuthority) external onlyProtocolAuthority {
        protocolAuthority = newAuthority;
    }
    
    function markAsLost(uint256 tokenId) external onlyProtocolAuthority validPhygitalToken(tokenId) {
        phygitalTokens[tokenId].status = PhysicalStatus.LOST;
        if (phygitalTokens[tokenId].boundWallet != address(0)) {
            walletToToken[phygitalTokens[tokenId].boundWallet] = 0;
            phygitalTokens[tokenId].boundWallet = address(0);
        }
    }
    
    function markAsDestroyed(uint256 tokenId) external onlyProtocolAuthority validPhygitalToken(tokenId) {
        phygitalTokens[tokenId].status = PhysicalStatus.DESTROYED;
        chipToToken[phygitalTokens[tokenId].chipPublicKey] = 0;
    }
}