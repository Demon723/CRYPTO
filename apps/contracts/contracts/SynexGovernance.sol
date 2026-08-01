// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SynexGovernance is Governor, GovernorTimelockControl, Ownable {
    address public immutable lxonToken;

    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18;
    uint256 public constant QUORUM = 10_000_000 * 10**18;

    constructor(
        address timelock,
        address _lxonToken
    )
        Governor("SynexGovernance")
        GovernorTimelockControl(TimelockController(payable(timelock)))
        Ownable(msg.sender)
    {
        require(_lxonToken != address(0), "Invalid token address");
        lxonToken = _lxonToken;
    }

    function proposalThreshold() public pure override returns (uint256) {
        return PROPOSAL_THRESHOLD;
    }

    function quorum(uint256) public pure override returns (uint256) {
        return QUORUM;
    }

    function votingDelay() public pure override returns (uint256) {
        return 1 days;
    }

    function votingPeriod() public pure override returns (uint256) {
        return 7 days;
    }

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (Governor.ProposalState) {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 salt) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, salt);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return address(timelock());
    }

    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=blocktimestamp";
    }

    function COUNTING_MODE() public pure override returns (string memory) {
        return "support=bravo&quorum=for,against,abstain";
    }

    function _getVotes(address account, uint256 timepoint, bytes memory params) internal view override returns (uint256) {
        return 0;
    }

    function _quorumReached(uint256 proposalId) internal view override returns (bool) {
        return _voteSucceeded(proposalId);
    }

    function _voteSucceeded(uint256 proposalId) internal view override returns (bool) {
        return _quorumReached(proposalId);
    }

    function _countVote(uint256 proposalId, address account, uint8 support, uint256 totalWeight, bytes memory params) internal view override returns (uint256) {
        return 0;
    }

    function hasVoted(uint256 proposalId, address account) external view override returns (bool) {
        return false;
    }

    function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }
}
