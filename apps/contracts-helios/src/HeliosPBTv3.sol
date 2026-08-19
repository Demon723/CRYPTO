// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HeliosChipRegistry.sol";
import "./HeliosRenderer.sol";
import "./HeliosCardRegistry.sol";
import "./HeliosTBAccount.sol";

/**
 * @title HeliosPBTv3
 * @notice The complete Helios Protocol:
 *         - Founder-gated lifecycle (v2)
 *         - Tap-to-bind wallet (v2)
 *         - NFT-as-key utility (v2)
 *         - PREMIUM ONLY: Amex-style card registration (v3)
 *         - PREMIUM ONLY: Hardware wallet via ERC-6551 TBA (v3)
 *         - PREMIUM ONLY: Tap-to-pay / tap-to-transact (v3)
 *
 *         PREMIUM TIERS: Only Genesis (0) and Supernova (4) get card + TBA.
 *         Standard tiers (Solar, Main Sequence, Red Giant) are collectibles only.
 *
 *         THE "AMERICAN EXPRESS" MODEL:
 *         - Each premium coin has a unique card number (H-XXXX-XXXX-XXXX-X)
 *         - Each premium coin has a registered cardholder (KYC-verified)
 *         - Each premium coin has a Token Bound Account (smart contract wallet)
 *         - User taps coin → chip signs → TBA executes transaction
 *         - The physical coin IS the hardware wallet
 */
contract HeliosPBTv3 is ERC721, Ownable, Pausable, ReentrancyGuard {

    HeliosChipRegistry public immutable chipRegistry;
    HeliosCardRegistry public immutable cardRegistry;

    // ============================================================
    // ENUMS & STRUCTS
    // ============================================================

    enum TokenStatus { INACTIVE, ACTIVE, FROZEN, DEACTIVATED }

    struct TokenState {
        uint256 tapCount;
        uint256 lastTapTime;
        uint8 tier;
        bool minted;
        TokenStatus status;
        address boundWallet;
        uint256 boundAt;
        address payable tba;       // ERC-6551 Token Bound Account (premium only)
        bool isPremium;           // True if tier is Genesis (0) or Supernova (4)
    }

    // ============================================================
    // STATE
    // ============================================================

    mapping(uint256 => TokenState) public state;
    mapping(uint256 => bool) public usedNonces;
    mapping(address => bool) public isFounder;
    mapping(address => uint256) public walletToToken;

    uint256 public mintPrice;
    uint256 public maxSupply;
    uint256 public totalMinted;

    address public protocolTreasury;
    uint256 public protocolFeeBps;

    string public collectionName;
    string public collectionSymbol;

    // TBA factory
    address public tbaImplementation;
    mapping(uint256 => address payable) public tokenToTBA;

    // Premium gating
    uint256 public constant PREMIUM_TIER_GENESIS = 0;
    uint256 public constant PREMIUM_TIER_SUPERNOVA = 4;

    // ============================================================
    // EVENTS
    // ============================================================

    event Tapped(uint256 indexed tokenId, uint256 tapCount, uint256 timestamp);
    event TransferredWithProof(uint256 indexed tokenId, address indexed from, address indexed to, uint256 nonce);
    event Minted(uint256 indexed tokenId, bytes32 indexed chipPublicKey, address indexed to, uint8 tier, bool isPremium);

    event Activated(uint256 indexed tokenId, address indexed founder);
    event Frozen(uint256 indexed tokenId, address indexed founder, string reason);
    event Deactivated(uint256 indexed tokenId, address indexed founder, string reason);

    event WalletBound(uint256 indexed tokenId, address indexed wallet, uint256 timestamp);
    event WalletRebound(uint256 indexed tokenId, address indexed oldWallet, address indexed newWallet, uint256 timestamp);

    event KeyUsed(uint256 indexed tokenId, address indexed wallet, bytes32 indexed actionHash);
    event FounderUpdated(address indexed account, bool status);

    // v3 Events
    event TBACreated(uint256 indexed tokenId, address indexed tba);
    event CardholderRegistered(uint256 indexed tokenId, string cardNumber, bytes32 nameHash);
    event TapToPay(uint256 indexed tokenId, address indexed tba, address indexed to, uint256 value, bytes32 txHash);
    event PremiumDeposit(uint256 indexed tokenId, address indexed sender, uint256 amount);

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

    modifier onlyPremium(uint256 tokenId) {
        require(state[tokenId].isPremium, "Helios: premium only");
        _;
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(
        string memory name_,
        string memory symbol_,
        address _chipRegistry,
        address _cardRegistry,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address _protocolTreasury,
        uint256 _protocolFeeBps
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        chipRegistry = HeliosChipRegistry(_chipRegistry);
        cardRegistry = HeliosCardRegistry(_cardRegistry);
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        protocolTreasury = _protocolTreasury;
        protocolFeeBps = _protocolFeeBps;
        collectionName = name_;
        collectionSymbol = symbol_;

        isFounder[msg.sender] = true;
        emit FounderUpdated(msg.sender, true);
    }

    function setTBAImplementation(address _impl) external onlyOwner {
        tbaImplementation = _impl;
    }

    // ============================================================
    // FOUNDER MANAGEMENT
    // ============================================================

    function setFounder(address account, bool status) external onlyOwner {
        isFounder[account] = status;
        emit FounderUpdated(account, status);
    }

    // ============================================================
    // MINTING
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

        bool premium = (tier == PREMIUM_TIER_GENESIS || tier == PREMIUM_TIER_SUPERNOVA);

        chipRegistry.registerChip(chipPublicKey, tokenId);

        state[tokenId] = TokenState({
            tapCount: 0,
            lastTapTime: block.timestamp,
            tier: tier,
            minted: true,
            status: TokenStatus.INACTIVE,
            boundWallet: address(0),
            boundAt: 0,
            tba: payable(address(0)),
            isPremium: premium
        });

        totalMinted++;
        _safeMint(to, tokenId);

        if (protocolFeeBps > 0 && protocolTreasury != address(0)) {
            uint256 fee = (msg.value * protocolFeeBps) / 10000;
            (bool success, ) = protocolTreasury.call{value: fee}("");
            require(success, "Helios: fee transfer failed");
        }

        emit Minted(tokenId, chipPublicKey, to, tier, premium);
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
            bool premium = (tiers[i] == PREMIUM_TIER_GENESIS || tiers[i] == PREMIUM_TIER_SUPERNOVA);
            chipRegistry.registerChip(chipPublicKeys[i], tokenIds[i]);
            state[tokenIds[i]] = TokenState({
                tapCount: 0,
                lastTapTime: block.timestamp,
                tier: tiers[i],
                minted: true,
                status: TokenStatus.INACTIVE,
                boundWallet: address(0),
                boundAt: 0,
                tba: payable(address(0)),
                isPremium: premium
            });
            totalMinted++;
            _safeMint(recipients[i], tokenIds[i]);
            emit Minted(tokenIds[i], chipPublicKeys[i], recipients[i], tiers[i], premium);
        }
    }

    // ============================================================
    // FOUNDER-GATED LIFECYCLE
    // ============================================================

    function activate(uint256 tokenId) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.INACTIVE, "Helios: not inactive");
        state[tokenId].status = TokenStatus.ACTIVE;

        // PREMIUM ONLY: Create TBA on activation
        if (state[tokenId].isPremium && tbaImplementation != address(0)) {
            _createTBA(tokenId);
        }

        emit Activated(tokenId, msg.sender);
    }

    function batchActivate(uint256[] calldata tokenIds) external onlyFounder {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (state[tokenId].minted && state[tokenId].status == TokenStatus.INACTIVE) {
                state[tokenId].status = TokenStatus.ACTIVE;
                if (state[tokenId].isPremium && tbaImplementation != address(0)) {
                    _createTBA(tokenId);
                }
                emit Activated(tokenId, msg.sender);
            }
        }
    }

    function freeze(uint256 tokenId, string calldata reason) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.ACTIVE, "Helios: not active");
        state[tokenId].status = TokenStatus.FROZEN;
        emit Frozen(tokenId, msg.sender, reason);
    }

    function unfreeze(uint256 tokenId) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status == TokenStatus.FROZEN, "Helios: not frozen");
        state[tokenId].status = TokenStatus.ACTIVE;
        emit Activated(tokenId, msg.sender);
    }

    function deactivate(uint256 tokenId, string calldata reason) external onlyFounder validToken(tokenId) {
        require(state[tokenId].status != TokenStatus.DEACTIVATED, "Helios: already deactivated");

        address oldWallet = state[tokenId].boundWallet;
        if (oldWallet != address(0)) {
            walletToToken[oldWallet] = 0;
        }
        state[tokenId].boundWallet = address(0);
        state[tokenId].status = TokenStatus.DEACTIVATED;

        // PREMIUM ONLY: TBA remains but is locked (executions blocked by TBA's own logic)
        // The TBA itself can check token status if needed

        emit Deactivated(tokenId, msg.sender, reason);
    }

    // ============================================================
    // PREMIUM ONLY: CARD REGISTRATION
    // ============================================================

    /**
     * @notice Register a cardholder for a premium token.
     *         Only founders. Links a real identity to the coin.
     *         The card number is laser-engraved on the physical coin.
     */
    function registerCardholder(
        uint256 tokenId,
        bytes32 nameHash,
        bytes32 kycHash
    ) external onlyFounder validToken(tokenId) onlyPremium(tokenId) {
        string memory cardNumber = cardRegistry.registerCardholder(
            tokenId, state[tokenId].tier, nameHash, kycHash
        );
        emit CardholderRegistered(tokenId, cardNumber, nameHash);
    }

    /**
     * @notice Get cardholder info for a premium token.
     */
    function getCardholder(uint256 tokenId)
        external view validToken(tokenId) onlyPremium(tokenId)
        returns (HeliosCardRegistry.Cardholder memory) {
        return cardRegistry.getCardholder(tokenId);
    }

    // ============================================================
    // PREMIUM ONLY: TBA (TOKEN BOUND ACCOUNT)
    // ============================================================

    function _createTBA(uint256 tokenId) internal {
        require(tbaImplementation != address(0), "Helios: no TBA impl");
        require(state[tokenId].tba == address(0), "Helios: TBA exists");

        // Deploy minimal proxy clone
        address tba = _clone(tbaImplementation);
        HeliosTBAccount(payable(tba)).initialize(address(this), tokenId, address(this));

        state[tokenId].tba = payable(tba);
        tokenToTBA[tokenId] = payable(tba);

        emit TBACreated(tokenId, tba);
    }

    function getTBA(uint256 tokenId) external view validToken(tokenId) returns (address) {
        return state[tokenId].tba;
    }

    /**
     * @notice Deposit ETH into a premium token's TBA.
     *         Anyone can fund a premium coin's wallet.
     */
    function depositToTBA(uint256 tokenId) external payable validToken(tokenId) onlyPremium(tokenId) {
        require(state[tokenId].tba != address(0), "Helios: no TBA");
        (bool success, ) = state[tokenId].tba.call{value: msg.value}("");
        require(success, "Helios: deposit failed");
        emit PremiumDeposit(tokenId, msg.sender, msg.value);
    }

    // ============================================================
    // PREMIUM ONLY: TAP TO PAY / TAP TO TRANSACT
    // ============================================================

    /**
     * @notice Execute a transaction from the token's TBA using chip signature.
     *         This is the "tap to pay" feature.
     *
     *         The user taps their physical coin. The chip signs:
     *         keccak256("PAY" || tokenId || to || value || keccak256(data) || nonce || chainId)
     *
     *         The contract verifies the chip signature, then calls TBA.execute().
     *
     *         Requirements:
     *         - Token must be premium (Genesis or Supernova)
     *         - Token must be ACTIVE
     *         - Wallet must be bound to this token
     *         - Chip signature must be valid
     *         - TBA must have sufficient balance
     */
    function tapToPay(
        uint256 tokenId,
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) onlyActive(tokenId) onlyPremium(tokenId) nonReentrant {
        require(state[tokenId].boundWallet == msg.sender, "Helios: not bound wallet");
        require(state[tokenId].tba != address(0), "Helios: no TBA");
        require(!usedNonces[nonce], "Helios: nonce used");
        require(to != address(0), "Helios: invalid target");

        // Verify chip signature
        bytes32 dataHash = keccak256(data);
        bytes32 hash = keccak256(abi.encodePacked(
            "PAY",
            tokenId,
            to,
            value,
            dataHash,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;

        // Execute from TBA
        bytes memory result = HeliosTBAccount(payable(state[tokenId].tba)).execute(to, value, data);

        emit TapToPay(tokenId, state[tokenId].tba, to, value, keccak256(abi.encodePacked(result)));
    }

    /**
     * @notice Batch tap-to-pay. Execute multiple transactions with one chip signature.
     *         The chip signs the hash of all operations.
     */
    function tapToPayBatch(
        uint256 tokenId,
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas,
        uint256 nonce,
        bytes memory chipSignature
    ) external validToken(tokenId) onlyActive(tokenId) onlyPremium(tokenId) nonReentrant {
        require(state[tokenId].boundWallet == msg.sender, "Helios: not bound wallet");
        require(state[tokenId].tba != address(0), "Helios: no TBA");
        require(!usedNonces[nonce], "Helios: nonce used");
        require(
            targets.length == values.length && values.length == datas.length,
            "Helios: array mismatch"
        );

        // Build combined hash
        bytes32[] memory dataHashes = new bytes32[](datas.length);
        for (uint256 i = 0; i < datas.length; i++) {
            dataHashes[i] = keccak256(datas[i]);
        }
        bytes32 combinedHash = keccak256(abi.encodePacked(
            targets, values, dataHashes
        ));

        bytes32 hash = keccak256(abi.encodePacked(
            "PAY_BATCH",
            tokenId,
            combinedHash,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        require(
            chipRegistry.verifyChipSignature(tokenId, ethHash, chipSignature),
            "Helios: invalid chip signature"
        );

        usedNonces[nonce] = true;

        HeliosTBAccount(payable(state[tokenId].tba)).executeBatch(targets, values, datas);
    }

    // ============================================================
    // WALLET BINDING (v2)
    // ============================================================

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
    // TAP MECHANICS
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
    // PHYSICAL-BOUND TRANSFERS
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
    // NFT-AS-KEY
    // ============================================================

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

    function useKey(bytes32 actionHash) external returns (bool) {
        (bool valid, uint256 tokenId) = this.isKeyValid(msg.sender);
        require(valid, "Helios: invalid key");
        emit KeyUsed(tokenId, msg.sender, actionHash);
        return true;
    }

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

    function getTokenState(uint256 tokenId) external view validToken(tokenId) returns (TokenState memory) {
        return state[tokenId];
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

    function isPremium(uint256 tokenId) external view validToken(tokenId) returns (bool) {
        return state[tokenId].isPremium;
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

    /**
     * @notice Minimal proxy clone (EIP-1167)
     */
    function _clone(address implementation) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "Helios: clone failed");
    }

    receive() external payable {}
}
