// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SynexGovernance is Governor, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl, AccessControl {
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of circulating supply
    uint256 public constant PROPOSAL_THRESHOLD_PERCENTAGE = 1; // 0.1% => handled via tokens, set at deploy

    bytes32 public constant GOVERNANCE_ADMIN_ROLE = keccak256("GOVERNANCE_ADMIN_ROLE");

    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("Synex Governance")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(QUORUM_PERCENTAGE)
        GovernorTimelockControl(_token, _timelock)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ADMIN_ROLE, msg.sender);
    }

    function votingDelay() public pure override returns (uint256) {
        return VOTING_DELAY;
    }

    function votingPeriod() public pure override returns (uint256) {
        return VOTING_PERIOD;
    }

    function quorumNumerator() public pure override returns (uint256) {
        return 400; // 4% quorum
    }

    function proposalThreshold() public pure override returns (uint256) {
        return (totalSupply() * 1) / 1000; // 0.1% of supply
    }

    function proposalNeedsQuorumCheck(uint256 proposalId) internal view override returns (bool) {
        return false; // handled by quorum fraction
    }

    function _vote(
        address voter,
        uint256 proposalId,
        uint8 support,
        string calldata reason
    ) internal override {
        super._vote(voter, proposalId, support, reason);
    }

    function _execute(uint256 proposalId) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId);
    }

    function _cancel(uint256 proposalId) internal override returns (uint256) {
        return super._cancel(proposalId);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function state(uint256 proposalId) external view returns (ProposalState) {
        return super.state(proposalId);
    }

    // Timelock integration: proposals are queued to timelock, not executed immediately
    function _executor() internal view override returns (address) {
        return address(timelock);
    }
}
