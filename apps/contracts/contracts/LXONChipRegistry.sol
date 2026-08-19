// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONTOTPAuth.sol";

/**
 * @title LXON Chip Registry (Standalone Blockchain)
 * @dev Root of trust for physical chip authentication in LXON standalone blockchain
 * Based on Helios architecture but adapted for standalone LXON
 */
contract LXONChipRegistry {
    // Chip data structure
    struct ChipData {
        bytes32 publicKey; // Chip's public key
        uint256 mintedAt;  // When chip was minted
        bool active;       // Chip status
        bytes metadata;    // Optional chip metadata
    }

    // Mapping from chip ID to chip data
    mapping(uint256 => ChipData) public chips;
    
    // Mapping from public key to chip ID (reverse lookup)
    mapping(bytes32 => uint256) public chipIdByPublicKey;
    
    // Founder can mint chips
    address public founder;
    uint256 public chipCount;
    
    // TOTP authentication
    LXONTOTPAuth public totpAuth;
    
    // Events
    event ChipMinted(uint256 indexed chipId, bytes32 publicKey, uint256 mintedAt);
    event ChipDeactivated(uint256 indexed chipId);
    event ChipMetadataUpdated(uint256 indexed chipId, bytes metadata);

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
     * @notice Mint a new chip (founder only with TOTP)
     * @param publicKey The chip's public key
     * @param metadata Optional metadata
     * @param totpCode The founder's TOTP code
     * @return chipId The new chip ID
     */
    function mintChip(bytes32 publicKey, bytes memory metadata, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) returns (uint256) {
        require(publicKey != bytes32(0), "Invalid public key");
        require(chipIdByPublicKey[publicKey] == 0, "Chip already exists");

        chipCount++;
        uint256 chipId = chipCount;

        chips[chipId] = ChipData({
            publicKey: publicKey,
            mintedAt: block.timestamp,
            active: true,
            metadata: metadata
        });

        chipIdByPublicKey[publicKey] = chipId;

        emit ChipMinted(chipId, publicKey, block.timestamp);
        return chipId;
    }

    /**
     * @notice Deactivate a chip (founder only with TOTP)
     * @param chipId The chip ID to deactivate
     * @param totpCode The founder's TOTP code
     */
    function deactivateChip(uint256 chipId, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        require(chips[chipId].active, "Chip not active");
        chips[chipId].active = false;
        emit ChipDeactivated(chipId);
    }

    /**
     * @notice Update chip metadata (founder only with TOTP)
     * @param chipId The chip ID
     * @param metadata New metadata
     * @param totpCode The founder's TOTP code
     */
    function updateChipMetadata(uint256 chipId, bytes memory metadata, uint256 totpCode) external onlyFounder withFounderTOTP(totpCode) {
        require(chips[chipId].active, "Chip not active");
        chips[chipId].metadata = metadata;
        emit ChipMetadataUpdated(chipId, metadata);
    }

    /**
     * @notice Check if a chip is valid and active
     * @param chipId The chip ID
     * @return bool True if chip is valid and active
     */
    function isChipValid(uint256 chipId) external view returns (bool) {
        return chips[chipId].active && chips[chipId].mintedAt > 0;
    }

    /**
     * @notice Get chip data
     * @param chipId The chip ID
     */
    function getChipData(uint256 chipId) external view returns (
        bytes32 publicKey,
        uint256 mintedAt,
        bool active,
        bytes memory metadata
    ) {
        ChipData memory chip = chips[chipId];
        return (chip.publicKey, chip.mintedAt, chip.active, chip.metadata);
    }

    /**
     * @notice Get chip ID from public key
     * @param publicKey The chip's public key
     * @return chipId The chip ID
     */
    function getChipIdByPublicKey(bytes32 publicKey) external view returns (uint256) {
        return chipIdByPublicKey[publicKey];
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