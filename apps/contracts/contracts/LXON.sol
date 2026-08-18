// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/governance/utils/Votes.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract LXON is IERC20, Ownable, Pausable, Votes {
    string public constant name = "LXON";
    string public constant symbol = "LXON";
    uint8 public constant decimals = 18;

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

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    mapping(address => StorageRentInfo) public storageRent;
    mapping(address => uint256) public stateSize;

    event EmissionMinted(uint256 amount);
    event RevenueDistributed(uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event StorageRentPaid(address indexed account, uint256 amount);
    event StateEvicted(address indexed account);

    constructor() Ownable(msg.sender) Pausable() EIP712("LXON", "1") {
        _mint(msg.sender, INITIAL_SUPPLY);
        _delegate(msg.sender, msg.sender);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override whenNotPaused returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "LXON: transfer amount exceeds allowance");
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(_totalSupply + amount <= MAX_SUPPLY, "LXON: exceeds max supply");
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
        uint256 currentAllowance = _allowances[account][msg.sender];
        require(currentAllowance >= amount, "LXON: burn amount exceeds allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
        emit Burned(account, amount);
    }

    function distributeRevenue(uint256 amount) external onlyOwner {
        require(_totalSupply > 0, "No supply");
        uint256 distributionAmount = (amount * REVENUE_SHARE_PERCENTAGE) / 100;
        _mint(address(this), distributionAmount);
        emit RevenueDistributed(distributionAmount);
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

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "LXON: approve from the zero address");
        require(spender != address(0), "LXON: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "LXON: transfer from the zero address");
        require(to != address(0), "LXON: transfer to the zero address");
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "LXON: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        _transferVotingUnits(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "LXON: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        _transferVotingUnits(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "LXON: burn from the zero address");
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "LXON: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            _totalSupply -= amount;
        }
        emit Transfer(account, address(0), amount);
        _transferVotingUnits(account, address(0), amount);
    }

    function _getVotingUnits(address account) internal view override returns (uint256) {
        return _balances[account];
    }
}
