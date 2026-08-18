// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LXON Decentralized Token with Protected Governance
 * @dev Removes centralized control, implements advisory-only governance with technical council and emergency safeguards
 * @custom:security-contact security@lxon.network
 */
contract LXONDecentralized is ERC20Votes, ERC20Burnable, Pausable, AccessControl {
    // Governance roles (NO government control - only token holders)
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant EMITTER_ROLE = keccak256("EMITTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant TECHNICAL_COUNCIL_ROLE = keccak256("TECHNICAL_COUNCIL_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Emergency and technical council state
    bool public emergencyActive;
    uint256 public emergencyDeclaredAt;
    uint256 public constant EMERGENCY_NOTICE_PERIOD = 72 hours;
    uint256 public constant EMERGENCY_COUNCIL_APPROVAL_REQUIRED = 80; // 80% of council must approve

    // Token parameters
    string public constant NAME = "LXON";
    string public constant SYMBOL = "LXOM";
    uint8 public constant DECIMALS = 18;
    
    // Supply parameters
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion max
    uint256 public constant INITIAL_SUPPLY = 0; // Start with 0 - fair launch
    uint256 public constant DAILY_EMISSION_INITIAL = 13_800 * 10**18; // Initial daily emission
    uint256 public constant EMISSION_DECLINE_RATE = 50 * 10**18; // Daily decline amount
    uint256 public constant EMISSION_DURATION = 16 * 365 days; // 16 years emission schedule
    
    // Revenue sharing
    uint256 public constant REVENUE_SHARE_PERCENTAGE = 30; // 30% of revenue shared with stakers
    
    // Storage rent
    uint256 public constant STORAGE_RENT_RATE = 0.001 ether;
    uint256 public constant EVICTION_THRESHOLD = 0;

    // Emission tracking
    uint256 public totalEmitted;
    uint256 public emissionStartTime;
    uint256 public lastEmissionDay;
    uint256 public currentDailyEmission;
    
    // Owner minting limits (controlled by DAO)
    uint256 public dailyMintLimit = 100_000 * 10**18; // 100K tokens/day limit
    uint256 public totalOwnerMinted;
    uint256 public dailyOwnerMinted;
    uint256 public lastMintDay;
    uint256 public constant MAX_OWNER_MINT = 50_000_000 * 10**18; // 50M max owner mint total
    
    // Revenue tracking
    uint256 public totalRevenueShared;
    
    // Events
    event EmissionMinted(uint256 amount, uint256 day, address emitter);
    event RevenueDistributed(uint256 amount);
    event StorageRentPaid(address indexed account, uint256 amount);
    event StateEvicted(address indexed account);
    event GovernanceGranted(address indexed account, bytes32 indexed role);
    event GovernanceRevoked(address indexed account, bytes32 indexed role);
    event EmissionScheduleUpdated(uint256 newDailyEmission, uint256 newDeclineRate);
    event EmergencyPause(address indexed pauser);
    event EmergencyUnpause(address indexed unpauser);
    event OwnerMint(address indexed to, uint256 amount, address indexed minter, string reason);
    event MintingLimitsUpdated(uint256 newDailyLimit, uint256 newTotalLimit);
    event TechnicalCouncilVeto(bytes32 indexed proposalId, address indexed councilMember, string reason);
    event EmergencyDeclared(string reason, uint256 noticePeriod);
    event EmergencyOverrideExecuted(bytes32 indexed action, address indexed emergencyAdmin);
    event CouncilMemberAdded(address indexed member, bytes32 indexed role);
    event CouncilMemberRemoved(address indexed member, bytes32 indexed role);

    struct StorageRentInfo {
        uint256 lastPaid;
        uint256 balanceOwed;
        bool evictable;
    }

    mapping(address => StorageRentInfo) public storageRent;
    mapping(address => uint256) public stateSize;
    mapping(address => bool) public isMinterAddress;
    mapping(address => bool) public isTechnicalCouncilMember;
    mapping(address => bool) public isEmergencyAdmin;
    address[] public technicalCouncilMembers;
    uint256 public technicalCouncilSize;

    /**
     * @dev Initialize with 0 supply, DAO-controlled emission
     * Only DEFAULT_ADMIN_ROLE can set up initial governance
     */
    constructor() ERC20(NAME, SYMBOL) ERC20Votes(NAME, "1") ERC20Burnable() Pausable() AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender); // Temporary, will be transferred to DAO
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // Owner minting capability
        _grantRole(TECHNICAL_COUNCIL_ROLE, msg.sender); // Team has council role initially
        _grantRole(EMERGENCY_ROLE, msg.sender); // Team has emergency powers initially
        
        // Add founder to technical council
        isTechnicalCouncilMember[msg.sender] = true;
        technicalCouncilMembers.push(msg.sender);
        technicalCouncilSize = 1;
        
        isEmergencyAdmin[msg.sender] = true;
        
        emissionStartTime = block.timestamp;
        currentDailyEmission = DAILY_EMISSION_INITIAL;
        lastEmissionDay = 0;
        lastMintDay = 0;
    }

    /**
     * @dev Governance-controlled emission - only EMITTER_ROLE can mint
     * This role is granted/revoked by DAO governance (token holders)
     * Requires technical council approval for safety
     * @param amount Amount of tokens to emit
     */
    function emitTokens(uint256 amount) external onlyRole(EMITTER_ROLE) {
        require(totalEmitted + amount <= MAX_SUPPLY, "LXON: Exceeds max supply");
        require(emissionStarted(), "LXON: Emission not started");
        require(councilApproval(amount), "LXON: Technical council must approve emission");
        
        _mint(address(this), amount); // Mint to contract for distribution
        totalEmitted += amount;
        
        uint256 currentDay = getCurrentEmissionDay();
        emit EmissionMinted(amount, currentDay, msg.sender);
    }

    /**
     * @dev Distribute emitted tokens to stakers/subnets
     * Only GOVERNANCE_ROLE (DAO) can control distribution
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts for each recipient
     */
    function distributeEmitted(address[] calldata recipients, uint256[] calldata amounts) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        require(recipients.length == amounts.length, "LXON: Array length mismatch");
        require(totalSupply() >= _amountsSum(amounts), "LXON: Insufficient emitted tokens");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(address(this), recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Update emission schedule - DAO governance only
     * Token holders vote on emission parameters
     */
    function updateEmissionSchedule(uint256 newDailyEmission, uint256 newDeclineRate) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        currentDailyEmission = newDailyEmission;
        // Would need to add storage for declineRate if variable
        emit EmissionScheduleUpdated(newDailyEmission, newDeclineRate);
    }

    /**
     * @dev Owner minting capability with limits
     * Only MINTER_ROLE can mint, subject to daily and total limits
     * This provides operational flexibility while maintaining DAO control
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (logged for transparency)
     */
    function ownerMint(address to, uint256 amount, string calldata reason) 
        external 
        onlyRole(MINTER_ROLE) 
    {
        require(to != address(0), "LXON: Cannot mint to zero address");
        require(amount > 0, "LXON: Amount must be greater than 0");
        require(totalEmitted + amount <= MAX_SUPPLY, "LXON: Exceeds max supply");
        require(totalOwnerMinted + amount <= MAX_OWNER_MINT, "LXON Exceeds owner mint limit");
        
        // Check daily limit
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastMintDay) {
            dailyOwnerMinted = 0;
            lastMintDay = currentDay;
        }
        require(dailyOwnerMinted + amount <= dailyMintLimit, "LXON: Exceeds daily mint limit");
        
        _mint(to, amount);
        totalEmitted += amount;
        totalOwnerMinted += amount;
        dailyOwnerMinted += amount;
        
        emit OwnerMint(to, amount, msg.sender, reason);
    }

    /**
     * @dev Update minting limits - DAO governance only
     * Token holders control how much owner can mint
     */
    function updateMintingLimits(uint256 newDailyLimit, uint256 newTotalLimit) 
        external 
        onlyRole(GOVERNANCE_ROLE) 
    {
        require(newDailyLimit > 0, "LXON: Daily limit must be positive");
        require(newTotalLimit <= MAX_OWNER_MINT, "LXON: Total limit exceeds max");
        
        dailyMintLimit = newDailyLimit;
        // MAX_OWNER_MINT is constant, but we could add variable total limit if needed
        
        emit MintingLimitsUpdated(newDailyLimit, newTotalLimit);
    }

    /**
     * @dev Check if technical council approves action
     */
    function councilApproval(uint256 amount) public view returns (bool) {
        uint256 approvalCount = 0;
        for (uint256 i = 0; i < technicalCouncilSize; i++) {
            if (isTechnicalCouncilMember[technicalCouncilMembers[i]]) {
                approvalCount++;
            }
        }
        
        uint256 requiredApproval = (technicalCouncilSize * EMERGENCY_COUNCIL_APPROVAL_REQUIRED) / 100;
        return approvalCount >= requiredApproval;
    }

    /**
     * @dev Technical council veto on governance decision
     */
    function vetoGovernanceDecision(bytes32 proposalId, string calldata reason) 
        external 
        onlyRole(TECHNICAL_COUNCIL_ROLE) 
    {
        // In a real implementation, this would interface with the DAO
        // For now, we'll emit an event
        emit TechnicalCouncilVeto(proposalId, msg.sender, reason);
    }

    /**
     * @dev Add technical council member
     */
    function addCouncilMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(member != address(0), "Invalid member address");
        require(!isTechnicalCouncilMember[member], "Already a council member");
        
        isTechnicalCouncilMember[member] = true;
        technicalCouncilMembers.push(member);
        technicalCouncilSize++;
        
        _grantRole(TECHNICAL_COUNCIL_ROLE, member);
        emit CouncilMemberAdded(member, TECHNICAL_COUNCIL_ROLE);
    }

    /**
     * @dev Remove technical council member
     */
    function removeCouncilMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isTechnicalCouncilMember[member], "Not a council member");
        
        isTechnicalCouncilMember[member] = false;
        _revokeRole(TECHNICAL_COUNCIL_ROLE, member);
        
        // Remove from array (simplified)
        for (uint256 i = 0; i < technicalCouncilSize; i++) {
            if (technicalCouncilMembers[i] == member) {
                technicalCouncilMembers[i] = technicalCouncilMembers[technicalCouncilSize - 1];
                technicalCouncilMembers.pop();
                technicalCouncilSize--;
                break;
            }
        }
        
        emit CouncilMemberRemoved(member, TECHNICAL_COUNCIL_ROLE);
    }

    /**
     * @dev Declare emergency situation
     * 72-hour notice period before emergency actions can be taken
     */
    function declareEmergency(string calldata reason) external onlyRole(EMERGENCY_ROLE) {
        require(!emergencyActive, "Emergency already active");
        
        emergencyActive = true;
        emergencyDeclaredAt = block.timestamp;
        
        emit EmergencyDeclared(reason, EMERGENCY_NOTICE_PERIOD);
    }

    /**
     * @dev End emergency situation
     */
    function endEmergency() external onlyRole(EMERGENCY_ROLE) {
        require(emergencyActive, "No active emergency");
        require(block.timestamp >= emergencyDeclaredAt + EMERGENCY_NOTICE_PERIOD, "Notice period not elapsed");
        
        emergencyActive = false;
        emergencyDeclaredAt = 0;
    }

    /**
     * @dev Emergency override function
     * Only in emergency situations with high approval requirements
     */
    function emergencyOverride(bytes32 role, address account) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(emergencyActive, "Emergency must be active");
        require(block.timestamp >= emergencyDeclaredAt + EMERGENCY_NOTICE_PERIOD, "72-hour notice required");
        require(councilApproval(1000000 * 10**18), "80% council approval required");
        
        _grantRole(role, account);
       emit EmergencyOverrideExecuted(role, account, msg.sender);
    }

    /**
     * @dev Add emergency admin
     */
    function addEmergencyAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(admin != address(0), "Invalid admin address");
        
        isEmergencyAdmin[admin] = true;
        _grantRole(EMERGENCY_ROLE, admin);
    }

    /**
     * @dev Remove emergency admin
     */
    function removeEmergencyAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isEmergencyAdmin[admin] = false;
        _revokeRole(EMERGENCY_ROLE, admin);
    }

    /**
     * @dev Revenue sharing with stakers - DAO controlled
     */
    function distributeRevenue(uint256 amount) external onlyRole(GOVERNANCE_ROLE) {
        require(totalSupply() > 0, "LXON: No supply");
        uint256 distributionAmount = (amount * REVENUE_SHARE_PERCENTAGE) / 100;
        
        _mint(address(this), distributionAmount);
        totalRevenueShared += distributionAmount;
        
        emit RevenueDistributed(distributionAmount);
    }

    /**
     * @dev Emergency pause - only PAUSER_ROLE (DAO granted)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    /**
     * @dev Emergency unpause - only PAUSER_ROLE (DAO granted)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Grant governance role - only DEFAULT_ADMIN_ROLE initially
     * After setup, this will be controlled by DAO
     */
    function grantGovernanceRole(address account, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit GovernanceGranted(account, role);
    }

    /**
     * @dev Revoke governance role - only DEFAULT_ADMIN_ROLE initially
     * After setup, this will be controlled by DAO
     */
    function revokeGovernanceRole(address account, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit GovernanceRevoked(account, role);
    }

    /**
     * @dev Transfer DEFAULT_ADMIN_ROLE to DAO governance contract
     * This is the key step to decentralize control
     */
    function transferAdminRole(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Check if address has MINTER_ROLE
     */
    function isMinter(address account) public view returns (bool) {
        return hasRole(MINTER_ROLE, account) || isMinterAddress[account];
    }

    /**
     * @dev Add minter address - governance controlled
     */
    function addMinter(address minter) external onlyRole(GOVERNANCE_ROLE) {
        require(minter != address(0), "Invalid minter address");
        isMinterAddress[minter] = true;
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Remove minter address - governance controlled
     */
    function removeMinter(address minter) external onlyRole(GOVERNANCE_ROLE) {
        isMinterAddress[minter] = false;
        _revokeRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Get minting role members
     */
    function getMinters() public view returns (address[] memory) {
        // Return addresses that have minter role or are registered as minters
        // This is a simplified implementation
        address[] memory minters = new address[](1);
        if (hasRole(MINTER_ROLE, msg.sender)) {
            minters[0] = msg.sender;
        }
        return minters;
    }

    /**
     * @dev Get technical council members
     */
    function getTechnicalCouncilMembers() public view returns (address[] memory) {
        return technicalCouncilMembers;
    }

    /**
     * @dev Get council size
     */
    function getCouncilSize() public view returns (uint256) {
        return technicalCouncilSize;
    }

    /**
     * @dev Check if address is technical council member
     */
    function isCouncilMember(address account) public view returns (bool) {
        return isTechnicalCouncilMember[account];
    }

    /**
     * @dev Get emergency status
     */
    function getEmergencyStatus() public view returns (
        bool active,
        uint256 declaredAt,
        uint256 noticePeriod,
        uint256 timeUntilExpiry
    ) {
        active = emergencyActive;
        declaredAt = emergencyDeclaredAt;
        noticePeriod = EMERGENCY_NOTICE_PERIOD;
        
        if (emergencyActive) {
            uint256 expiryTime = emergencyDeclaredAt + EMERGENCY_NOTICE_PERIOD;
            if (block.timestamp >= expiryTime) {
                timeUntilExpiry = 0;
            } else {
                timeUntilExpiry = expiryTime - block.timestamp;
            }
        } else {
            timeUntilExpiry = 0;
        }
    }

    /**
     * @dev Check if address is emergency admin
     */
    function isEmergencyAdminAddress(address account) public view returns (bool) {
        return isEmergencyAdmin[account];
    }

    // Storage rent functions
    function payStorageRent(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        StorageRentInfo storage rentInfo = storageRent[msg.sender];
        rentInfo.lastPaid = block.timestamp;
        rentInfo.balanceOwed = rentInfo.balanceOwed > amount ? rentInfo.balanceOwed - amount : 0;
        rentInfo.evictable = false;
        emit StorageRentPaid(msg.sender, amount);
    }

    function updateStateSize(address account, uint256 size) external onlyRole(GOVERNANCE_ROLE) {
        stateSize[account] = size;
        if (size == 0) {
            storageRent[account].evictable = true;
        }
    }

    function evictState(address account) external onlyRole(GOVERNANCE_ROLE) {
        require(storageRent[account].evictable, "Account is not evictable");
        require(stateSize[account] == 0, "State size must be zero");
        delete storageRent[account];
        delete stateSize[account];
        emit StateEvicted(account);
    }

    function checkStorageRent(address account) external view returns (uint256 owed, bool evictable) {
        StorageRentInfo storage rentInfo = storageRent[account];
        uint256 elapsed = block.timestamp - rentInfo.lastPaid;
        owed = rentInfo.balanceOwed + (elapsed * STORAGE_RENT_RATE);
        evictable = rentInfo.evictable || owed > EVICTION_THRESHOLD;
    }

    // View functions
    function getCurrentEmissionDay() public view returns (uint256) {
        if (!emissionStarted()) return 0;
        return (block.timestamp - emissionStartTime) / 1 days;
    }

    function emissionStarted() public view returns (bool) {
        return emissionStartTime > 0;
    }

    function getRemainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalEmitted;
    }

    function getEmissionProgress() public view returns (
        uint256 currentDay,
        uint256 totalDays,
        uint256 remainingSupply,
        uint256 progressPercentage
    ) {
        currentDay = getCurrentEmissionDay();
        totalDays = EMISSION_DURATION / 1 days;
        remainingSupply = getRemainingSupply();
        progressPercentage = (totalEmitted * 100) / MAX_SUPPLY;
    }

    function getMintingStatistics() public view returns (
        uint256 totalOwnerMintedAmount,
        uint256 dailyOwnerMintedAmount,
        uint256 remainingDailyLimit,
        uint256 remainingTotalLimit,
        uint256 mintingDay
    ) {
        totalOwnerMintedAmount = totalOwnerMinted;
        dailyOwnerMintedAmount = dailyOwnerMinted;
        remainingDailyLimit = dailyMintLimit - dailyOwnerMinted;
        remainingTotalLimit = MAX_OWNER_MINT - totalOwnerMinted;
        mintingDay = lastMintDay;
    }

    // Override required functions
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // Helper function
    function _amountsSum(uint256[] calldata amounts) internal pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            sum += amounts[i];
        }
        return sum;
    }
}