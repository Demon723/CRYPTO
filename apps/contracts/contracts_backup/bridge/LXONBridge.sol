// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LXONBridge is ReentrancyGuard, Ownable {
    struct BridgeTransfer {
        bytes32 transferId;
        address fromChain;
        address toChain;
        address token;
        uint256 amount;
        address sender;
        address recipient;
        uint256 timestamp;
        TransferStatus status;
        bytes32 sourceTxHash;
        bytes32 destinationTxHash;
    }

    enum TransferStatus { Pending, Locked, Minted, Completed, Failed }

    event TokensLocked(
        bytes32 indexed transferId,
        address indexed token,
        uint256 amount,
        address indexed sender,
        uint256 timestamp
    );

    event TokensMinted(
        bytes32 indexed transferId,
        address indexed token,
        uint256 amount,
        address indexed recipient,
        uint256 timestamp
    );

    event TokensBurned(
        bytes32 indexed transferId,
        address indexed token,
        uint256 amount,
        address indexed sender,
        uint256 timestamp
    );

    event TransferCompleted(
        bytes32 indexed transferId,
        bytes32 indexed destinationTxHash,
        uint256 timestamp
    );

    event TransferFailed(
        bytes32 indexed transferId,
        string reason,
        uint256 timestamp
    );

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ChainRegistered(uint256 indexed chainId, address indexed bridgeContract);
    event EmergencyPauseActivated(uint256 timestamp);
    event EmergencyPauseDeactivated(uint256 timestamp);

    mapping(bytes32 => BridgeTransfer) public transfers;
    mapping(address => bool) public validators;
    mapping(uint256 => address) public chainBridgeContracts;
    
    uint256 public minConfirmations;
    uint256 public transferFeePercentage;
    uint256 public maxTransferAmount;
    bool public paused;
    uint256 public totalTransferred;

    modifier onlyValidator() {
        require(validators[msg.sender], "Not authorized validator");
        _;
    }

    modifier nonReentrant() {
        require(!paused, "Bridge is paused");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function initialize(
        uint256 _minConfirmations,
        uint256 _feePercentage,
        uint256 _maxAmount
    ) external onlyOwner {
        require(_minConfirmations > 0, "Invalid confirmations");
        require(_feePercentage < 100, "Invalid fee");
        minConfirmations = _minConfirmations;
        transferFeePercentage = _feePercentage;
        maxTransferAmount = _maxAmount;
    }

    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external nonReentrant returns (bytes32) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxTransferAmount, "Exceeds max transfer amount");
        require(chainBridgeContracts[targetChainId] != address(0), "Chain not registered");

        bytes32 transferId = keccak256(
            abi.encodePacked(msg.sender, token, amount, targetChainId, block.timestamp)
        );

        require(transfers[transferId].transferId == bytes32(0), "Transfer already exists");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        transfers[transferId] = BridgeTransfer({
            transferId: transferId,
            fromChain: address(this),
            toChain: chainBridgeContracts[targetChainId],
            token: token,
            amount: amount,
            sender: msg.sender,
            recipient: recipient,
            timestamp: block.timestamp,
            status: TransferStatus.Locked,
            sourceTxHash: bytes32(0),
            destinationTxHash: bytes32(0)
        });

        emit TokensLocked(transferId, token, amount, msg.sender, block.timestamp);
        totalTransferred += amount;

        return transferId;
    }

    function mintTokens(
        bytes32 transferId,
        address token,
        uint256 amount,
        address recipient,
        bytes32 sourceTxHash
    ) external onlyValidator nonReentrant {
        BridgeTransfer storage transfer = transfers[transferId];
        require(transfer.transferId != bytes32(0), "Transfer not found");
        require(transfer.status == TransferStatus.Locked, "Transfer not locked");
        require(transfer.amount == amount, "Amount mismatch");

        transfer.status = TransferStatus.Minted;
        transfer.sourceTxHash = sourceTxHash;

        if (token == address(0)) {
            payable(recipient).transfer(amount);
        } else {
            ERC20(token).mint(recipient, amount);
        }

        emit TokensMinted(transferId, token, amount, recipient, block.timestamp);
    }

    function burnTokens(
        bytes32 transferId,
        address token,
        uint256 amount,
        bytes32 sourceTxHash
    ) external nonReentrant returns (bytes32) {
        require(transfers[transferId].transferId == bytes32(0), "Transfer exists");

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        bytes32 newTransferId = keccak256(
            abi.encodePacked(transferId, token, amount, msg.sender, block.timestamp)
        );

        transfers[newTransferId] = BridgeTransfer({
            transferId: newTransferId,
            fromChain: chainBridgeContracts[block.chainid],
            toChain: address(0),
            token: token,
            amount: amount,
            sender: msg.sender,
            recipient: msg.sender,
            timestamp: block.timestamp,
            status: TransferStatus.Completed,
            sourceTxHash: sourceTxHash,
            destinationTxHash: bytes32(0)
        });

        if (token != address(0)) {
            ERC20(token).burn(amount);
        }

        emit TokensBurned(newTransferId, token, amount, msg.sender, block.timestamp);
        emit TransferCompleted(newTransferId, bytes32(0), block.timestamp);
        totalTransferred += amount;

        return newTransferId;
    }

    function completeTransfer(bytes32 transferId, bytes32 destinationTxHash) external onlyValidator {
        BridgeTransfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Minted, "Not minted");
        
        transfer.status = TransferStatus.Completed;
        transfer.destinationTxHash = destinationTxHash;

        emit TransferCompleted(transferId, destinationTxHash, block.timestamp);
    }

    function failTransfer(bytes32 transferId, string calldata reason) external onlyValidator {
        BridgeTransfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Locked || transfer.status == TransferStatus.Minted, "Invalid status");
        
        transfer.status = TransferStatus.Failed;

        if (transfer.token != address(0)) {
            ERC20(transfer.token).transfer(transfer.sender, transfer.amount);
        } else {
            payable(transfer.sender).transfer(transfer.amount);
        }

        emit TransferFailed(transferId, reason, block.timestamp);
    }

    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "Already validator");
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not validator");
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }

    function registerChain(uint256 chainId, address bridgeContract) external onlyOwner {
        require(bridgeContract != address(0), "Invalid address");
        chainBridgeContracts[chainId] = bridgeContract;
        emit ChainRegistered(chainId, bridgeContract);
    }

    function setMinConfirmations(uint256 _confirmations) external onlyOwner {
        minConfirmations = _confirmations;
    }

    function setMaxTransferAmount(uint256 _amount) external onlyOwner {
        maxTransferAmount = _amount;
    }

    function emergencyPause() external onlyOwner {
        paused = true;
        emit EmergencyPauseActivated(block.timestamp);
    }

    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit EmergencyPauseDeactivated(block.timestamp);
    }

    function getTransfer(bytes32 transferId) external view returns (BridgeTransfer memory) {
        return transfers[transferId];
    }

    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * transferFeePercentage) / 100;
    }

    receive() external payable {}
}
