// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HeliosChipRegistry.sol";
import "./HeliosRenderer.sol";

/**
 * @title HeliosPBTv2
 * @notice Physical-Bound Token with Founder-Gated Lifecycle + Wallet Binding + Key Utility
 *
 *         NEW FEATURES:
 *         1. ACTIVATION / FREEZING / DEACTIVATION — Only founders/team can change token status.
 *            - INACTIVE: Minted but not yet activated. Cannot transfer, cannot be used as key.
 *            - ACTIVE: Fully operational. Can transfer (with chip proof), can be used as key.
 *            - FROZEN: Temporarily suspended by founders. Ownership retained but utility blocked.
 *            - DEACTIVATED: Permanently disabled. Cannot transfer, cannot be used. Traceable but dead.
 *
 *         2. TAP-TO-BIND WALLET — User taps physical coin to mobile. Chip signs a binding message.
 *            The NFT is cryptographically linked to that wallet. Only the bound wallet can use it as a key.
 *            A token can be rebound to a new wallet, but only with a fresh chip signature.
 *
 *         3. NFT-AS-KEY — External dApps/contracts call isKeyValid(wallet) to check if the wallet
 *            holds an active, non-frozen Helios coin. The coin becomes a physical access credential.
 *            Example: "Tap your coin to unlock the door / enter the event / access the Discord."
 *
 *         SECURITY MODEL:
 *         - Founder roles are separate from ownership. Owner can add/remove founders.
 *         - Chip signature required for ALL state changes that involve the physical object:
 *           bindWallet, transferWithProof, tap.
 *         - Admin functions (activate/freeze/deactivate) require only founder role — these are
 *           trust decisions by the team, not cryptographic proofs.
 *         - A deactivated token is irreversibly burned from utility but remains on-chain for provenance.
 */
contract HeliosPBTv2 is ERC721, Ownable, Pausable, ReentrancyGuard {

    HeliosChipRegistry public immutable chipRegistry;

    // ============================================================
    // ENUMS & STRUCTS
    // ============================================================

    enum TokenStatus {
        INACTIVE,      // 0: Minted, awaiting founder activation
        ACTIVE,        // 1: Fully operational
        FROZEN,        // 2: Suspended by founders (investigation, dispute, etc.)
        DEACTIVATED    // 3: Permanently killed by founders (lost, stolen, counterfeit)
    }

    struct TokenState {
        uint256 tapCount;
        uint256 lastTapTime;
        uint8 tier;
        bool minted;
        TokenStatus status;
        address boundWallet;      // The wallet this coin is bound to (0x0 = unbound)
        uint256 boundAt;          // Timestamp of last binding
    }

    // ============================================================
    // STATE
    // ============================================================

    mapping(uint256 => TokenState) public state;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => bool) public isFounder;
    mapping(address => uint256) public walletToToken; // One active key per wallet (optional enforcement)

    uint256 public mintPrice;
    uint256 public maxSupply;
    uint256 public totalMinted;

    address public protocolTreasury;
    uint256 public protocolFeeBps;

    string public collectionName;
    string public collectionSymbol;

    // ============================================================
    // EVENTS
    // ============================================================

    event Tapped(uint256 indexed tokenId, uint256 tapCount, uint256 timestamp);
    event TransferredWithProof(uint256 indexed tokenId, address indexed from, address indexed to, uint256 nonce);
    event Minted(uint256 indexed tokenId, bytes32 indexed chipPublicKey, address indexed to, uint8 tier);

    event Activated(uint256 indexed tokenId, address indexed founder);
    event Frozen(uint256 indexed tokenId, address indexed founder, string reason);
    event Deactivated(uint256 indexed tokenId, address indexed founder, string reason);

    event WalletBound(uint256 indexed tokenId, address indexed wallet, uint256 timestamp);
    event WalletRebound(uint256 indexed tokenId, address indexed oldWallet, address indexed newWallet, uint256 timestamp);

    event KeyUsed(uint256 indexed tokenId, address indexed wallet, bytes32 indexed actionHash);
    event FounderUpdated(address indexed account, bool status);

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier validToken(uint256 tokenId) {
        require(state[tokenId].minted, "Helios: token not minted");
        _;
    }

    modifier onlyFounder() {
        require(isFounder[msg.sender] || msg.sender == owner(), "Helios: not founder");
        _;
    }

    modifier onlyActive(uint256 tokenId) {
        require(state[tokenId].status == TokenStatus.ACTIVE, "Helios: token not active");
        _;
    }

    modifier notDeactivated(uint256 tokenId) {
        require(state[tokenId].status != TokenStatus.DEACTIVATED, "Helios: token deactivated");
        _;
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

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

        // Deployer is first founder
        isFounder[msg.sender] = true;
        emit FounderUpdated(msg.sender, true);
    }

    // ============================================================
    // FOUNDER MANAGEMENT
    // ============================================================

    function setFounder(address account, bool status) external onlyOwner {
        isFounder[account] = status;
        emit FounderUpdated(account, status);
    }

    // ============================================================
    // MINTING (Tokens mint as INACTIVE — founders must activate)
    // ============================================================

    function mint(
        address to,
        uint256 tokenId,
        bytes32 chipPublicKey,
        uint8 tier
    ) external payable onlyOwner nonReentrant whenNotPaused {
        require(totalMinted < maxSupply, "Helios: max supply reached");
        require(!state[tokenId].minted, "Helios: already minted");
        require(chipPublicKey != bytes32(0), "Helios: invalid chip");
        require(msg.value >= mintPrice, "Helios: insufficient payment");

        chipRegistry.registerChip(chipPublicKey, tokenId);

        state[tokenId] = TokenState({
            tapCount: 0,
            lastTapTime: block.timestamp,
            tier: tier,
            minted: true,
            status: TokenStatus.INACTIVE,  // <-- FOUNDERS MUST ACTIVATE
            boundWallet: address(0),
            boundAt: 0
        });

        totalMinted++;
        _safeMint(to, tokenId);

        if (protocolFeeBps > 0 && protocolTreasury != address(0)) {
            uint256 fee = (msg.value * protocolFeeBps) / 10000;
            (bool success, ) = protocolTreasury.call{value: fee}("");
            require(success, "Helios: fee transfer failed");
        }

        emit Minted(tokenId, chipPublicKey, to, tier);
    }

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
            "Helios: array length mismatch"
        );
        require(totalMinted + recipients.length <= maxSupply, "Helios: exceeds max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(!state[tokenIds[i]].minted, "Helios: already minted");
            chipRegistry.registerChip(chipPublicKeys[i], tokenIds[i]);
            state[tokenIds[i]] = TokenState({
                tapCount: 0,
                lastTapTime: block.timestamp,
                tier: tiers[i],
                minted: true,
                status: TokenStatus.INACTIVE,
                boundWallet: address(0),
                boundAt: 0
            });
            totalMinted++;
            _safeMint(recipients[i], tokenIds[i]);
            emit Minted(tokenIds[i], chipPublicKeys[i], recipients[i], tiers[i]);
        }
    }

    // ============================================================
    // FOUNDER-GATED LIFECYCLE: ACTIVATE / FREEZE / DEACTIVATE
    // ============================================================

    /**
     * @notice Activate a token. Only founders. Moves INACTIVE → ACTIVE.
     *         This is the "go live" switch after KYC, shipping confirmation, etc.
     */
    function activate(uint256 tokenId) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.INACTIVE, "Helios: not inactive");
        state[tokenId].status = TokenStatus.ACTIVE;
        emit Activated(tokenId, msg.sender);
    }

    /**
     * @notice Batch activate. Only founders.
     */
    function batchActivate(uint256[] calldata tokenIds) external onlyFounder {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (state[tokenId].minted && state[tokenId].status == TokenStatus.INACTIVE) {
                state[tokenId].status = TokenStatus.ACTIVE;
                emit Activated(tokenId, msg.sender);
            }
        }
    }

    /**
     * @notice Freeze a token. Only founders. Moves ACTIVE → FROZEN.
     *         Use for: dispute resolution, suspected theft, regulatory hold.
     *         Frozen tokens cannot transfer, cannot be used as keys.
     *         Ownership is NOT revoked — the owner still holds the NFT.
     */
    function freeze(uint256 tokenId, string calldata reason) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.ACTIVE, "Helios: not active");
        state[tokenId].status = TokenStatus.FROZEN;
        emit Frozen(tokenId, msg.sender, reason);
    }

    /**
     * @notice Unfreeze a token. Only founders. Moves FROZEN → ACTIVE.
     */
    function unfreeze(uint256 tokenId) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.FROZEN, "Helios: not frozen");
        state[tokenId].status = TokenStatus.ACTIVE;
        emit Activated(tokenId, msg.sender);
    }

    /**
     * @notice Deactivate a token. Only founders. Moves ANY → DEACTIVATED.
     *         IRREVERSIBLE. Use for: confirmed counterfeit, permanent loss,
     *         regulatory seizure, or end-of-life.
     *         The token remains on-chain for provenance but is dead for utility.
     */
    function deactivate(uint256 tokenId, string calldata reason) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status != TokenStatus.DEACTIVATED, "Helios: already deactivated");

        // Clear wallet binding so it can never be used as a key again
        address oldWallet = state[tokenId].boundWallet;
        if (oldWallet != address(0)) {
            walletToToken[oldWallet] = 0;
        }
        state[tokenId].boundWallet = address(0);
        state[tokenId].status = TokenStatus.DEACTIVATED;

        emit Deactivated(tokenId, msg.sender, reason);
    }

    // ============================================================
    // TAP-TO-BIND WALLET
    // ============================================================

    /**
     * @notice Bind a wallet to a token via physical chip tap.
     *         The user taps the coin to their phone. The chip signs:
     *         keccak256("BIND" || tokenId || wallet || nonce || chainId)
     *         The contract verifies the chip signature and binds the wallet.
     *
     *         A token can be rebound, but only with a fresh chip signature.
     *         This ensures physical possession is always required to change the key holder.
     *
     *         Requirements:
     *         - Token must be ACTIVE (not INACTIVE, not FROZEN, not DEACTIVATED)
     *         - Caller must be the wallet being bound (prevents binding someone else without consent)
     *         - Chip signature must be valid
     */
    function bindWallet(
        uint256 tokenId,
        address wallet,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) onlyActive(tokenId) nonReentrant {
        require(wallet != address(0), "Helios: invalid wallet");
        require(msg.sender == wallet, "Helios: caller must be wallet");
        require(!usedNonces[nonce], "Helios: nonce used");

        bytes32 hash = keccak256(abi.encodePacked(
            "BIND",
            tokenId,
            wallet,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;

        address oldWallet = state[tokenId].boundWallet;

        // Clear old binding if exists
        if (oldWallet != address(0)) {
            walletToToken[oldWallet] = 0;
            emit WalletRebound(tokenId, oldWallet, wallet, block.timestamp);
        } else {
            emit WalletBound(tokenId, wallet, block.timestamp);
        }

        state[tokenId].boundWallet = wallet;
        state[tokenId].boundAt = block.timestamp;
        walletToToken[wallet] = tokenId;
    }

    /**
     * @notice Unbind wallet. Requires chip signature + caller is bound wallet.
     *         Use case: User wants to sell the coin. They unbind, then transfer.
     */
    function unbindWallet(
        uint256 tokenId,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) nonReentrant {
        require(state[tokenId].boundWallet == msg.sender, "Helios: not bound wallet");
        require(!usedNonces[nonce], "Helios: nonce used");

        bytes32 hash = keccak256(abi.encodePacked(
            "UNBIND",
            tokenId,
            msg.sender,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;
        walletToToken[msg.sender] = 0;
        state[tokenId].boundWallet = address(0);
        state[tokenId].boundAt = 0;
    }

    // ============================================================
    // TAP MECHANICS (Evolves art, proves circulation)
    // ============================================================

    function tap(
        uint256 tokenId,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) notDeactivated(tokenId) whenNotPaused {
        require(!usedNonces[nonce], "Helios: nonce used");

        bytes32 hash = keccak256(abi.encodePacked(
            "TAP",
            tokenId,
            nonce,
            block.timestamp / 300
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;
        state[tokenId].tapCount++;
        state[tokenId].lastTapTime = block.timestamp;

        emit Tapped(tokenId, state[tokenId].tapCount, block.timestamp);
    }

    // ============================================================
    // PHYSICAL-BOUND TRANSFERS (PBT Pattern)
    // ============================================================

    function transferWithProof(
        uint256 tokenId,
        address to,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) onlyActive(tokenId) whenNotPaused nonReentrant {
        require(to != address(0), "Helios: invalid recipient");
        require(!usedNonces[nonce], "Helios: nonce used");
        require(ownerOf(tokenId) == msg.sender, "Helios: not owner");

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
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;

        // Clear wallet binding on transfer — new owner must rebind
        address oldWallet = state[tokenId].boundWallet;
        if (oldWallet != address(0)) {
            walletToToken[oldWallet] = 0;
            state[tokenId].boundWallet = address(0);
            state[tokenId].boundAt = 0;
        }

        _transfer(msg.sender, to, tokenId);
        emit TransferredWithProof(tokenId, msg.sender, to, nonce);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("Helios: use transferWithProof");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Helios: use transferWithProof");
    }

    // ============================================================
    // NFT-AS-KEY: EXTERNAL UTILITY INTERFACE
    // ============================================================

    /**
     * @notice Check if a wallet holds a valid, active Helios key.
     *         External dApps, smart locks, event gates, Discord bots call this.
     *         Returns true ONLY if:
     *         - The wallet owns a token
     *         - The token is ACTIVE (not frozen, not deactivated)
     *         - The token is bound to this wallet (tap-to-bind was completed)
     *
     * @param wallet The wallet address to check
     * @return valid True if wallet holds a valid key
     * @return tokenId The token ID that serves as the key (0 if invalid)
     */
    function isKeyValid(address wallet) external view returns (bool valid, uint256 tokenId) {
        tokenId = walletToToken[wallet];
        if (tokenId == 0) return (false, 0);

        TokenState memory s = state[tokenId];
        if (!s.minted) return (false, 0);
        if (s.status != TokenStatus.ACTIVE) return (false, 0);
        if (s.boundWallet != wallet) return (false, 0);
        if (ownerOf(tokenId) != wallet) return (false, 0);

        return (true, tokenId);
    }

    /**
     * @notice Verify a key AND record that it was used for a specific action.
     *         This creates an on-chain audit trail of access events.
     *         The actionHash should be keccak256 of the action description
     *         (e.g., "ENTER_EVENT_2026_08_12" or keccak256(doorId + timestamp)).
     *
     *         Can be called by the key holder or by an authorized gate contract.
     */
    function useKey(bytes32 actionHash) external returns (bool) {
        (bool valid, uint256 tokenId) = this.isKeyValid(msg.sender);
        require(valid, "Helios: invalid key");

        emit KeyUsed(tokenId, msg.sender, actionHash);
        return true;
    }

    /**
     * @notice Batch check multiple wallets. For event gates, airdrop eligibility, etc.
     */
    function batchIsKeyValid(address[] calldata wallets)
        external view returns (bool[] memory valid, uint256[] memory tokenIds) {
        valid = new bool[](wallets.length);
        tokenIds = new uint256[](wallets.length);
        for (uint256 i = 0; i < wallets.length; i++) {
            (valid[i], tokenIds[i]) = this.isKeyValid(wallets[i]);
        }
    }

    // ============================================================
    // METADATA
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

    // ============================================================
    // VIEWS
    // ============================================================

    function getTokenStatus(uint256 tokenId) external view validToken(tokenId) returns (TokenStatus) {
        return state[tokenId].status;
    }

    function getBoundWallet(uint256 tokenId) external view validToken(tokenId) returns (address) {
        return state[tokenId].boundWallet;
    }

    function getTokenByWallet(address wallet) external view returns (uint256) {
        return walletToToken[wallet];
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
        require(_feeBps <= 2000, "Helios: max 20%");
        protocolFeeBps = _feeBps;
    }

    function setProtocolTreasury(address _treasury) external onlyOwner {
        protocolTreasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Helios: withdraw failed");
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
