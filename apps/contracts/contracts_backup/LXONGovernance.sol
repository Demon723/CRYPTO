// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC6372.sol";

contract LXONGovernance is Ownable, IERC6372 {
    TimelockController public immutable timelock;
    IERC20 public immutable lxonToken;
    
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18;
    uint256 public constant QUORUM = 10_000_000 * 10**18;
    
    string public constant name = "LXONGovernance";
    
    constructor(
        TimelockController _timelock,
        IERC20 _lxonToken
    ) Ownable(msg.sender) {
        timelock = _timelock;
        lxonToken = _lxonToken;
    }
    
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }
    
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=blocktimestamp";
    }
    
    function proposalThreshold() public pure returns (uint256) {
        return PROPOSAL_THRESHOLD;
    }
    
    function quorum(uint256) public pure returns (uint256) {
        return QUORUM;
    }
    
    function votingDelay() public pure returns (uint256) {
        return VOTING_DELAY;
    }
    
    function votingPeriod() public pure returns (uint256) {
        return VOTING_PERIOD;
    }
}
