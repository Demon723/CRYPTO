// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./HeliosPBT.sol";
import "./HeliosChipRegistry.sol";

/**
 * @title HeliosFactory
 * @notice The protocol layer. Brands can launch their own PBT collections
 *         through this factory. Helios takes a 15% protocol fee on mints
 *         and a setup fee in ETH.
 *         
 *         This is Track 2: The Protocol. Every brand-deployed collection
 *         validates the Helios chip registry and pays into the treasury.
 */
contract HeliosFactory is Ownable, Pausable {

    HeliosChipRegistry public immutable chipRegistry;

    // Protocol fee config
    uint256 public protocolFeeBps = 1500; // 15% default
    uint256 public setupFee = 0.5 ether;   // Setup fee for new collections
    address public treasury;

    // Deployed collections
    struct Collection {
        address contractAddress;
        address brandOwner;
        string name;
        string symbol;
        uint256 deployedAt;
        bool active;
    }
    Collection[] public collections;
    mapping(address => uint256) public collectionIndex;
    mapping(address => bool) public isHeliosCollection;

    // Brand => their collections
    mapping(address => address[]) public brandCollections;

    // Events
    event CollectionDeployed(
        address indexed collection,
        address indexed brandOwner,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 mintPrice
    );
    event SetupFeeUpdated(uint256 newFee);
    event ProtocolFeeUpdated(uint256 newFeeBps);
    event TreasuryUpdated(address newTreasury);

    modifier onlyTreasury() {
        require(msg.sender == treasury || msg.sender == owner(), "HeliosFactory: not treasury");
        _;
    }

    constructor(address _chipRegistry, address _treasury) Ownable(msg.sender) {
        chipRegistry = HeliosChipRegistry(_chipRegistry);
        treasury = _treasury;
    }

    /**
     * @notice Deploy a new branded PBT collection.
     *         Brand pays setupFee in ETH.
     * @param name Collection name
     * @param symbol Collection symbol
     * @param maxSupply Max tokens in this collection
     * @param mintPrice Price per mint (wei)
     * @return collection Address of the new HeliosPBT contract
     */
    function deployCollection(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 mintPrice
    ) external payable whenNotPaused returns (address collection) {
        require(msg.value >= setupFee, "HeliosFactory: insufficient setup fee");
        require(bytes(name).length > 0, "HeliosFactory: empty name");

        // Deploy new PBT contract
        HeliosPBT newCollection = new HeliosPBT(
            name,
            symbol,
            address(chipRegistry),
            maxSupply,
            mintPrice,
            treasury,
            protocolFeeBps
        );

        collection = address(newCollection);

        // Transfer ownership to brand
        newCollection.transferOwnership(msg.sender);

        // Register collection
        collections.push(Collection({
            contractAddress: collection,
            brandOwner: msg.sender,
            name: name,
            symbol: symbol,
            deployedAt: block.timestamp,
            active: true
        }));

        uint256 idx = collections.length - 1;
        collectionIndex[collection] = idx;
        isHeliosCollection[collection] = true;
        brandCollections[msg.sender].push(collection);

        // Forward setup fee to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "HeliosFactory: fee transfer failed");

        emit CollectionDeployed(collection, msg.sender, name, symbol, maxSupply, mintPrice);

        return collection;
    }

    /**
     * @notice Get all collections deployed by a brand.
     */
    function getBrandCollections(address brand) external view returns (address[] memory) {
        return brandCollections[brand];
    }

    /**
     * @notice Get total number of deployed collections.
     */
    function getCollectionCount() external view returns (uint256) {
        return collections.length;
    }

    /**
     * @notice Batch get collection info.
     */
    function getCollections(uint256 offset, uint256 limit) 
        external view returns (Collection[] memory) {
        uint256 end = offset + limit;
        if (end > collections.length) end = collections.length;
        require(offset < collections.length, "HeliosFactory: out of bounds");

        Collection[] memory result = new Collection[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = collections[i];
        }
        return result;
    }

    // ============================================================
    // ADMIN
    // ============================================================

    function setSetupFee(uint256 _fee) external onlyOwner {
        setupFee = _fee;
        emit SetupFeeUpdated(_fee);
    }

    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 3000, "HeliosFactory: max 30%");
        protocolFeeBps = _feeBps;
        emit ProtocolFeeUpdated(_feeBps);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "HeliosFactory: zero address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
