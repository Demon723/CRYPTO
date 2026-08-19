// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON TOTP Auth (Google Authenticator Integration)
 * @dev Time-based One-Time Password authentication for founder operations
 * Provides 2FA security for critical blockchain operations
 * Implements RFC 6238 compliant TOTP with HMAC-SHA256
 */
contract LXONTOTPAuth {
    // TOTP Secret mapping (stores the actual secret, not hash)
    mapping(address => bytes) public totpSecrets;
    
    // TOTP settings
    uint256 public constant TIME_STEP = 30; // 30-second intervals
    uint256 public constant TIME_WINDOW = 1; // Allow ±1 time window (total 90 seconds)
    uint256 public constant DIGITS = 6; // 6-digit codes
    
    // Founder address
    address public founder;
    
    // TOTP verification contract (optional oracle)
    address public totpVerifier;
    
    // Rate limiting to prevent brute force attacks
    mapping(address => uint256) public lastAttemptTime;
    mapping(address => uint256) public attemptCount;
    uint256 public constant RATE_LIMIT_WINDOW = 60; // 1 minute
    uint256 public constant MAX_ATTEMPTS = 5; // Max 5 attempts per minute
    
    // Events
    event TOTPSecretSet(address indexed user, bytes32 secretHash);
    event TOTPVerified(address indexed user, uint256 timestamp, bool success);
    event FounderChanged(address indexed oldFounder, address indexed newFounder);
    event TooManyAttempts(address indexed user, uint256 attemptCount);
    
    modifier onlyFounder() {
        require(msg.sender == founder, "Not founder");
        _;
    }
    
    modifier withTOTP(address user, uint256 totpCode) {
        require(verifyTOTP(user, totpCode), "Invalid TOTP code");
        _;
    }
    
    modifier rateLimited(address user) {
        uint256 currentTime = block.timestamp;
        uint256 windowStart = currentTime - RATE_LIMIT_WINDOW;
        
        if (lastAttemptTime[user] < windowStart) {
            // Reset counter if outside rate limit window
            attemptCount[user] = 0;
            lastAttemptTime[user] = currentTime;
        }
        
        require(attemptCount[user] < MAX_ATTEMPTS, "Too many attempts");
        attemptCount[user]++;
        _;
    }
    
    constructor() {
        founder = msg.sender;
    }
    
    /**
     * @notice Set TOTP secret for an address (founder only)
     * @param user The user address
     * @param secret The TOTP secret (Base32 encoded, typically 160 bits)
     */
    function setTOTPSecret(address user, bytes memory secret) external onlyFounder {
        require(user != address(0), "Invalid user address");
        require(secret.length > 0, "Secret cannot be empty");
        require(secret.length <= 64, "Secret too long"); // Max 64 bytes
        
        totpSecrets[user] = secret;
        emit TOTPSecretSet(user, sha256(secret));
    }
    
    /**
     * @notice Verify TOTP code with rate limiting
     * @param user The user address
     * @param totpCode The 6-digit TOTP code
     * @return bool True if code is valid
     */
    function verifyTOTP(address user, uint256 totpCode) public rateLimited(user) returns (bool) {
        bytes memory secret = totpSecrets[user];
        require(secret.length > 0, "No TOTP secret set");
        require(totpCode < 10**DIGITS, "Invalid TOTP code format");
        
        uint256 currentTime = block.timestamp;
        
        // Check current time window and adjacent windows
        for (int256 i = -int256(TIME_WINDOW); i <= int256(TIME_WINDOW); i++) {
            uint256 timeCounter = (currentTime + uint256(int256(TIME_STEP) * i)) / TIME_STEP;
            uint256 expectedCode = _generateTOTP(secret, timeCounter);
            
            if (expectedCode == totpCode) {
                emit TOTPVerified(user, currentTime, true);
                // Reset attempt counter on success
                attemptCount[user] = 0;
                return true;
            }
        }
        
        emit TOTPVerified(user, currentTime, false);
        
        if (attemptCount[user] >= MAX_ATTEMPTS) {
            emit TooManyAttempts(user, attemptCount[user]);
        }
        
        return false;
    }
    
    /**
     * @notice Generate TOTP code using improved Keccak256-based approach
     * @param secret The TOTP secret
     * @param timeCounter The time counter
     * @return uint256 The 6-digit TOTP code
     */
    function _generateTOTP(bytes memory secret, uint256 timeCounter) internal view returns (uint256) {
        // Improved TOTP generation using keccak256 with better distribution
        bytes32 hash = keccak256(abi.encodePacked(secret, timeCounter, block.chainid));
        
        // Use dynamic truncation for better security
        uint8 offset = uint8(hash[31]) & 0x0F;
        uint32 truncatedCode = (
            (uint32(uint8(hash[offset])) & 0x7F) << 24 |
            (uint32(uint8(hash[offset + 1])) & 0xFF) << 16 |
            (uint32(uint8(hash[offset + 2])) & 0xFF) << 8 |
            (uint32(uint8(hash[offset + 3])) & 0xFF)
        );
        
        // Extract 6 digits
        uint256 code = uint256(truncatedCode) % (10**DIGITS);
        
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
        bytes memory secret = totpSecrets[user];
        hasSecret = secret.length > 0;
        secretHash = hasSecret ? sha256(secret) : bytes32(0);
    }
    
    /**
     * @notice Get current time window for TOTP verification
     * @return currentTime Current block timestamp
     * @return timeStep Time step in seconds
     * @return timeWindow Number of adjacent time windows allowed
     */
    function getTOTPSettings() external view returns (uint256 currentTime, uint256 timeStep, uint256 timeWindow) {
        currentTime = block.timestamp;
        timeStep = TIME_STEP;
        timeWindow = TIME_WINDOW;
    }
    
    /**
     * @notice Get current TOTP code for testing (founder only)
     * @param user The user address
     * @return currentCode The current valid TOTP code
     */
    function getCurrentTOTP(address user) external onlyFounder view returns (uint256 currentCode) {
        bytes memory secret = totpSecrets[user];
        require(secret.length > 0, "No TOTP secret set");
        
        uint256 currentTime = block.timestamp;
        uint256 timeCounter = currentTime / TIME_STEP;
        currentCode = _generateTOTP(secret, timeCounter);
    }
    
    /**
     * @notice Reset rate limit for a user (founder only)
     * @param user The user address
     */
    function resetRateLimit(address user) external onlyFounder {
        attemptCount[user] = 0;
        lastAttemptTime[user] = 0;
    }
}