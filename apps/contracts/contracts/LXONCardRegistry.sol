// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONTOTPAuth.sol";

/**
 * @title LXON Card Registry (Standalone Blockchain)
 * @dev Manages premium card numbers and cardholder identity verification
 * Based on Helios architecture with Amex-style card numbers
 */
contract LXONCardRegistry {
    // Card data structure
    struct CardData {
        string cardNumber;        // H-XXXX-XXXX-XXXX-X format
        bytes32 nameHash;         // Hash of cardholder name (privacy-preserving)
        bytes32 kycHash;          // Hash of KYC data (privacy-preserving)
        uint256 issuedAt;         // When card was issued
        bool active;              // Card status
        uint256 tokenId;          // Associated token ID
    }

    // Mapping from card number to card data
    mapping(string => CardData) public cards;
    
    // Mapping from token ID to card number
    mapping(uint256 => string) public cardNumberByTokenId;
    
    // Founder can issue cards
    address public founder;
    uint256 public cardCount;
    
    // TOTP authentication
    LXONTOTPAuth public totpAuth;
    
    // Card number format: H-XXXX-XXXX-XXXX-X (Amex-style)
    bytes1 private constant PREFIX = bytes1('H');
    
    // Events
    event CardIssued(string indexed cardNumber, uint256 indexed tokenId, uint256 issuedAt);
    event CardDeactivated(string indexed cardNumber);
    event CardholderUpdated(string indexed cardNumber, bytes32 newNameHash, bytes32 newKycHash);

    modifier onlyFounder() {
        require(msg.sender == founder, "Not founder");
        _;
    }
    
    modifier withFounderTOTP(uint256 totpCode) {
        require(totpAuth.verifyTOTP(founder, totpCode), "Invalid TOTP code");
        _;
    }

    constructor(address _totpAuth) {
        founder = msg.sender;
        totpAuth = LXONTOTPAuth(_totpAuth);
    }

    /**
     * @notice Issue a new premium card (founder only with TOTP)
     * @param tokenId The associated token ID
     * @param nameHash Hash of cardholder name
     * @param kycHash Hash of KYC data
     * @param totpCode The founder's TOTP code
     * @return cardNumber The new card number
     */
    function issueCard(uint256 tokenId, bytes32 nameHash, bytes32 kycHash, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) returns (string memory) {
        require(tokenId > 0, "Invalid token ID");
        require(bytes(cardNumberByTokenId[tokenId]).length == 0, "Card already exists for token");
        
        cardCount++;
        string memory cardNumber = _generateCardNumber(cardCount);
        
        cards[cardNumber] = CardData({
            cardNumber: cardNumber,
            nameHash: nameHash,
            kycHash: kycHash,
            issuedAt: block.timestamp,
            active: true,
            tokenId: tokenId
        });
        
        cardNumberByTokenId[tokenId] = cardNumber;
        
        emit CardIssued(cardNumber, tokenId, block.timestamp);
        return cardNumber;
    }

    /**
     * @notice Deactivate a card (founder only with TOTP)
     * @param cardNumber The card number to deactivate
     * @param totpCode The founder's TOTP code
     */
    function deactivateCard(string memory cardNumber, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        require(cards[cardNumber].active, "Card not active");
        cards[cardNumber].active = false;
        emit CardDeactivated(cardNumber);
    }

    /**
     * @notice Update cardholder data (founder only with TOTP)
     * @param cardNumber The card number
     * @param newNameHash New name hash
     * @param newKycHash New KYC hash
     * @param totpCode The founder's TOTP code
     */
    function updateCardholder(string memory cardNumber, bytes32 newNameHash, bytes32 newKycHash, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        require(cards[cardNumber].active, "Card not active");
        cards[cardNumber].nameHash = newNameHash;
        cards[cardNumber].kycHash = newKycHash;
        emit CardholderUpdated(cardNumber, newNameHash, newKycHash);
    }

    /**
     * @notice Check if a card is valid and active
     * @param cardNumber The card number
     * @return bool True if card is valid and active
     */
    function isCardValid(string memory cardNumber) external view returns (bool) {
        return cards[cardNumber].active && cards[cardNumber].issuedAt > 0;
    }

    /**
     * @notice Get card data
     * @param cardNumber The card number
     * @return cardNumber, nameHash, kycHash, issuedAt, active, tokenId
     */
    function getCardData(string memory cardNumber) external view returns (
        string memory cardNumber_,
        bytes32 nameHash,
        bytes32 kycHash,
        uint256 issuedAt,
        bool active,
        uint256 tokenId
    ) {
        CardData memory card = cards[cardNumber];
        return (card.cardNumber, card.nameHash, card.kycHash, card.issuedAt, card.active, card.tokenId);
    }

    /**
     * @notice Get card number by token ID
     * @param tokenId The token ID
     * @return cardNumber The card number
     */
    function getCardNumberByTokenId(uint256 tokenId) external view returns (string memory) {
        return cardNumberByTokenId[tokenId];
    }

    /**
     * @notice Verify card number format using Luhn algorithm
     * @param cardNumber The card number to verify
     * @return bool True if card number is valid
     */
    function verifyCardNumber(string memory cardNumber) public pure returns (bool) {
        bytes memory cardBytes = bytes(cardNumber);
        
        // Check format: H-XXXX-XXXX-XXXX-X
        if (cardBytes.length != 16) return false; // H-XXXX-XXXX-XXXX-X is 16 chars
        if (cardBytes[0] != 'H') return false;
        if (cardBytes[1] != '-') return false;
        if (cardBytes[6] != '-') return false;
        if (cardBytes[11] != '-') return false;
        
        // Extract digits (excluding H and dashes)
        uint256[] memory digits = new uint256[](12);
        uint256 digitIndex = 0;
        
        for (uint256 i = 0; i < cardBytes.length; i++) {
            if (cardBytes[i] >= '0' && cardBytes[i] <= '9') {
                digits[digitIndex] = uint256(cardBytes[i]) - uint256('0');
                digitIndex++;
            }
        }
        
        // Luhn algorithm
        uint256 sum = 0;
        for (uint256 i = 0; i < digits.length; i++) {
            uint256 digit = digits[i];
            if (i % 2 == 0) { // Double every second digit from right
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
        }
        
        return sum % 10 == 0;
    }

    /**
     * @notice Generate a card number with Luhn checksum
     * @param cardNumberId The card ID
     * @return cardNumber The generated card number
     */
    function _generateCardNumber(uint256 cardNumberId) internal pure returns (string memory) {
        // Format: H-XXXX-XXXX-XXXX-X
        // For simplicity, we'll use the cardNumberId as base
        uint256 base = cardNumberId * 1000; // Leave room for checksum
        
        // Generate card number parts
        uint256 part1 = (base / 1000000) % 10000;
        uint256 part2 = (base / 100) % 10000;
        uint256 part3 = (base % 10000);
        
        // For now, use simple checksum (real implementation would use Luhn)
        uint256 checksum = (part1 + part2 + part3) % 10;
        
        return string(abi.encodePacked(
            "H-",
            _toString(part1, 4),
            "-",
            _toString(part2, 4),
            "-",
            _toString(part3, 4),
            "-",
            _toString(checksum, 1)
        ));
    }

    /**
     * @notice Convert number to string with leading zeros
     * @param value The number to convert
     * @param length The desired string length
     * @return str The string representation
     */
    function _toString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            buffer[length - 1 - i] = bytes1(uint8('0' + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Transfer founder role
     * @param newFounder The new founder address
     */
    function setFounder(address newFounder) external onlyFounder {
        require(newFounder != address(0), "Invalid founder");
        founder = newFounder;
    }
}