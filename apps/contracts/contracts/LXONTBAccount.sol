// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Token Bound Account (Standalone Blockchain)
 * @dev Smart contract wallet owned by an NFT - standalone version of ERC-6551
 * Adapted for LXON standalone blockchain with native XON token
 */
contract LXONTBAccount {
    // Owner NFT contract
    address public immutable nftContract;
    uint256 public immutable tokenId;
    
    // Owner of this TBA
    address public owner;
    
    // Token interface (optional)
    address public nativeToken;
    
    // Events
    event Executed(address indexed target, uint256 value, bytes data);
    event Received(address indexed sender, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _nftContract, uint256 _tokenId, address _nativeToken) {
        nftContract = _nftContract;
        tokenId = _tokenId;
        nativeToken = _nativeToken; // Can be address(0) if no native token needed
        owner = msg.sender; // Initially set to deployer, will be set to actual owner
    }

    /**
     * @notice Execute a transaction from this account
     * @param target The target address
     * @param value The amount of native token to send
     * @param data The call data
     * @return success True if transaction succeeded
     * @return returnData The return data from the call
     */
    function execute(address target, uint256 value, bytes memory data) external onlyOwner returns (bool success, bytes memory returnData) {
        // Transfer native tokens if value > 0 and nativeToken is set
        if (value > 0 && nativeToken != address(0)) {
            (bool transferSuccess, ) = nativeToken.call(abi.encodeWithSignature("transfer(address,uint256)", target, value));
            require(transferSuccess, "Transfer failed");
        }
        
        // Execute the call
        (success, returnData) = target.call(data);
        require(success, "Execution failed");
        
        emit Executed(target, value, data);
    }

    /**
     * @notice Execute multiple transactions in batch
     * @param targets Array of target addresses
     * @param values Array of values to send
     * @param calldatas Array of call data
     * @return successes Array of success booleans
     * @return returnDatas Array of return data
     */
    function executeBatch(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas
    ) external onlyOwner returns (bool[] memory successes, bytes[] memory returnDatas) {
        require(targets.length == values.length && targets.length == calldatas.length, "Length mismatch");
        
        successes = new bool[](targets.length);
        returnDatas = new bytes[](targets.length);
        
        for (uint256 i = 0; i < targets.length; i++) {
            if (values[i] > 0 && nativeToken != address(0)) {
                (bool transferSuccess, ) = nativeToken.call(abi.encodeWithSignature("transfer(address,uint256)", targets[i], values[i]));
                require(transferSuccess, "Transfer failed");
            }
            
            (successes[i], returnDatas[i]) = targets[i].call(calldatas[i]);
        }
    }

    /**
     * @notice Receive native tokens
     */
    function receiveTokens(uint256 amount) external {
        if (nativeToken != address(0)) {
            (bool success, ) = nativeToken.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount));
            require(success, "Transfer failed");
        }
        emit Received(msg.sender, amount);
    }

    /**
     * @notice Get balance of native tokens
     * @return balance The balance
     */
    function getBalance() external view returns (uint256) {
        if (nativeToken == address(0)) {
            return 0;
        }
        (bool success, bytes memory data) = nativeToken.staticcall(abi.encodeWithSignature("balanceOf(address)", address(this)));
        require(success, "Balance check failed");
        return abi.decode(data, (uint256));
    }

    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    /**
     * @notice Get NFT ownership info
     * @return nftContract The NFT contract address
     * @return tokenId The NFT token ID
     */
    function getNFTInfo() external view returns (address, uint256) {
        return (nftContract, tokenId);
    }
}