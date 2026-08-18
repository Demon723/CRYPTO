// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON TOTP Auth (Google Authenticator Integration)
 * @dev Time-based One-Time Password authentication for founder operations
 * Provides 2FA security for critical blockchain operations
 */
contract LXONTOTPAuth {
    // TOTP Secret mapping
    mapping(address => bytes32) public totpSecrets;
    
    // TOTP settings
    uint256 public constant TIME_STEP = 30; // 30-second intervals
    uint256 public constant TIME_WINDOW = 1; // Allow ±1 time window (total 90 seconds)
    uint256 public constant DIGITS = 6; // 6-digit codes
    
    // Founder address
    address public founder;
    
    // TOTP verification contract (optional oracle)
    address public totpVerifier;
    
    // Events
    event TOTPSecretSet(address indexed user, bytes32 secretHash);
    event TOTPVerified(address indexed user, uint256 timestamp, bool success);
    event FounderChanged(address indexed oldFounder, address indexed newFounder);
    
    modifier onlyFounder() {
        require(msg.sender == founder, "Not founder");
        _;
    }
    
    modifier withTOTP(address user, uint256 totpCode) {
        require(verifyTOTP(user, totpCode), "Invalid TOTP code");
        _;
    }
    
    constructor() {
        founder = msg.sender;
    }
    
    /**
     * @notice Set TOTP secret for an address (founder only)
     * @param user The user address
     * @param secretHash Hash of the TOTP secret (SHA-256)
     */
    function setTOTPSecret(address user, bytes32 secretHash) external onlyFounder {
        require(user != address(0), "Invalid user address");
        totpSecrets[user] = secretHash;
        emit TOTPSecretSet(user, secretHash);
    }
    
    /**
     * @notice Verify TOTP code
     * @param user The user address
     * @param totpCode The 6-digit TOTP code
     * @return bool True if code is valid
     */
    function verifyTOTP(address user, uint256 totpCode) public view returns (bool) {
        bytes32 secretHash = totpSecrets[user];
        require(secretHash != bytes32(0), "No TOTP secret set");
        
        uint256 currentTime = block.timestamp;
        
        // Check current time window and adjacent windows
        for (int256 i = -int256(TIME_WINDOW); i <= int256(TIME_WINDOW); i++) {
            uint256 timeCounter = (currentTime + i * int256(TIME_STEP)) / TIME_STEP;
            uint256 expectedCode = _generateTOTP(secretHash, timeCounter);
            
            if (expectedCode == totpCode) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @notice Generate TOTP code (simplified implementation)
     * @param secretHash The secret hash
     * @param timeCounter The time counter
     * @return uint256 The 6-digit TOTP code
     */
    function _generateTOTP(bytes32 secretHash, uint256 timeCounter) internal pure returns (uint256) {
        // Simplified TOTP generation for demonstration
        // In production, this would use proper HMAC-SHA1 or HMAC-SHA256
        
        uint256 hash = uint256(keccak256(abi.encodePacked(secretHash, timeCounter)));
        
        // Extract 6 digits from hash
        uint256 code = hash % 1000000;
        
        return code;
    }
    
    /**
     * @notice Change founder address (requires TOTP)
     * @param newFounder The new founder address
     * @param totpCode The current founder's TOTP code
     */
    function changeFounder(address newFounder, uint256 totpCode) external onlyFounder withTOTP(founder, totpCode) {
        require(newFounder != address(0), "Invalid founder address");
        address oldFounder = founder;
        founder = newFounder;
        emit FounderChanged(oldFounder, newFounder);
    }
    
    /**
     * @notice Set TOTP verifier address (founder only)
     * @param verifier The verifier contract address
     */
    function setTOTPVerifier(address verifier) external onlyFounder {
        totpVerifier = verifier;
    }
    
    /**
     * @notice Get TOTP setup information for user
     * @param user The user address
     * @return hasSecret Whether user has TOTP secret set
     * @return secretHash The secret hash (for verification)
     */
    function getTOTPInfo(address user) external view returns (bool hasSecret, bytes32 secretHash) {
        secretHash = totpSecrets[user];
        hasSecret = secretHash != bytes32(0);
    }
    
    /**
     * @notice Get current time window for TOTP verification
     * @return currentTime Current block timestamp
     * @return timeStep Time step in seconds
     * @return timeWindow Number of adjacent time windows allowed
     */
    function getTOTPSettings() external pure returns (uint256 currentTime, uint256 timeStep, uint256 timeWindow) {
        currentTime = block.timestamp;
        timeStep = TIME_STEP;
        timeWindow = TIME_WINDOW;
    }
}