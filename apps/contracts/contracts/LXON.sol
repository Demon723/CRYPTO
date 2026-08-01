// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LXON is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18;

    uint256 public constant EMISSION_RATE = 5;
    uint256 public constant REVENUE_SHARE_PERCENTAGE = 30;

    uint256 public constant STORAGE_RENT_RATE = 0.001 ether;
    uint256 public constant EVICTION_THRESHOLD = 0;

    struct StorageRentInfo {
        uint256 lastPaid;
        uint256 balanceOwed;
        bool evictable;
    }

    mapping(address => StorageRentInfo) public storageRent;
    mapping(address => uint256) public stateSize;

    event EmissionMinted(uint256 amount);
    event RevenueDistributed(uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event StorageRentPaid(address indexed account, uint256 amount);
    event StateEvicted(address indexed account);

    constructor() ERC20("LXON", "LXON") Ownable(msg.sender) Pausable() {
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

    function burn(uint256 amount) public whenNotPaused {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public onlyOwner whenNotPaused {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
        emit Burned(account, amount);
    }

    function distributeRevenue(uint256 amount) external onlyOwner {
        require(totalSupply() > 0, "No supply");
        uint256 distributionAmount = (amount * REVENUE_SHARE_PERCENTAGE) / 100;
        _mint(address(this), distributionAmount);
        emit RevenueDistributed(distributionAmount);
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }

    function payStorageRent(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        StorageRentInfo storage rentInfo = storageRent[msg.sender];
        rentInfo.lastPaid = block.timestamp;
        rentInfo.balanceOwed = rentInfo.balanceOwed > amount ? rentInfo.balanceOwed - amount : 0;
        rentInfo.evictable = false;
        emit StorageRentPaid(msg.sender, amount);
    }

    function updateStateSize(address account, uint256 size) external onlyOwner {
        stateSize[account] = size;
        if (size == 0) {
            storageRent[account].evictable = true;
        }
    }

    function evictState(address account) external onlyOwner {
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
}
