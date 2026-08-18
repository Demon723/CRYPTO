// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";

/**
 * @title LXON Native Swap (Standalone Blockchain)
 * @dev Native swap contract for LXON blockchain - no ETH dependencies
 * Uses native XON tokens for both sides of the swap
 */
contract LXONNativeSwap {
    LXONNativeToken public token;
    
    // Token Pair Reserves
    uint256 public reserveTokenA;
    uint256 public reserveTokenB;
    
    // Swap Parameters
    uint256 public feeRate = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Pair Information
    address public tokenAAddress;
    address public tokenBAddress;
    string public pairName;
    
    // Admin
    address public owner;
    bool public paused;
    
    // Events
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Swap is paused");
        _;
    }
    
    constructor(address _token, address _tokenA, address _tokenB, string memory _pairName) {
        token = LXONNativeToken(_token);
        tokenAAddress = _tokenA;
        tokenBAddress = _tokenB;
        pairName = _pairName;
        owner = msg.sender;
    }
    
    // ========== SWAP FUNCTIONS ==========
    
    function swapTokenAForTokenB(uint256 amountIn) external whenNotPaused returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveTokenA > 0 && reserveTokenB > 0, "Insufficient liquidity");
        
        // Calculate output amount (x*y=k formula with fee)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - feeRate);
        uint256 amountOut = (amountInWithFee * reserveTokenB) / (reserveTokenA * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut > 0, "Insufficient output");
        require(reserveTokenB >= amountOut, "Insufficient reserve");
        
        // Transfer token A from user
        if (tokenAAddress == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountIn), "Transfer A failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Update reserves
        reserveTokenA += amountIn;
        reserveTokenB -= amountOut;
        
        // Transfer token B to user
        if (tokenBAddress == address(token)) {
            require(token.transfer(msg.sender, amountOut), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        emit Swap(msg.sender, amountIn, amountOut);
        return amountOut;
    }
    
    function swapTokenBForTokenA(uint256 amountIn) external whenNotPaused returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveTokenA > 0 && reserveTokenB > 0, "Insufficient liquidity");
        
        // Calculate output amount (x*y=k formula with fee)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - feeRate);
        uint256 amountOut = (amountInWithFee * reserveTokenA) / (reserveTokenB * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut > 0, "Insufficient output");
        require(reserveTokenA >= amountOut, "Insufficient reserve");
        
        // Transfer token B from user
        if (tokenBAddress == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountIn), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Update reserves
        reserveTokenB += amountIn;
        reserveTokenA -= amountOut;
        
        // Transfer token A to user
        if (tokenAAddress == address(token)) {
            require(token.transfer(msg.sender, amountOut), "Transfer A failed");
        } else {
            revert("Only native token supported currently");
        }
        
        emit Swap(msg.sender, amountIn, amountOut);
        return amountOut;
    }
    
    // ========== LIQUIDITY FUNCTIONS ==========
    
    function addLiquidity(uint256 amountA, uint256 amountB) external whenNotPaused {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        
        // Transfer tokens from user
        if (tokenAAddress == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
        } else {
            revert("Only native token supported currently");
        }
        
        if (tokenBAddress == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountB), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Update reserves
        reserveTokenA += amountA;
        reserveTokenB += amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }
    
    function removeLiquidity(uint256 amountA, uint256 amountB) external whenNotPaused {
        require(reserveTokenA >= amountA && reserveTokenB >= amountB, "Insufficient reserves");
        
        // Update reserves
        reserveTokenA -= amountA;
        reserveTokenB -= amountB;
        
        // Transfer tokens back to user
        if (tokenAAddress == address(token)) {
            require(token.transfer(msg.sender, amountA), "Transfer A failed");
        }
        
        if (tokenBAddress == address(token)) {
            require(token.transfer(msg.sender, amountB), "Transfer B failed");
        }
        
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }
    
    // ========== PRICE FUNCTIONS ==========
    
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - feeRate);
        uint256 amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        return amountOut;
    }
    
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountOut > 0, "Amount must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 numerator = reserveIn * amountOut * FEE_DENOMINATOR;
        uint256 denominator = (reserveOut - amountOut) * (FEE_DENOMINATOR - feeRate);
        uint256 amountIn = numerator / denominator + 1;
        
        return amountIn;
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (reserveTokenA, reserveTokenB);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    function setFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        feeRate = newFeeRate;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
}
