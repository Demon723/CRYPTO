// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HeliosChipRegistry
 * @notice Maps NFC chip public keys to token IDs and prevents double-registration.
 *         This is the root of trust for the entire Helios Protocol.
 *         Each chip public key can only be bound to one token, ever.
 */
contract HeliosChipRegistry is Ownable {

    constructor() Ownable(msg.sender) {}

    // chipPublicKey => tokenId (0 if unregistered)
    mapping(bytes32 => uint256) public chipToToken;

    // tokenId => chipPublicKey
    mapping(uint256 => bytes32) public tokenToChip;

    // Prevent replay attacks: chipPublicKey => nonce => used
    mapping(bytes32 => mapping(uint256 => bool)) public usedNonces;

    // Protocol factory can register chips
    mapping(address => bool) public isMinter;

    event ChipRegistered(bytes32 indexed chipPublicKey, uint256 indexed tokenId);
    event MinterUpdated(address indexed minter, bool status);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Helios: not minter");
        _;
    }

    function setMinter(address minter, bool status) external onlyOwner {
        isMinter[minter] = status;
        emit MinterUpdated(minter, status);
    }

    /**
     * @notice Register a chip public key to a token ID. One-time only.
     * @param chipPublicKey The chip's public key (hashed for privacy/storage)
     * @param tokenId The token this chip will control
     */
    function registerChip(bytes32 chipPublicKey, uint256 tokenId) external onlyMinter {
        require(chipPublicKey != bytes32(0), "Helios: invalid chip");
        require(tokenId != 0, "Helios: invalid token");
        require(chipToToken[chipPublicKey] == 0, "Helios: chip already registered");
        require(tokenToChip[tokenId] == bytes32(0), "Helios: token already has chip");

        chipToToken[chipPublicKey] = tokenId;
        tokenToChip[tokenId] = chipPublicKey;

        emit ChipRegistered(chipPublicKey, tokenId);
    }

    /**
     * @notice Verify a chip signature against a registered chip.
     * @param tokenId The token being acted upon
     * @param hash The message hash that was signed
     * @param signature The chip's ECDSA signature
     * @return valid True if signature matches the registered chip
     */
    function verifyChipSignature(
        uint256 tokenId,
        bytes32 hash,
        bytes memory signature
    ) external view returns (bool valid) {
        bytes32 chipKey = tokenToChip[tokenId];
        if (chipKey == bytes32(0)) return false;

        address signer = recoverSigner(hash, signature);
        return keccak256(abi.encodePacked(signer)) == chipKey;
    }

    /**
     * @notice Mark a nonce as used for a chip. Called by PBT contract during transfer.
     */
    function consumeNonce(bytes32 chipPublicKey, uint256 nonce) external onlyMinter {
        usedNonces[chipPublicKey][nonce] = true;
    }

    function isNonceUsed(bytes32 chipPublicKey, uint256 nonce) external view returns (bool) {
        return usedNonces[chipPublicKey][nonce];
    }

    // --- ECDSA Recovery ---

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) 
        internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Helios: invalid sig length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
