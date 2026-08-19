// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Multi-Signature Wallet
 * @dev Multi-sig governance wallet for LXON blockchain critical operations
 * Reduces centralization risk by requiring multiple signatures for critical actions
 * 
 * Not Bridged, Not Wrapped. Build On LXON.
 */
contract LXONMultiSig {
    // State variables
    mapping(address => bool) public isOwner;
    address[] public owners;
    uint256 public requiredSignatures;
    uint256 public transactionCount;
    
    // Transaction structure
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    // Mapping for transaction confirmations
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    // Time lock for critical operations
    uint256 public timeLock;
    mapping(uint256 => uint256) public submissionTime;
    
    // Events
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 requiredSignatures);
    event Submission(uint256 indexed transactionId);
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event ExecutionFailure(uint256 indexed transactionId);
    event TimeLockChanged(uint256 newTimeLock);
    
    // Modifiers
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].destination != address(0), "Transaction does not exist");
        _;
    }
    
    modifier confirmed(uint256 transactionId) {
        require(confirmations[transactionId][msg.sender], "Transaction not confirmed");
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "Transaction already executed");
        _;
    }
    
    modifier timeLockPassed(uint256 transactionId) {
        require(block.timestamp >= submissionTime[transactionId] + timeLock, "Time lock not passed");
        _;
    }
    
    /**
     * @dev Constructor to initialize the multi-sig wallet
     * @param _owners List of initial owner addresses
     * @param _requiredSignatures Number of signatures required
     * @param _timeLock Time lock in seconds for critical operations
     */
    constructor(address[] memory _owners, uint256 _requiredSignatures, uint256 _timeLock) {
        require(_owners.length >= _requiredSignatures, "Invalid signature requirement");
        require(_requiredSignatures >= 1, "At least one signature required");
        require(_timeLock >= 0, "Invalid time lock");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Invalid owner address");
            require(!isOwner[_owners[i]], "Duplicate owner");
            
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
            emit OwnerAdded(_owners[i]);
        }
        
        requiredSignatures = _requiredSignatures;
        timeLock = _timeLock;
    }
    
    /**
     * @dev Submit a new transaction for multi-sig approval
     * @param destination Target address
     * @param value ETH value to send
     * @param data Encoded function call data
     * @return transactionId ID of the submitted transaction
     */
    function submitTransaction(address destination, uint256 value, bytes memory data) 
        public 
        onlyOwner 
        returns (uint256 transactionId) 
    {
        require(destination != address(0), "Invalid destination");
        
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            numConfirmations: 0
        });
        
        submissionTime[transactionId] = block.timestamp;
        transactionCount++;
        
        emit Submission(transactionId);
    }
    
    /**
     * @dev Confirm a transaction
     * @param transactionId ID of the transaction to confirm
     */
    function confirmTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
    {
        require(!confirmations[transactionId][msg.sender], "Already confirmed");
        
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].numConfirmations++;
        
        emit Confirmation(msg.sender, transactionId);
    }
    
    /**
     * @dev Execute a confirmed transaction
     * @param transactionId ID of the transaction to execute
     */
    function executeTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
        timeLockPassed(transactionId)
    {
        require(transactions[transactionId].numConfirmations >= requiredSignatures, "Not enough confirmations");
        
        Transaction storage txn = transactions[transactionId];
        txn.executed = true;
        
        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        
        if (success) {
            emit Execution(transactionId);
        } else {
            txn.executed = false; // Revert execution status
            emit ExecutionFailure(transactionId);
            revert("Transaction execution failed");
        }
    }
    
    /**
     * @dev Revoke a confirmation
     * @param transactionId ID of the transaction
     */
    function revokeConfirmation(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        confirmed(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        transactions[transactionId].numConfirmations--;
        
        emit Confirmation(msg.sender, transactionId); // Reuse event for revocation
    }
    
    /**
     * @dev Add a new owner
     * @param owner Address of the new owner
     * @param transactionId ID of the transaction adding the owner
     */
    function addOwner(address owner, uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(!isOwner[owner], "Already owner");
        require(owner != address(0), "Invalid owner address");
        
        executeTransaction(transactionId);
        
        isOwner[owner] = true;
        owners.push(owner);
        
        emit OwnerAdded(owner);
    }
    
    /**
     * @dev Remove an owner
     * @param owner Address of the owner to remove
     * @param transactionId ID of the transaction removing the owner
     */
    function removeOwner(address owner, uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(isOwner[owner], "Not owner");
        require(owners.length > requiredSignatures, "Cannot remove owner below requirement");
        
        executeTransaction(transactionId);
        
        isOwner[owner] = false;
        
        // Remove from owners array
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        
        emit OwnerRemoved(owner);
    }
    
    /**
     * @dev Replace an owner
     * @param oldOwner Address of the owner to replace
     * @param newOwner Address of the new owner
     * @param transactionId ID of the transaction replacing the owner
     */
    function replaceOwner(address oldOwner, address newOwner, uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(isOwner[oldOwner], "Old owner not found");
        require(!isOwner[newOwner], "New owner already exists");
        require(newOwner != address(0), "Invalid new owner address");
        
        executeTransaction(transactionId);
        
        isOwner[oldOwner] = false;
        isOwner[newOwner] = true;
        
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == oldOwner) {
                owners[i] = newOwner;
                break;
            }
        }
        
        emit OwnerRemoved(oldOwner);
        emit OwnerAdded(newOwner);
    }
    
    /**
     * @dev Change the required number of signatures
     * @param _requiredSignatures New required signature count
     * @param transactionId ID of the transaction changing the requirement
     */
    function changeRequirement(uint256 _requiredSignatures, uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(_requiredSignatures >= 1, "At least one signature required");
        require(_requiredSignatures <= owners.length, "Cannot exceed owner count");
        
        executeTransaction(transactionId);
        
        requiredSignatures = _requiredSignatures;
        
        emit RequirementChanged(_requiredSignatures);
    }
    
    /**
     * @dev Change the time lock period
     * @param _timeLock New time lock in seconds
     * @param transactionId ID of the transaction changing the time lock
     */
    function changeTimeLock(uint256 _timeLock, uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        require(_timeLock >= 0, "Invalid time lock");
        
        executeTransaction(transactionId);
        
        timeLock = _timeLock;
        
        emit TimeLockChanged(_timeLock);
    }
    
    /**
     * @dev Get the list of owners
     * @return Array of owner addresses
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    /**
     * @dev Get transaction details
     * @param transactionId ID of the transaction
     * @return destination Target address
     * @return value ETH value
     * @return data Function call data
     * @return executed Execution status
     * @return numConfirmations Number of confirmations
     */
    function getTransaction(uint256 transactionId) 
        public 
        view 
        returns (
            address destination,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        ) 
    {
        Transaction storage txn = transactions[transactionId];
        return (
            txn.destination,
            txn.value,
            txn.data,
            txn.executed,
            txn.numConfirmations
        );
    }
    
    /**
     * @dev Check if an address is an owner
     * @param addressToCheck Address to check
     * @return bool True if address is an owner
     */
    function isOwnerAddress(address addressToCheck) public view returns (bool) {
        return isOwner[addressToCheck];
    }
    
    /**
     * @dev Get the number of owners
     * @return uint256 Number of owners
     */
    function getOwnerCount() public view returns (uint256) {
        return owners.length;
    }
    
    /**
     * @dev Get confirmation count for a transaction
     * @param transactionId ID of the transaction
     * @return uint256 Number of confirmations
     */
    function getConfirmationCount(uint256 transactionId) public view returns (uint256) {
        return transactions[transactionId].numConfirmations;
    }
    
    /**
     * @dev Get remaining time until time lock expires
     * @param transactionId ID of the transaction
     * @return uint256 Remaining seconds (0 if expired)
     */
    function getTimeLockRemaining(uint256 transactionId) public view returns (uint256) {
        uint256 lockEnd = submissionTime[transactionId] + timeLock;
        if (block.timestamp >= lockEnd) {
            return 0;
        }
        return lockEnd - block.timestamp;
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}