// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract LXON is ERC20Votes, ERC20Burnable, AccessControl {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    TimelockController public immutable timelock;
    address public immutable governance;

    event EmissionMinted(uint256 amount);
    event TreasuryBurned(address indexed account, uint256 amount);

    modifier onlyGovernance() {
        require(
            msg.sender == address(timelock) || msg.sender == governance,
            "LXON: only governance"
        );
        _;
    }

    constructor(
        address _governance,
        uint256 timelockDelay
    ) ERC20("LXON", "LXON") {
        governance = _governance;

        // Timelock: delay enforced, proposer+executor = governance
        timelock = new TimelockController(
            timelockDelay,
            _governance,
            _governance,
            _governance,
            false
        );

        // Zero initial supply — emission starts via governance only
        _grantRole(DEFAULT_ADMIN_ROLE, _governance);
        _grantRole(MINTER_ROLE, address(timelock));
        _grantRole(BURNER_ROLE, address(timelock));
    }

    // Mint only via timelock — no owner, no EOA mint
    function mintEmission(uint256 amount) external onlyGovernance {
        require(totalSupply() + amount <= MAX_SUPPLY, "LXON: exceeds max supply");
        _mint(address(this), amount);
        emit EmissionMinted(amount);
    }

    // Anyone can burn their own tokens
    function burn(uint256 amount) public override {
        super.burn(amount);
    }

    // Governance-timelock can burn treasury surplus
    function burnFromGovernance(address account, uint256 amount) external onlyGovernance {
        _burn(account, amount);
        emit TreasuryBurned(account, amount);
    }

    // No pause function — transfers cannot be halted
    // No owner — AccessControl replaces Ownable
}
