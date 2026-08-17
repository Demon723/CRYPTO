// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LXONTokenSale is Ownable {
    IERC20 public lxonToken;
    
    uint256 public constant TOKEN_PRICE = 0.0001 ether; // 1 LXON = 0.0001 native tokens
    uint256 public constant MIN_PURCHASE = 1 ether; // Minimum 1 native token
    uint256 public constant MAX_PURCHASE = 100 ether; // Maximum 100 native tokens
    uint256 public constant SALE_CAP = 1000000 ether; // 1 million LXON tokens for sale
    
    uint256 public tokensSold;
    bool public saleActive = true;
    uint256 public saleStartTime;
    uint256 public saleEndTime;
    
    mapping(address => uint256) public purchases;
    address[] public purchasers;
    
    event TokensPurchased(address indexed purchaser, uint256 amount, uint256 cost);
    event SaleStatusChanged(bool active);
    event SaleTimeUpdated(uint256 startTime, uint256 endTime);
    event TokensWithdrawn(address indexed to, uint256 amount);
    event NativeWithdrawn(address indexed to, uint256 amount);
    
    constructor(
        address _lxonToken,
        uint256 _saleDuration
    ) Ownable(msg.sender) {
        lxonToken = IERC20(_lxonToken);
        saleStartTime = block.timestamp;
        saleEndTime = block.timestamp + _saleDuration;
    }
    
    function buyTokens() external payable {
        require(saleActive, "Sale is not active");
        require(block.timestamp >= saleStartTime, "Sale has not started");
        require(block.timestamp <= saleEndTime, "Sale has ended");
        require(msg.value >= MIN_PURCHASE, "Minimum purchase not met");
        require(msg.value <= MAX_PURCHASE, "Maximum purchase exceeded");
        
        uint256 tokenAmount = (msg.value * 1 ether) / TOKEN_PRICE;
        require(tokensSold + tokenAmount <= SALE_CAP, "Sale cap exceeded");
        require(lxonToken.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens available");
        
        // Update purchase tracking
        if (purchases[msg.sender] == 0) {
            purchasers.push(msg.sender);
        }
        purchases[msg.sender] += msg.value;
        tokensSold += tokenAmount;
        
        // Transfer tokens to purchaser
        lxonToken.transfer(msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }
    
    function getPurchaserCount() external view returns (uint256) {
        return purchasers.length;
    }
    
    function getPurchasers() external view returns (address[] memory) {
        return purchasers;
    }
    
    function getPurchaseInfo(address purchaser) external view returns (uint256) {
        return purchases[purchaser];
    }
    
    function setSaleActive(bool _active) external onlyOwner {
        saleActive = _active;
        emit SaleStatusChanged(_active);
    }
    
    function setSaleTime(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_endTime > _startTime, "End time must be after start time");
        saleStartTime = _startTime;
        saleEndTime = _endTime;
        emit SaleTimeUpdated(_startTime, _endTime);
    }
    
    function withdrawTokens() external onlyOwner {
        uint256 balance = lxonToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        lxonToken.transfer(owner(), balance);
        emit TokensWithdrawn(owner(), balance);
    }
    
    function withdrawNative() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No native tokens to withdraw");
        payable(owner()).transfer(balance);
        emit NativeWithdrawn(owner(), balance);
    }
    
    function getSaleInfo() external view returns (
        uint256 _tokensSold,
        uint256 _saleCap,
        uint256 _tokenPrice,
        bool _saleActive,
        uint256 _saleStartTime,
        uint256 _saleEndTime,
        uint256 _remainingTokens
    ) {
        _tokensSold = tokensSold;
        _saleCap = SALE_CAP;
        _tokenPrice = TOKEN_PRICE;
        _saleActive = saleActive;
        _saleStartTime = saleStartTime;
        _saleEndTime = saleEndTime;
        _remainingTokens = SALE_CAP - tokensSold;
    }
}
