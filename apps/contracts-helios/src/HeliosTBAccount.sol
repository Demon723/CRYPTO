// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HeliosTBAccount
 * @notice ERC-6551 Token Bound Account for premium Helios coins.
 *         This is a smart contract wallet owned by the NFT.
 *         It can hold ETH, ERC-20s, and NFTs.
 *         Transactions are executed via the HeliosPBTv3 contract
 *         after chip signature verification.
 *
 *         The TBA is created when a premium token is activated by founders.
 *         It is destroyed (or locked) when the token is deactivated.
 */
contract HeliosTBAccount is ERC721Holder, ERC1155Holder, ReentrancyGuard {

    address public tokenContract;
    uint256 public tokenId;
    bool public initialized;

    // Authorized executors (the HeliosPBTv3 contract)
    mapping(address => bool) public isExecutor;

    event Executed(address indexed to, uint256 value, bytes data, bytes32 txHash);
    event Received(address indexed sender, uint256 value);

    modifier onlyExecutor() {
        require(isExecutor[msg.sender], "HeliosTBA: not executor");
        _;
    }

    /**
     * @notice Initialize the TBA. Called once by the registry/factory.
     */
    function initialize(address _tokenContract, uint256 _tokenId, address _executor)
        external {
        require(!initialized, "HeliosTBA: already initialized");
        tokenContract = _tokenContract;
        tokenId = _tokenId;
        isExecutor[_executor] = true;
        initialized = true;
    }

    /**
     * @notice Execute a transaction from this TBA.
     *         Only callable by authorized executors (HeliosPBTv3).
     *         This is the "tap to pay" mechanism — the user taps their
     *         physical coin, the chip signs, and the executor calls this.
     *
     * @param to Destination address
     * @param value ETH amount
     * @param data Call data
     * @return result The return data from the call
     */
    function execute(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyExecutor nonReentrant returns (bytes memory result) {
        require(to != address(0), "HeliosTBA: invalid target");

        bool success;
        (success, result) = to.call{value: value}(data);
        require(success, "HeliosTBA: execution failed");

        emit Executed(to, value, data, keccak256(abi.encodePacked(to, value, data, block.timestamp)));
        return result;
    }

    /**
     * @notice Batch execute multiple transactions.
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyExecutor nonReentrant {
        require(
            targets.length == values.length && values.length == datas.length,
            "HeliosTBA: array mismatch"
        );
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call{value: values[i]}(datas[i]);
            require(success, "HeliosTBA: batch execution failed");
            emit Executed(targets[i], values[i], datas[i], keccak256(abi.encodePacked(
                targets[i], values[i], datas[i], block.timestamp, i
            )));
        }
    }

    /**
     * @notice Add/remove executor. Only the token owner can do this
     *         via the HeliosPBTv3 contract.
     */
    function setExecutor(address executor, bool status) external onlyExecutor {
        isExecutor[executor] = status;
    }

    /**
     * @notice Get the owner of this TBA (the NFT owner).
     */
    function owner() external view returns (address) {
        return IERC721(tokenContract).ownerOf(tokenId);
    }

    // Note: supportsInterface is inherited from ERC721Holder/ERC1155Holder via ERC165

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
