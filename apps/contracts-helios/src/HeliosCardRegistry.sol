// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HeliosCardRegistry
 * @notice Generates unique card numbers and registers cardholder identity.
 *         This is the "American Express" layer of Helios — premium only.
 *
 *         Card Number Format: H-XXXX-XXXX-XXXX-X (15 digits, Amex-style)
 *         - "H" prefix = Helios
 *         - First 4 digits = Tier + Series
 *         - Next 4 digits = Token ID (padded)
 *         - Next 4 digits = Random salt
 *         - Last digit = Luhn checksum
 *
 *         Cardholder data is stored as hashes (privacy-preserving KYC).
 *         Only founders can register cardholders.
 */
contract HeliosCardRegistry is Ownable {

    struct Cardholder {
        string cardNumber;          // e.g., "H-3746-8291-0547-2"
        bytes32 nameHash;           // keccak256(full name)
        bytes32 kycHash;            // keccak256(KYC document hash)
        uint256 registeredAt;
        bool registered;
    }

    // tokenId => Cardholder
    mapping(uint256 => Cardholder) public cardholders;

    // cardNumber => tokenId (reverse lookup)
    mapping(string => uint256) public cardToToken;

    // Prevent duplicate card numbers
    mapping(bytes32 => bool) public usedCardNumbers;

    // Authorized minters (founders)
    mapping(address => bool) public isRegistrar;

    // Card number counter for uniqueness
    uint256 private _cardCounter;

    event CardholderRegistered(
        uint256 indexed tokenId,
        string cardNumber,
        bytes32 nameHash,
        uint256 registeredAt
    );
    event RegistrarUpdated(address indexed account, bool status);

    modifier onlyRegistrar() {
        require(isRegistrar[msg.sender] || msg.sender == owner(), "HeliosCard: not registrar");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setRegistrar(address account, bool status) external onlyOwner {
        isRegistrar[account] = status;
        emit RegistrarUpdated(account, status);
    }

    /**
     * @notice Register a cardholder for a premium token.
     *         Only callable by authorized registrars (founders).
     *         Generates a unique card number and stores identity hashes.
     *
     * @param tokenId The Helios token ID
     * @param tier The token tier (affects card number prefix)
     * @param nameHash keccak256 of the cardholder's full name
     * @param kycHash keccak256 of the KYC verification document
     * @return cardNumber The generated unique card number
     */
    function registerCardholder(
        uint256 tokenId,
        uint8 tier,
        bytes32 nameHash,
        bytes32 kycHash
    ) external onlyRegistrar returns (string memory cardNumber) {
        require(!cardholders[tokenId].registered, "HeliosCard: already registered");
        require(nameHash != bytes32(0), "HeliosCard: invalid name");

        cardNumber = _generateCardNumber(tokenId, tier);
        bytes32 cardHash = keccak256(bytes(cardNumber));
        require(!usedCardNumbers[cardHash], "HeliosCard: duplicate");

        usedCardNumbers[cardHash] = true;
        cardToToken[cardNumber] = tokenId;

        cardholders[tokenId] = Cardholder({
            cardNumber: cardNumber,
            nameHash: nameHash,
            kycHash: kycHash,
            registeredAt: block.timestamp,
            registered: true
        });

        emit CardholderRegistered(tokenId, cardNumber, nameHash, block.timestamp);
        return cardNumber;
    }

    /**
     * @notice Update KYC hash (e.g., re-verification). Only registrar.
     */
    function updateKYCHash(uint256 tokenId, bytes32 newKycHash) external onlyRegistrar {
        require(cardholders[tokenId].registered, "HeliosCard: not registered");
        cardholders[tokenId].kycHash = newKycHash;
    }

    /**
     * @notice Get cardholder info for a token.
     */
    function getCardholder(uint256 tokenId)
        external view returns (Cardholder memory) {
        return cardholders[tokenId];
    }

    /**
     * @notice Check if a token has a registered cardholder.
     */
    function isRegistered(uint256 tokenId) external view returns (bool) {
        return cardholders[tokenId].registered;
    }

    /**
     * @notice Get token ID by card number.
     */
    function getTokenByCard(string calldata cardNumber) external view returns (uint256) {
        return cardToToken[cardNumber];
    }

    // ============================================================
    // CARD NUMBER GENERATION
    // ============================================================

    /**
     * @notice Generate a unique Amex-style card number.
     *         Format: H-XXXX-XXXX-XXXX-X
     *         - Position 1-4: Tier prefix + series
     *         - Position 5-8: Token ID (mod 10000)
     *         - Position 9-12: Random counter
     *         - Position 13: Luhn checksum
     */
    function _generateCardNumber(uint256 tokenId, uint8 tier)
        internal returns (string memory) {

        _cardCounter++;

        // Build numeric parts
        uint256 part1 = _tierPrefix(tier) * 1000 + (_cardCounter % 1000);
        uint256 part2 = tokenId % 10000;
        uint256 part3 = uint256(keccak256(abi.encodePacked(
            block.timestamp, msg.sender, _cardCounter, tokenId
        ))) % 10000;

        // Concatenate as string: "H-XXXX-XXXX-XXXX"
        string memory base = string(abi.encodePacked(
            "H-",
            _uintToString(part1, 4), "-",
            _uintToString(part2, 4), "-",
            _uintToString(part3, 4), "-"
        ));

        // Calculate Luhn checksum on the numeric digits only
        uint256 checksum = _luhnChecksum(part1, part2, part3);

        return string(abi.encodePacked(base, _uintToString(checksum, 1)));
    }

    function _tierPrefix(uint8 tier) internal pure returns (uint256) {
        if (tier == 0) return 3; // Genesis = 3xxx
        if (tier == 4) return 7; // Supernova = 7xxx
        return 1; // Fallback
    }

    function _luhnChecksum(uint256 p1, uint256 p2, uint256 p3)
        internal pure returns (uint256) {
        // Simplified Luhn on concatenated digits
        uint256 combined = p1 * 100000000 + p2 * 10000 + p3;
        uint256 sum = 0;
        bool doubleDigit = true;
        while (combined > 0) {
            uint256 digit = combined % 10;
            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            combined /= 10;
            doubleDigit = !doubleDigit;
        }
        return (10 - (sum % 10)) % 10;
    }

    function _uintToString(uint256 value, uint256 digits)
        internal pure returns (string memory) {
        bytes memory buffer = new bytes(digits);
        for (uint256 i = digits; i > 0; i--) {
            buffer[i - 1] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
