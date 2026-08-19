// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HeliosChipRegistry.sol";
import "./HeliosRenderer.sol";

/**
 * @title HeliosPBT
 * @notice Physical-Bound Token implementation for Helios Sun Coin.
 *         
 *         CRITICAL PROPERTY: A token cannot be transferred without a valid
 *         ECDSA signature from its bonded NFC chip. This enforces the
 *         "physical possession = digital ownership" invariant.
 *         
 *         The chip signs: keccak256(tokenId || to || nonce || chainId || block.timestamp)
 *         The contract verifies the signer matches the registered chip public key.
 *         Each nonce can only be used once.
 *         
 *         Tap mechanics: Anyone can call tap() with a chip signature. This
 *         increments tapCount, updates lastTapTime, and evolves the on-chain art.
 */
contract HeliosPBT is ERC721, Ownable, Pausable, ReentrancyGuard {

    HeliosChipRegistry public immutable chipRegistry;

    // Token state
    struct TokenState {
        uint256 tapCount;
        uint256 lastTapTime;
        uint8 tier;
        bool minted;
    }
    mapping(uint256 => TokenState) public state;

    // Nonce tracking for replay protection (local to this contract)
    mapping(uint256 => bool) public usedNonces;

    // Mint pricing
    uint256 public mintPrice;
    uint256 public maxSupply;
    uint256 public totalMinted;

    // Protocol fee (for factory-deployed collections)
    address public protocolTreasury;
    uint256 public protocolFeeBps; // Basis points (100 = 1%)

    // Metadata
    string public collectionName;
    string public collectionSymbol;

    // Events
    event Tapped(uint256 indexed tokenId, uint256 tapCount, uint256 timestamp);
    event TransferredWithProof(uint256 indexed tokenId, address indexed from, address indexed to, uint256 nonce);
    event Minted(uint256 indexed tokenId, bytes32 indexed chipPublicKey, address indexed to, uint8 tier);

    modifier validToken(uint256 tokenId) {
        require(state[tokenId].minted, "HeliosPBT: token not minted");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address _chipRegistry,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address _protocolTreasury,
        uint256 _protocolFeeBps
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        chipRegistry = HeliosChipRegistry(_chipRegistry);
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        protocolTreasury = _protocolTreasury;
        protocolFeeBps = _protocolFeeBps;
        collectionName = name_;
        collectionSymbol = symbol_;
    }

    // ============================================================
    // MINTING
    // ============================================================

    /**
     * @notice Mint a new PBT. Only callable by owner or factory.
     * @param to Recipient address
     * @param tokenId The token ID (must be sequential or chosen by minter)
     * @param chipPublicKey The chip's public key hash (keccak256 of pubkey)
     * @param tier 0=Genesis, 1=Solar, 2=MainSequence, 3=RedGiant, 4=Supernova
     */
    function mint(
        address to,
        uint256 tokenId,
        bytes32 chipPublicKey,
        uint8 tier
    ) external payable onlyOwner nonReentrant whenNotPaused {
        require(totalMinted < maxSupply, "HeliosPBT: max supply reached");
        require(!state[tokenId].minted, "HeliosPBT: already minted");
        require(chipPublicKey != bytes32(0), "HeliosPBT: invalid chip");
        require(msg.value >= mintPrice, "HeliosPBT: insufficient payment");

        // Register chip in global registry
        chipRegistry.registerChip(chipPublicKey, tokenId);

        // Initialize state
        state[tokenId] = TokenState({
            tapCount: 0,
            lastTapTime: block.timestamp,
            tier: tier,
            minted: true
        });

        totalMinted++;

        _safeMint(to, tokenId);

        // Forward protocol fee if applicable
        if (protocolFeeBps > 0 && protocolTreasury != address(0)) {
            uint256 fee = (msg.value * protocolFeeBps) / 10000;
            (bool success, ) = protocolTreasury.call{value: fee}("");
            require(success, "HeliosPBT: fee transfer failed");
        }

        emit Minted(tokenId, chipPublicKey, to, tier);
    }

    /**
     * @notice Batch mint for drops. Only owner.
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata tokenIds,
        bytes32[] calldata chipPublicKeys,
        uint8[] calldata tiers
    ) external onlyOwner nonReentrant whenNotPaused {
        require(
            recipients.length == tokenIds.length &&
            tokenIds.length == chipPublicKeys.length &&
            chipPublicKeys.length == tiers.length,
            "HeliosPBT: array length mismatch"
        );
        require(totalMinted + recipients.length <= maxSupply, "HeliosPBT: exceeds max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(!state[tokenIds[i]].minted, "HeliosPBT: already minted");
            chipRegistry.registerChip(chipPublicKeys[i], tokenIds[i]);
            state[tokenIds[i]] = TokenState({
                tapCount: 0,
                lastTapTime: block.timestamp,
                tier: tiers[i],
                minted: true
            });
            totalMinted++;
            _safeMint(recipients[i], tokenIds[i]);
            emit Minted(tokenIds[i], chipPublicKeys[i], recipients[i], tiers[i]);
        }
    }

    // ============================================================
    // TAP MECHANICS (The "Living Object")
    // ============================================================

    /**
     * @notice Record a tap from the physical coin. Anyone can submit a verified tap.
     *         The chip must sign: keccak256("TAP" || tokenId || nonce || block.timestamp)
     *         This evolves the art and proves the object is still in circulation.
     * @param tokenId The token being tapped
     * @param nonce Unique nonce to prevent replay
     * @param chipSignature ECDSA signature from the bonded chip
     */
    function tap(
        uint256 tokenId,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) whenNotPaused {
        require(!usedNonces[nonce], "HeliosPBT: nonce used");

        bytes32 hash = keccak256(abi.encodePacked(
            "TAP",
            tokenId,
            nonce,
            block.timestamp / 300 // 5-minute time buckets to allow clock drift
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "HeliosPBT: invalid chip signature"
        );

        usedNonces[nonce] = true;
        state[tokenId].tapCount++;
        state[tokenId].lastTapTime = block.timestamp;

        emit Tapped(tokenId, state[tokenId].tapCount, block.timestamp);
    }

    // ============================================================
    // PHYSICAL-BOUND TRANSFERS (PBT Pattern)
    // ============================================================

    /**
     * @notice Transfer a token with proof of physical possession.
     *         The chip must sign: keccak256("TRANSFER" || tokenId || to || nonce || chainId)
     *         This is the ONLY way to transfer a Helios PBT.
     *         Standard transferFrom() and safeTransferFrom() are disabled.
     */
    function transferWithProof(
        uint256 tokenId,
        address to,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) whenNotPaused nonReentrant {
        require(to != address(0), "HeliosPBT: invalid recipient");
        require(!usedNonces[nonce], "HeliosPBT: nonce used");
        require(ownerOf(tokenId) == msg.sender, "HeliosPBT: not owner");

        bytes32 hash = keccak256(abi.encodePacked(
            "TRANSFER",
            tokenId,
            to,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "HeliosPBT: invalid chip signature"
        );

        usedNonces[nonce] = true;

        _transfer(msg.sender, to, tokenId);

        emit TransferredWithProof(tokenId, msg.sender, to, nonce);
    }

    /**
     * @notice Override transferFrom to enforce PBT pattern.
     *         Direct transfers without chip proof are blocked.
     */
    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("HeliosPBT: use transferWithProof");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("HeliosPBT: use transferWithProof");
    }

    // ============================================================
    // METADATA (On-chain)
    // ============================================================

    function tokenURI(uint256 tokenId) public view override validToken(tokenId) returns (string memory) {
        TokenState memory s = state[tokenId];
        string memory name = string(abi.encodePacked(collectionName, " #", _toString(tokenId)));

        return HeliosRenderer.tokenURI(HeliosRenderer.TokenData({
            tokenId: tokenId,
            tapCount: s.tapCount,
            lastTapTime: s.lastTapTime,
            tier: s.tier,
            name: name
        }));
    }

    function getTokenState(uint256 tokenId) external view validToken(tokenId) returns (TokenState memory) {
        return state[tokenId];
    }

    // ============================================================
    // ADMIN
    // ============================================================

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 2000, "HeliosPBT: max 20%");
        protocolFeeBps = _feeBps;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "HeliosPBT: withdraw failed");
    }

    // ============================================================
    // UTILS
    // ============================================================

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }

    receive() external payable {}
}
