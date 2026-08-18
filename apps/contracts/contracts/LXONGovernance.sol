// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Governance (Standalone Blockchain)
 * @dev Governance system for LXON standalone blockchain - no ETH dependencies
 * Advisory-only governance with team control and technical council veto
 */
interface IToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract LXONGovernance {
    // Token reference
    address public token;
    
    // Governance State
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 timestamp;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool vetoed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Voting Parameters
    uint256 public votingPeriod = 7 days;
    uint256 public quorumThreshold = 10; // 10% of total supply
    uint256 public executionDelay = 2 days;
    
    // Technical Council
    mapping(address => bool) public isCouncilMember;
    address[] public councilMembers;
    uint256 public councilSize;
    uint256 public constant COUNCIL_VETO_THRESHOLD = 60; // 60% of council to veto
    
    // Emergency System
    bool public emergencyActive;
    uint256 public emergencyDeclaredAt;
    uint256 public constant EMERGENCY_NOTICE_PERIOD = 72 hours;
    mapping(address => bool) public isEmergencyAdmin;
    
    // Team Control
    address public owner;
    bool public paused;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalVetoed(uint256 indexed proposalId, address indexed councilMember, string reason);
    event EmergencyDeclared(string reason, uint256 noticePeriod);
    event EmergencyResolved();
    event CouncilMemberAdded(address indexed member);
    event CouncilMemberRemoved(address indexed member);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyCouncilMember() {
        require(isCouncilMember[msg.sender], "Not council member");
        _;
    }
    
    modifier onlyEmergencyAdmin() {
        require(isEmergencyAdmin[msg.sender], "Not emergency admin");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Governance is paused");
        _;
    }
    
    constructor(address _token) {
        token = _token;
        owner = msg.sender;
        
        // Add deployer to technical council
        isCouncilMember[msg.sender] = true;
        councilMembers.push(msg.sender);
        councilSize = 1;
        
        // Add deployer to emergency admin
        isEmergencyAdmin[msg.sender] = true;
    }
    
    // ========== PROPOSAL FUNCTIONS ==========
    
    function createProposal(string memory description) external whenNotPaused returns (uint256) {
        require(bytes(description).length > 0, "Description cannot be empty");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.timestamp = block.timestamp;
        
        emit ProposalCreated(proposalCount, msg.sender, description);
        
        return proposalCount;
    }
    
    function vote(uint256 proposalId, uint8 support) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= proposal.timestamp + votingPeriod, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal vetoed");
        require(support <= 2, "Invalid vote option"); // 0=Against, 1=For, 2=Abstain
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support == 1) {
            proposal.forVotes++;
        } else if (support == 0) {
            proposal.againstVotes++;
        } else {
            proposal.abstainVotes++;
        }
        
        emit VoteCast(proposalId, msg.sender, support == 1);
    }
    
    function executeProposal(uint256 proposalId) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.timestamp + votingPeriod, "Voting period not ended");
        require(block.timestamp <= proposal.timestamp + votingPeriod + executionDelay, "Execution period expired");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal vetoed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal did not pass");
        
        // Check quorum
        uint256 totalSupply = IToken(token).totalSupply();
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        require(totalVotes * 100 >= totalSupply * quorumThreshold, "Quorum not met");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    // ========== TECHNICAL COUNCIL FUNCTIONS ==========
    
    function addCouncilMember(address member) external onlyOwner {
        require(member != address(0), "Invalid member address");
        require(!isCouncilMember[member], "Already council member");
        
        isCouncilMember[member] = true;
        councilMembers.push(member);
        councilSize++;
        
        emit CouncilMemberAdded(member);
    }
    
    function removeCouncilMember(address member) external onlyOwner {
        require(isCouncilMember[member], "Not council member");
        
        isCouncilMember[member] = false;
        councilSize--;
        
        emit CouncilMemberRemoved(member);
    }
    
    function vetoProposal(uint256 proposalId, string memory reason) external onlyCouncilMember {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.vetoed, "Proposal already vetoed");
        
        proposal.vetoed = true;
        
        emit ProposalVetoed(proposalId, msg.sender, reason);
    }
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    function declareEmergency(string memory reason) external onlyEmergencyAdmin {
        require(!emergencyActive, "Emergency already active");
        
        emergencyActive = true;
        emergencyDeclaredAt = block.timestamp;
        
        emit EmergencyDeclared(reason, EMERGENCY_NOTICE_PERIOD);
    }
    
    function resolveEmergency() external onlyEmergencyAdmin {
        require(emergencyActive, "No active emergency");
        require(block.timestamp >= emergencyDeclaredAt + EMERGENCY_NOTICE_PERIOD, "Notice period not met");
        
        emergencyActive = false;
        
        emit EmergencyResolved();
    }
    
    function addEmergencyAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid admin address");
        isEmergencyAdmin[admin] = true;
    }
    
    function removeEmergencyAdmin(address admin) external onlyOwner {
        isEmergencyAdmin[admin] = false;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod >= 1 days, "Voting period too short");
        require(newPeriod <= 30 days, "Voting period too long");
        votingPeriod = newPeriod;
    }
    
    function setQuorumThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold >= 5, "Quorum too low");
        require(newThreshold <= 50, "Quorum too high");
        quorumThreshold = newThreshold;
    }
    
    function setExecutionDelay(uint256 newDelay) external onlyOwner {
        require(newDelay >= 1 hours, "Delay too short");
        require(newDelay <= 7 days, "Delay too long");
        executionDelay = newDelay;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 timestamp,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool vetoed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.timestamp,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.vetoed
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    function getCouncilMembers() external view returns (address[] memory) {
        return councilMembers;
    }
    
    function getGovernanceInfo() external view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 councilMemberCount,
        bool isEmergency
    ) {
        totalProposals = proposalCount;
        
        uint256 active = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (!proposals[i].executed && !proposals[i].vetoed) {
                active++;
            }
        }
        activeProposals = active;
        
        councilMemberCount = councilSize;
        isEmergency = emergencyActive;
    }
}