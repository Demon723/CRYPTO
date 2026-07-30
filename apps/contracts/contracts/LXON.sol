// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LXON is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18;

    uint256 public constant EMISSION_RATE = 5;
    uint256 public constant REVENUE_SHARE_PERCENTAGE = 30;

    event EmissionMinted(uint256 amount);
    event RevenueDistributed(uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor() ERC20("LXON", "LXON") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "LXON: exceeds max supply");
        _mint(to, amount);
        emit EmissionMinted(amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function burn(uint256 amount) public override {
        super.burn(amount);
        emit Burned(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOwner {
        super.burnFrom(account, amount);
        emit Burned(account, amount);
    }

    function distributeRevenue(uint256 amount) external onlyOwner {
        require(totalSupply() > 0, "No supply");
        uint256 distributionAmount = (amount * REVENUE_SHARE_PERCENTAGE) / 100;
        _mint(address(this), distributionAmount);
        emit RevenueDistributed(distributionAmount);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) whenNotPaused {
        super._update(from, to, value);
    }
}
