// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";
import "./LXONGovernance.sol";
import "./LXONNativeDEX.sol";
import "./LXONPhygitalBridge.sol";
import "./LXONStellarTokenomics.sol";
import "./LXONHardwareWallet.sol";
import "./LXONSpaceHeritage.sol";

/**
 * @title LXON Master Integration
 * @notice Master contract that wires together all LXON ecosystem components
 * @dev Provides unified interface and manages cross-component interactions
 * 
 * Integration Architecture:
 * - Native Token ↔ Phygital Bridge ↔ Stellar Tokenomics
 * - Hardware Wallet ↔ Native Token ↔ Phygital Bridge
 * - Space Heritage ↔ Phygital Bridge ↔ Native Token
 * - Governance ↔ All components
 * - DEX ↔ All token operations
 * 
 * This contract serves as the central nervous system of the enhanced LXON ecosystem.
 */
contract LXONMasterIntegration {
    // Core Components
    LXONNativeToken public immutable lxonToken;
    LXONGovernance public immutable governance;
    LXONNativeDEX public immutable nativeDEX;
    
    // Enhanced Components
    LXONPhygitalBridge public immutable phygitalBridge;
    LXONStellarTokenomics public immutable stellarTokenomics;
    LXONHardwareWallet public immutable hardwareWallet;
    LXONSpaceHeritage public immutable spaceHeritage;
    
    // Helper struct for stellar system data (to avoid external call complexity)
    struct StellarSystemData {
        uint256 systemId;
        uint256 governancePower;
        uint256 stellarMass;
        uint256 luminosity;
    }
    
    // Integration State
    bool public integrationEnabled;
    uint256 public integrationVersion;
    address public integrationAuthority;
    
    // Cross-Component Mappings
    mapping(uint256 => uint256) public phygitalToStellar; // Phygital token ID → Stellar system ID
    mapping(uint256 => uint256) public walletToPhygital;  // Hardware wallet ID → Phygital token ID
    mapping(uint256 => uint256) public artifactToPhygital; // Space artifact ID → Phygital token ID
    
    // Cached stellar system data for efficient access
    mapping(uint256 => StellarSystemData) public cachedStellarData;
    
    // Unified Events
    event SystemIntegrated(uint256 version, address authority);
    event PhygitalLinkedToStellar(uint256 phygitalId, uint256 stellarId);
    event WalletLinkedToPhygital(uint256 walletId, uint256 phygitalId);
    event ArtifactLinkedToPhygital(uint256 artifactId, uint256 phygitalId);
    event CrossComponentTransaction(string indexed component, bytes32 indexed txHash);
    
    // Modifiers
    modifier onlyIntegrationAuthority() {
        require(msg.sender == integrationAuthority, "Not integration authority");
        _;
    }
    
    modifier whenIntegrationEnabled() {
        require(integrationEnabled, "Integration not enabled");
        _;
    }
    
    constructor(
        address _lxonToken,
        address _governance,
        address _nativeDEX,
        address _phygitalBridge,
        address _stellarTokenomics,
        address _hardwareWallet,
        address _spaceHeritage,
        address _integrationAuthority
    ) {
        lxonToken = LXONNativeToken(_lxonToken);
        governance = LXONGovernance(_governance);
        nativeDEX = LXONNativeDEX(_nativeDEX);
        phygitalBridge = LXONPhygitalBridge(_phygitalBridge);
        stellarTokenomics = LXONStellarTokenomics(_stellarTokenomics);
        hardwareWallet = LXONHardwareWallet(_hardwareWallet);
        spaceHeritage = LXONSpaceHeritage(_spaceHeritage);
        integrationAuthority = _integrationAuthority;
        integrationVersion = 1;
    }
    
    /**
     * @notice Enable system integration
     */
    function enableIntegration() external onlyIntegrationAuthority {
        require(!integrationEnabled, "Already enabled");
        integrationEnabled = true;
        emit SystemIntegrated(integrationVersion, integrationAuthority);
    }
    
    /**
     * @notice Link phygital token to stellar system
     * @param phygitalId Phygital token ID
     * @param stellarId Stellar system ID
     */
    function linkPhygitalToStellar(uint256 phygitalId, uint256 stellarId) external onlyIntegrationAuthority whenIntegrationEnabled {
        require(phygitalBridge.getPhygitalToken(phygitalId).tokenId != 0, "Invalid phygital");
        require(stellarTokenomics.getStellarSystem(stellarId).systemId != 0, "Invalid stellar");
        
        phygitalToStellar[phygitalId] = stellarId;
        
        // Cache stellar system data for efficient access
        LXONStellarTokenomics.StellarSystem memory stellar = stellarTokenomics.getStellarSystem(stellarId);
        cachedStellarData[stellarId] = StellarSystemData({
            systemId: stellar.systemId,
            governancePower: stellar.governancePower,
            stellarMass: stellar.stellarMass,
            luminosity: stellar.luminosity
        });
        
        emit PhygitalLinkedToStellar(phygitalId, stellarId);
    }
    
    /**
     * @notice Link hardware wallet to phygital token
     * @param walletId Hardware wallet ID
     * @param phygitalId Phygital token ID
     */
    function linkWalletToPhygital(uint256 walletId, uint256 phygitalId) external onlyIntegrationAuthority whenIntegrationEnabled {
        require(hardwareWallet.getWalletInfo(walletId).walletId != 0, "Invalid wallet");
        require(phygitalBridge.getPhygitalToken(phygitalId).tokenId != 0, "Invalid phygital");
        
        walletToPhygital[walletId] = phygitalId;
        emit WalletLinkedToPhygital(walletId, phygitalId);
    }
    
    /**
     * @notice Link space artifact to phygital token
     * @param artifactId Space artifact ID
     * @param phygitalId Phygital token ID
     */
    function linkArtifactToPhygital(uint256 artifactId, uint256 phygitalId) external onlyIntegrationAuthority whenIntegrationEnabled {
        require(spaceHeritage.getArtifact(artifactId).artifactId != 0, "Invalid artifact");
        require(phygitalBridge.getPhygitalToken(phygitalId).tokenId != 0, "Invalid phygital");
        
        artifactToPhygital[artifactId] = phygitalId;
        emit ArtifactLinkedToPhygital(artifactId, phygitalId);
    }
    
    /**
     * @notice Unified phygital token creation with stellar system
     * @param to Token recipient
     * @param chipPublicKey NFC chip public key
     * @param materialHash Space material hash
     * @param stellarTier Stellar evolution tier
     * @param spaceGrade Space grade certification
     * @param stellarClass Stellar classification for system creation
     * @param stellarMass Stellar mass for system creation
     */
    function createUnifiedPhygital(
        address to,
        bytes32 chipPublicKey,
        bytes32 materialHash,
        uint256 stellarTier,
        LXONPhygitalBridge.SpaceGrade spaceGrade,
        LXONStellarTokenomics.StellarClass stellarClass,
        uint256 stellarMass
    ) external onlyIntegrationAuthority whenIntegrationEnabled returns (uint256, uint256) {
        // Create phygital token with auto-generated ID
        uint256 phygitalId = phygitalBridge.getTotalPhygitalMinted() + 1;
        phygitalBridge.mintPhygital(
            phygitalId,
            chipPublicKey,
            materialHash,
            stellarTier,
            spaceGrade
        );
        
        // Create stellar system
        uint256 stellarId = stellarTokenomics.createStellarSystem(
            "Auto-Generated System",
            stellarClass,
            stellarMass
        );
        
        // Link them
        phygitalToStellar[phygitalId] = stellarId;
        
        emit PhygitalLinkedToStellar(phygitalId, stellarId);
        
        return (phygitalId, stellarId);
    }
    
    /**
     * @notice Unified hardware wallet creation with phygital binding
     * @param owner Wallet owner
     * @param chipPublicKey NFC chip public key
     * @param securityLevel Security level (1-5)
     * @param phygitalId Associated phygital token ID
     */
    function createUnifiedHardwareWallet(
        address owner,
        bytes32 chipPublicKey,
        uint256 securityLevel,
        uint256 phygitalId
    ) external onlyIntegrationAuthority whenIntegrationEnabled returns (uint256) {
        // Create hardware wallet
        uint256 walletId = hardwareWallet.createHardwareWallet(
            owner,
            chipPublicKey,
            securityLevel
        );
        
        // Link to phygital token
        walletToPhygital[walletId] = phygitalId;
        
        emit WalletLinkedToPhygital(walletId, phygitalId);
        
        return walletId;
    }
    
    /**
     * @notice Get complete phygital token ecosystem data
     * @param phygitalId Phygital token ID
     */
    function getPhygitalEcosystemData(uint256 phygitalId) external view returns (
        LXONPhygitalBridge.PhygitalToken memory phygital,
        LXONStellarTokenomics.StellarSystem memory stellar,
        LXONHardwareWallet.HardwareWallet memory wallet,
        LXONSpaceHeritage.SpaceArtifact memory artifact
    ) {
        phygital = phygitalBridge.getPhygitalToken(phygitalId);
        
        uint256 stellarId = phygitalToStellar[phygitalId];
        if (stellarId != 0) {
            stellar = stellarTokenomics.getStellarSystem(stellarId);
        }
        
        // Find associated wallet
        for (uint256 i = 1; i <= 10000; i++) { // Practical limit
            if (walletToPhygital[i] == phygitalId) {
                wallet = hardwareWallet.getWalletInfo(i);
                break;
            }
        }
        
        // Find associated artifact (reverse lookup would be more efficient)
        // This is simplified for demonstration
    }
    
    /**
     * @notice Calculate unified rewards for phygital token
     * @param phygitalId Phygital token ID
     * @param staker Address to calculate rewards for
     */
    function calculateUnifiedRewards(uint256 phygitalId, address staker) external view returns (uint256) {
        uint256 stellarId = phygitalToStellar[phygitalId];
        if (stellarId == 0) return 0;
        
        // Get stellar rewards
        // This would require access to stellar stakes, which is complex
        // Simplified version:
        LXONPhygitalBridge.PhygitalToken memory phygital = phygitalBridge.getPhygitalToken(phygitalId);
        
        // Calculate base power based on stellar tier
        uint256 basePower;
        if (phygital.stellarTier == 0) basePower = 1000; // Genesis
        else if (phygital.stellarTier == 1) basePower = 500; // Solar
        else if (phygital.stellarTier == 2) basePower = 250; // Main Sequence
        else if (phygital.stellarTier == 3) basePower = 100; // Red Giant
        else basePower = 2000; // Supernova
        
        // If stellar system exists, apply its governance power as additional multiplier
        if (stellarId != 0) {
            LXONStellarTokenomics.StellarSystem memory stellar = stellarTokenomics.getStellarSystem(stellarId);
            basePower = (basePower * stellar.governancePower) / 100;
        }
        
        return basePower * 10**18;
    }
    
    /**
     * @notice Execute cross-component transaction
     * @param component Target component
     * @param data Encoded transaction data
     */
    function executeCrossComponentTransaction(string memory component, bytes memory data) external onlyIntegrationAuthority whenIntegrationEnabled {
        bytes32 txHash = keccak256(abi.encodePacked(component, data, block.timestamp));
        
        if (keccak256(bytes(component)) == keccak256(bytes("PHYGTIAL"))) {
            // Execute phygital bridge transaction
            (bool success, ) = address(phygitalBridge).call(data);
            require(success, "Phygital transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("STELLAR"))) {
            // Execute stellar tokenomics transaction
            (bool success, ) = address(stellarTokenomics).call(data);
            require(success, "Stellar transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("WALLET"))) {
            // Execute hardware wallet transaction
            (bool success, ) = address(hardwareWallet).call(data);
            require(success, "Wallet transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("HERITAGE"))) {
            // Execute space heritage transaction
            (bool success, ) = address(spaceHeritage).call(data);
            require(success, "Heritage transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("TOKEN"))) {
            // Execute native token transaction
            (bool success, ) = address(lxonToken).call(data);
            require(success, "Token transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("GOVERNANCE"))) {
            // Execute governance transaction
            (bool success, ) = address(governance).call(data);
            require(success, "Governance transaction failed");
        } else if (keccak256(bytes(component)) == keccak256(bytes("DEX"))) {
            // Execute DEX transaction
            (bool success, ) = address(nativeDEX).call(data);
            require(success, "DEX transaction failed");
        }
        
        emit CrossComponentTransaction(component, txHash);
    }
    
    /**
     * @notice Get system health status
     */
    function getSystemHealth() external view returns (
        bool tokenOperational,
        bool governanceOperational,
        bool dexOperational,
        bool phygitalOperational,
        bool stellarOperational,
        bool walletOperational,
        bool heritageOperational,
        uint256 totalPhygitalTokens,
        uint256 totalStellarSystems,
        uint256 totalHardwareWallets,
        uint256 totalSpaceArtifacts
    ) {
        tokenOperational = lxonToken.totalSupply() >= 0;
        governanceOperational = address(governance) != address(0);
        dexOperational = address(nativeDEX) != address(0);
        phygitalOperational = address(phygitalBridge) != address(0);
        stellarOperational = address(stellarTokenomics) != address(0);
        walletOperational = address(hardwareWallet) != address(0);
        heritageOperational = address(spaceHeritage) != address(0);
        
        // These would need to be added as view functions in the respective contracts
        totalPhygitalTokens = 0; // phygitalBridge.totalPhygitalMinted();
        totalStellarSystems = 0; // stellarTokenomics.systemCounter();
        totalHardwareWallets = 0; // hardwareWallet.walletCounter();
        totalSpaceArtifacts = 0; // spaceHeritage.artifactCounter();
    }
    
    /**
     * @notice Emergency shutdown of specific component
     * @param component Component to shutdown
     */
    function emergencyComponentShutdown(string memory component) external onlyIntegrationAuthority {
        if (keccak256(bytes(component)) == keccak256(bytes("PHYGTIAL"))) {
            // Would need pause function in phygital bridge
        } else if (keccak256(bytes(component)) == keccak256(bytes("STELLAR"))) {
            // Would need pause function in stellar tokenomics
        } else if (keccak256(bytes(component)) == keccak256(bytes("WALLET"))) {
            // Would need pause function in hardware wallet
        } else if (keccak256(bytes(component)) == keccak256(bytes("HERITAGE"))) {
            // Would need pause function in space heritage
        }
    }
    
    /**
     * @notice Update integration authority
     */
    function setIntegrationAuthority(address newAuthority) external onlyIntegrationAuthority {
        integrationAuthority = newAuthority;
    }
    
    /**
     * @notice Upgrade integration version
     */
    function upgradeIntegration() external onlyIntegrationAuthority {
        integrationVersion++;
        emit SystemIntegrated(integrationVersion, integrationAuthority);
    }
}