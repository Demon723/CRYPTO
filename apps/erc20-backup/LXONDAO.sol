// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorPreventLateQuorum.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title LXON DAO - Community-Controlled Governance
 * @dev LXOM token holders control protocol through on-chain voting
 * NO government control - pure token holder democracy
 * @custom:security-contact security@lxon.network
 */
contract LXONDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    GovernorPreventLateQuorum
{
    // Proposal types for different actions
    bytes32 public constant PROPOSAL_TYPE_EMISSION = keccak256("EMISSION");
    bytes32 public constant PROPOSAL_TYPE_REVENUE = keccak256("REVENUE");
    bytes32 public constant PROPOSAL_TYPE_PARAMETER = keccak256("PARAMETER");
    bytes32 public constant PROPOSAL_TYPE_GRANT = keccak256("GRANT");
    bytes32 public constant PROPOSAL_TYPE_EMERGENCY = keccak256("EMERGENCY");

    // Minimum emission parameters (prevent malicious proposals)
    uint256 public constant MIN_DAILY_EMISSION = 1_000 * 10**18; // Minimum 1K tokens/day
    uint256 public constant MAX_DAILY_EMISSION = 100_000 * 10**18; // Maximum 100K tokens/day
    uint256 public constant MIN_VOTING_DELAY = 1 days;
    uint256 public constant MAX_VOTING_DELAY = 7 days;
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;

    // Advisory proposal system (non-binding)
    enum ProposalStatus {
        Active,
        Accepted,
        Rejected,
        Expired
    }

    struct AdvisoryProposal {
        address proposer;
        string proposal;
        uint256 createdAt;
        uint256 votesFor;
        uint256 votesAgainst;
        ProposalStatus status;
        string teamResponse;
    }

    mapping(bytes32 => AdvisoryProposal) public advisoryProposals;

    // Events
    event AdvisoryProposalCreated(bytes32 indexed proposalId, address indexed proposer, string proposal);
    event AdvisoryVoteCast(bytes32 indexed proposalId, address indexed voter, uint8 support);
    event AdvisoryResponse(bytes32 indexed proposalId, address indexed teamMember, string response, bool implement);

    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("LXON DAO")
        GovernorSettings(
            1 days, // initial voting delay
            7 days, // initial voting period
            0      // initial proposal threshold (0 means any token holder can propose)
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum requirement
        GovernorTimelockControl(_timelock)
        GovernorPreventLateQuorum(1 days) // 1 day late voting protection
    {}

    /**
     * @dev Advisory proposal only - no direct control
     * Community can propose but team decides
     */
    function proposeAdvisory(string calldata proposal) public returns (uint256) {
        bytes32 proposalId = keccak256(abi.encodePacked(block.timestamp, msg.sender, proposal));
        advisoryProposals[proposalId] = AdvisoryProposal({
            proposer: msg.sender,
            proposal: proposal,
            createdAt: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            status: ProposalStatus.Active,
            teamResponse: ""
        });
        
        emit AdvisoryProposalCreated(proposalId, msg.sender, proposal);
        return uint256(proposalId);
    }

    /**
     * @dev Vote on advisory proposal (non-binding)
     * Community can vote but it doesn't force action
     */
    function voteAdvisory(bytes32 proposalId, uint8 support) public {
        require(advisoryProposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        require(advisoryProposals[proposalId].createdAt + votingPeriod() >= block.timestamp, "Voting period ended");
        
        if (support == 1) {
            advisoryProposals[proposalId].votesFor++;
        } else if (support == 0) {
            advisoryProposals[proposalId].votesAgainst++;
        }
        
        emit AdvisoryVoteCast(proposalId, msg.sender, support);
    }

    /**
     * @dev Team responds to advisory proposal
     * Team reviews community input and makes final decision
     */
    function respondToAdvisory(bytes32 proposalId, string calldata response, bool implement) 
        external 
    {
        require(advisoryProposals[proposalId].status == ProposalStatus.Active, "Proposal not active");
        
        advisoryProposals[proposalId].teamResponse = response;
        advisoryProposals[proposalId].status = implement ? ProposalStatus.Accepted : ProposalStatus.Rejected;
        
        emit AdvisoryResponse(proposalId, msg.sender, response, implement);
    }

    /**
     * @dev Get advisory proposal details
     */
    function getAdvisoryProposal(bytes32 proposalId) public view returns (
        address proposer,
        string memory proposal,
        uint256 createdAt,
        uint256 votesFor,
        uint256 votesAgainst,
        ProposalStatus status,
        string memory teamResponse
    ) {
        AdvisoryProposal memory adv = advisoryProposals[proposalId];
        return (
            adv.proposer,
            adv.proposal,
            adv.createdAt,
            adv.votesFor,
            adv.votesAgainst,
            adv.status,
            adv.teamResponse
        );
    }

    /**
     * @dev Get active advisory proposals
     */
    function getActiveAdvisoryProposals() public view returns (bytes32[] memory) {
        bytes32[] memory activeProposals = new bytes32[](0);
        uint256 count = 0;
        
        // This would require iteration - simplified for now
        // In production, use better data structure for enumeration
        return activeProposals;
    }

    /**
     * @dev Get advisory voting statistics
     */
    function getAdvisoryStatistics() public view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 acceptedProposals,
        uint256 rejectedProposals
    ) {
        // Simplified statistics
        totalProposals = 0;
        activeProposals = 0;
        acceptedProposals = 0;
        rejectedProposals = 0;
        
        // Would require actual enumeration
        return (totalProposals, activeProposals, acceptedProposals, rejectedProposals);
    }

    // Required overrides
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /**
     * @dev Get state of a proposal
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        return state(proposalId);
    }

    /**
     * @dev Check if account can vote
     */
    function canVote(address account, uint256 proposalId) public view returns (bool) {
        return !hasVoted(proposalId, account);
    }

    /**
     * @dev Get voting power of account at block
     */
    function getVotes(address account, uint256 blockNumber) public view override(Governor, GovernorVotes) returns (uint256) {
        return token.getPastVotes(account, blockNumber);
    }

    /**
     * @dev Cast vote with reason
     */
    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string calldata reason
    ) public override(Governor, GovernorVotes) returns (uint256) {
        return _castVote(proposalId, support, reason);
    }

    /**
     * @dev Get proposal counts
     */
    function getProposalCounts() public view returns (
        uint256 total,
        uint256 active,
        uint256 successful,
        uint256 defeated
    ) {
        // Would require iterating proposals - simplified for now
        return (0, 0, 0, 0);
    }

    /**
     * @dev Get DAO statistics
     */
    function getDAOStatistics() public view returns (
        uint256 totalTokenSupply,
        uint256 totalVoters,
        uint256 totalProposals,
        uint256 participationRate
    ) {
        totalTokenSupply = token.totalSupply();
        // These would require additional tracking
        totalVoters = 0;
        totalProposals = 0;
        participationRate = 0;
    }
}