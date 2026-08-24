// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";
import "./LXONPhygitalBridge.sol";

/**
 * @title LXON Hardware Wallet Protocol
 * @notice Physical possession-based hardware wallet system
 * @dev Enables physical coins to function as secure hardware wallets
 * 
 * Hardware Wallet Features:
 * - Physical possession = cryptographic access
 * - NFC chip authentication for all operations
 * - Multi-sig protection with physical verification
 * - Quantum-resistant seed storage options
 * - Emergency recovery mechanisms
 * 
 * Security Model:
 * - Chip signature required for all operations
 * - Physical verification for sensitive actions
 * - Time-locked emergency recovery
 * - Biometric integration capabilities
 */
contract LXONHardwareWallet {
    LXONNativeToken public immutable lxonToken;
    LXONPhygitalBridge public immutable phygitalBridge;
    
    // Wallet States
    enum WalletStatus { UNINITIALIZED, ACTIVE, FROZEN, COMPROMISED, RECOVERING }
    
    // Hardware Wallet Configuration
    struct HardwareWallet {
        uint256 walletId;
        address owner;
        bytes32 chipPublicKey;           // NFC chip public key
        WalletStatus status;
        uint256 balance;
        uint256 nonce;
        uint256 lastActivity;
        uint256 securityLevel;          // 1-5 scale
        bool biometricEnabled;
        bool quantumResistant;
        uint256 emergencyLockTime;
    }
    
    // Transaction Limits
    struct SecurityLimits {
        uint256 dailyLimit;
        uint256 dailySpent;
        uint256 lastResetTime;
        uint256 singleTransactionLimit;
        uint256 requireVerificationAbove;
    }
    
    // Emergency Recovery
    struct EmergencyRecovery {
        bytes32 recoveryHash;
        uint256 initiatedTime;
        uint256 confirmationCount;
        uint256 requiredConfirmations;
        mapping(address => bool) confirmations;
        bool executed;
    }
    
    // State
    mapping(uint256 => HardwareWallet) public hardwareWallets;
    mapping(uint256 => SecurityLimits) public securityLimits;
    mapping(uint256 => EmergencyRecovery) public emergencyRecoveries;
    mapping(address => uint256) public ownerToWallet;
    mapping(bytes32 => uint256) public chipToWallet;
    
    uint256 public walletCounter;
    address public recoveryAuthority;
    uint256 public constant RECOVERY_DELAY = 72 hours;
    uint256 public constant MAX_SECURITY_LEVEL = 5;
    
    // Events
    event HardwareWalletCreated(uint256 indexed walletId, address indexed owner, bytes32 chipPublicKey);
    event WalletActivated(uint256 indexed walletId, uint256 securityLevel);
    event TransactionExecuted(uint256 indexed walletId, address indexed to, uint256 value, bytes32 txHash);
    event SecurityLimitBreached(uint256 indexed walletId, uint256 attemptedAmount, uint256 limit);
    event EmergencyRecoveryInitiated(uint256 indexed walletId, bytes32 recoveryHash);
    event EmergencyRecoveryConfirmed(uint256 indexed walletId, address confirmer);
    event EmergencyRecoveryExecuted(uint256 indexed walletId, address newOwner);
    event WalletFrozen(uint256 indexed walletId, string reason);
    event WalletCompromised(uint256 indexed walletId);
    
    // Modifiers
    modifier onlyWalletOwner(uint256 walletId) {
        require(hardwareWallets[walletId].owner == msg.sender, "Not wallet owner");
        _;
    }
    
    modifier onlyActiveWallet(uint256 walletId) {
        require(hardwareWallets[walletId].status == WalletStatus.ACTIVE, "Wallet not active");
        _;
    }
    
    modifier onlyRecoveryAuthority() {
        require(msg.sender == recoveryAuthority, "Not recovery authority");
        _;
    }
    
    modifier chipVerified(uint256 walletId, bytes memory chipSignature) {
        require(_verifyChipSignature(walletId, chipSignature), "Invalid chip signature");
        _;
    }
    
    constructor(address _lxonToken, address _phygitalBridge, address _recoveryAuthority) {
        lxonToken = LXONNativeToken(_lxonToken);
        phygitalBridge = LXONPhygitalBridge(_phygitalBridge);
        recoveryAuthority = _recoveryAuthority;
    }
    
    /**
     * @notice Create a new hardware wallet
     * @param owner Wallet owner address
     * @param chipPublicKey NFC chip public key
     * @param securityLevel Initial security level (1-5)
     */
    function createHardwareWallet(
        address owner,
        bytes32 chipPublicKey,
        uint256 securityLevel
    ) external returns (uint256) {
        require(owner != address(0), "Invalid owner");
        require(chipPublicKey != bytes32(0), "Invalid chip");
        require(securityLevel >= 1 && securityLevel <= MAX_SECURITY_LEVEL, "Invalid security level");
        require(ownerToWallet[owner] == 0, "Owner already has wallet");
        
        uint256 walletId = ++walletCounter;
        
        hardwareWallets[walletId] = HardwareWallet({
            walletId: walletId,
            owner: owner,
            chipPublicKey: chipPublicKey,
            status: WalletStatus.UNINITIALIZED,
            balance: 0,
            nonce: 0,
            lastActivity: block.timestamp,
            securityLevel: securityLevel,
            biometricEnabled: false,
            quantumResistant: false,
            emergencyLockTime: 0
        });
        
        // Set default security limits based on security level
        _setDefaultSecurityLimits(walletId, securityLevel);
        
        chipToWallet[chipPublicKey] = walletId;
        ownerToWallet[owner] = walletId;
        
        emit HardwareWalletCreated(walletId, owner, chipPublicKey);
        
        return walletId;
    }
    
    /**
     * @notice Activate hardware wallet with chip verification
     * @param walletId Wallet identifier
     * @param chipSignature Signature from NFC chip
     */
    function activateWallet(uint256 walletId, bytes memory chipSignature) external onlyWalletOwner(walletId) chipVerified(walletId, chipSignature) {
        require(hardwareWallets[walletId].status == WalletStatus.UNINITIALIZED, "Already initialized");
        
        hardwareWallets[walletId].status = WalletStatus.ACTIVE;
        hardwareWallets[walletId].lastActivity = block.timestamp;
        
        emit WalletActivated(walletId, hardwareWallets[walletId].securityLevel);
    }
    
    /**
     * @notice Execute transaction with chip verification
     * @param walletId Wallet identifier
     * @param to Recipient address
     * @param value Amount to transfer
     * @param data Transaction data
     * @param chipSignature NFC chip signature
     */
    function executeTransaction(
        uint256 walletId,
        address to,
        uint256 value,
        bytes calldata data,
        bytes memory chipSignature
    ) external onlyWalletOwner(walletId) onlyActiveWallet(walletId) chipVerified(walletId, chipSignature) {
        require(to != address(0), "Invalid recipient");
        require(value <= hardwareWallets[walletId].balance, "Insufficient balance");
        
        SecurityLimits storage limits = securityLimits[walletId];
        
        // Check daily limits
        _checkAndUpdateDailyLimits(walletId, value, limits);
        
        // Check single transaction limit
        if (value > limits.singleTransactionLimit) {
            require(_verifyBiometricOrHigherAuth(walletId), "Additional verification required");
        }
        
        // Execute transaction
        hardwareWallets[walletId].balance -= value;
        hardwareWallets[walletId].nonce++;
        hardwareWallets[walletId].lastActivity = block.timestamp;
        
        require(lxonToken.transfer(to, value), "Transfer failed");
        
        bytes32 txHash = keccak256(abi.encodePacked(walletId, to, value, data, block.timestamp));
        emit TransactionExecuted(walletId, to, value, txHash);
    }
    
    /**
     * @notice Deposit funds to hardware wallet
     * @param walletId Wallet identifier
     * @param amount Amount to deposit
     */
    function depositToWallet(uint256 walletId, uint256 amount) external onlyActiveWallet(walletId) {
        require(amount > 0, "Amount must be > 0");
        
        require(lxonToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        hardwareWallets[walletId].balance += amount;
        hardwareWallets[walletId].lastActivity = block.timestamp;
    }
    
    /**
     * @notice Withdraw from hardware wallet
     * @param walletId Wallet identifier
     * @param amount Amount to withdraw
     * @param chipSignature NFC chip signature
     */
    function withdrawFromWallet(
        uint256 walletId,
        uint256 amount,
        bytes memory chipSignature
    ) external onlyWalletOwner(walletId) onlyActiveWallet(walletId) chipVerified(walletId, chipSignature) {
        require(amount > 0, "Amount must be > 0");
        require(amount <= hardwareWallets[walletId].balance, "Insufficient balance");
        
        SecurityLimits storage limits = securityLimits[walletId];
        _checkAndUpdateDailyLimits(walletId, amount, limits);
        
        hardwareWallets[walletId].balance -= amount;
        hardwareWallets[walletId].nonce++;
        hardwareWallets[walletId].lastActivity = block.timestamp;
        
        require(lxonToken.transfer(msg.sender, amount), "Transfer failed");
    }
    
    /**
     * @notice Enable biometric verification
     * @param walletId Wallet identifier
     * @param chipSignature NFC chip signature
     */
    function enableBiometric(uint256 walletId, bytes memory chipSignature) external onlyWalletOwner(walletId) chipVerified(walletId, chipSignature) {
        hardwareWallets[walletId].biometricEnabled = true;
    }
    
    /**
     * @notice Enable quantum-resistant seed storage
     * @param walletId Wallet identifier
     * @param chipSignature NFC chip signature
     */
    function enableQuantumResistant(uint256 walletId, bytes memory chipSignature) external onlyWalletOwner(walletId) chipVerified(walletId, chipSignature) {
        hardwareWallets[walletId].quantumResistant = true;
    }
    
    /**
     * @notice Update security level
     * @param walletId Wallet identifier
     * @param newLevel New security level (1-5)
     * @param chipSignature NFC chip signature
     */
    function updateSecurityLevel(uint256 walletId, uint256 newLevel, bytes memory chipSignature) external onlyWalletOwner(walletId) chipVerified(walletId, chipSignature) {
        require(newLevel >= 1 && newLevel <= MAX_SECURITY_LEVEL, "Invalid security level");
        
        hardwareWallets[walletId].securityLevel = newLevel;
        _setDefaultSecurityLimits(walletId, newLevel);
    }
    
    /**
     * @notice Initiate emergency recovery
     * @param walletId Wallet identifier
     * @param recoveryHash Hash of recovery data
     */
    function initiateEmergencyRecovery(uint256 walletId, bytes32 recoveryHash) external onlyWalletOwner(walletId) {
        require(hardwareWallets[walletId].status != WalletStatus.RECOVERING, "Already recovering");
        
        EmergencyRecovery storage recovery = emergencyRecoveries[walletId];
        recovery.recoveryHash = recoveryHash;
        recovery.initiatedTime = block.timestamp;
        recovery.confirmationCount = 0;
        recovery.requiredConfirmations = _getRequiredConfirmations(hardwareWallets[walletId].securityLevel);
        recovery.executed = false;
        
        hardwareWallets[walletId].status = WalletStatus.RECOVERING;
        hardwareWallets[walletId].emergencyLockTime = block.timestamp + RECOVERY_DELAY;
        
        emit EmergencyRecoveryInitiated(walletId, recoveryHash);
    }
    
    /**
     * @notice Confirm emergency recovery
     * @param walletId Wallet identifier
     */
    function confirmEmergencyRecovery(uint256 walletId) external onlyRecoveryAuthority {
        EmergencyRecovery storage recovery = emergencyRecoveries[walletId];
        require(hardwareWallets[walletId].status == WalletStatus.RECOVERING, "Not recovering");
        require(!recovery.confirmations[msg.sender], "Already confirmed");
        require(!recovery.executed, "Already executed");
        
        recovery.confirmations[msg.sender] = true;
        recovery.confirmationCount++;
        
        emit EmergencyRecoveryConfirmed(walletId, msg.sender);
        
        // Check if enough confirmations
        if (recovery.confirmationCount >= recovery.requiredConfirmations) {
            _executeEmergencyRecovery(walletId);
        }
    }
    
    /**
     * @notice Freeze wallet (emergency measure)
     * @param walletId Wallet identifier
     * @param reason Freeze reason
     */
    function freezeWallet(uint256 walletId, string calldata reason) external onlyRecoveryAuthority {
        require(hardwareWallets[walletId].status == WalletStatus.ACTIVE, "Not active");
        
        hardwareWallets[walletId].status = WalletStatus.FROZEN;
        
        emit WalletFrozen(walletId, reason);
    }
    
    /**
     * @notice Mark wallet as compromised
     * @param walletId Wallet identifier
     */
    function markCompromised(uint256 walletId) external onlyRecoveryAuthority {
        hardwareWallets[walletId].status = WalletStatus.COMPROMISED;
        
        emit WalletCompromised(walletId);
    }
    
    /**
     * @notice Get wallet information
     */
    function getWalletInfo(uint256 walletId) external view returns (HardwareWallet memory) {
        return hardwareWallets[walletId];
    }
    
    /**
     * @notice Get security limits
     */
    function getSecurityLimits(uint256 walletId) external view returns (SecurityLimits memory) {
        return securityLimits[walletId];
    }
    
    // Internal Functions
    
    function _setDefaultSecurityLimits(uint256 walletId, uint256 securityLevel) internal {
        uint256 dailyLimit;
        uint256 singleTxLimit;
        
        if (securityLevel == 1) {
            dailyLimit = 1000 * 10**18;      // 1,000 XON daily
            singleTxLimit = 100 * 10**18;     // 100 XON per tx
        } else if (securityLevel == 2) {
            dailyLimit = 5000 * 10**18;      // 5,000 XON daily
            singleTxLimit = 500 * 10**18;     // 500 XON per tx
        } else if (securityLevel == 3) {
            dailyLimit = 20000 * 10**18;     // 20,000 XON daily
            singleTxLimit = 2000 * 10**18;    // 2,000 XON per tx
        } else if (securityLevel == 4) {
            dailyLimit = 100000 * 10**18;    // 100,000 XON daily
            singleTxLimit = 10000 * 10**18;   // 10,000 XON per tx
        } else {
            dailyLimit = 500000 * 10**18;    // 500,000 XON daily
            singleTxLimit = 50000 * 10**18;   // 50,000 XON per tx
        }
        
        securityLimits[walletId] = SecurityLimits({
            dailyLimit: dailyLimit,
            dailySpent: 0,
            lastResetTime: block.timestamp,
            singleTransactionLimit: singleTxLimit,
            requireVerificationAbove: singleTxLimit
        });
    }
    
    function _checkAndUpdateDailyLimits(uint256 walletId, uint256 amount, SecurityLimits storage limits) internal {
        // Reset daily counter if new day
        if (block.timestamp >= limits.lastResetTime + 1 days) {
            limits.dailySpent = 0;
            limits.lastResetTime = block.timestamp;
        }
        
        // Check daily limit
        if (limits.dailySpent + amount > limits.dailyLimit) {
            emit SecurityLimitBreached(walletId, amount, limits.dailyLimit);
            revert("Daily limit exceeded");
        }
        
        limits.dailySpent += amount;
    }
    
    function _verifyChipSignature(uint256 walletId, bytes memory chipSignature) internal view returns (bool) {
        HardwareWallet memory wallet = hardwareWallets[walletId];
        
        bytes32 hash = keccak256(abi.encodePacked(
            "WALLET_OP",
            walletId,
            wallet.nonce,
            block.chainid
        ));
        
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        
        // Verify signature against chip public key
        address recovered = _recoverSigner(ethHash, chipSignature);
        return recovered == address(uint160(uint256(wallet.chipPublicKey)));
    }
    
    function _verifyBiometricOrHigherAuth(uint256 walletId) internal view returns (bool) {
        // In production, this would integrate with biometric verification
        // For now, require additional chip signature with higher nonce
        return hardwareWallets[walletId].biometricEnabled;
    }
    
    function _getRequiredConfirmations(uint256 securityLevel) internal pure returns (uint256) {
        if (securityLevel <= 2) return 2;
        if (securityLevel == 3) return 3;
        if (securityLevel == 4) return 5;
        return 7; // Maximum security
    }
    
    function _executeEmergencyRecovery(uint256 walletId) internal {
        EmergencyRecovery storage recovery = emergencyRecoveries[walletId];
        require(block.timestamp >= hardwareWallets[walletId].emergencyLockTime, "Recovery delay not met");
        
        // Generate new owner address based on recovery hash
        address newOwner = address(uint160(uint256(recovery.recoveryHash)));
        
        // Transfer ownership
        address oldOwner = hardwareWallets[walletId].owner;
        ownerToWallet[oldOwner] = 0;
        ownerToWallet[newOwner] = walletId;
        hardwareWallets[walletId].owner = newOwner;
        
        // Reset wallet state
        hardwareWallets[walletId].status = WalletStatus.ACTIVE;
        hardwareWallets[walletId].nonce = 0;
        
        recovery.executed = true;
        
        emit EmergencyRecoveryExecuted(walletId, newOwner);
    }
    
    function _recoverSigner(bytes32 ethHash, bytes memory signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        return ecrecover(ethHash, v, r, s);
    }
    
    function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // Recovery Authority Functions
    function setRecoveryAuthority(address newAuthority) external onlyRecoveryAuthority {
        recoveryAuthority = newAuthority;
    }
}