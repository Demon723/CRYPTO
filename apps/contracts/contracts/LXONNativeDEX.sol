// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";

/**
 * @title LXON Native DEX (Standalone Blockchain)
 * @dev Native decentralized exchange for LXON blockchain - no ETH dependencies
 * Uses native XON tokens for both trading and liquidity
 */
contract LXONNativeDEX {
    LXONNativeToken public token;
    
    // Liquidity Pool
    uint256 public liquidityTokenTotalSupply;
    mapping(address => uint256) public liquidityTokenBalance;
    
    // Pool State
    uint256 public reserveTokenA;
    uint256 public reserveTokenB;
    
    // DEX Parameters
    uint256 public feeRate = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Pool Info
    address public tokenA;
    address public tokenB;
    string public pairName;
    
    // Admin
    address public owner;
    bool public paused;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event Swap(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event PairCreated(address indexed tokenA, address indexed tokenB, string pairName);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "DEX is paused");
        _;
    }
    
    constructor(address _token, address _tokenA, address _tokenB, string memory _pairName) {
        token = LXONNativeToken(_token);
        tokenA = _tokenA;
        tokenB = _tokenB;
        pairName = _pairName;
        owner = msg.sender;
        
        emit PairCreated(_tokenA, _tokenB, _pairName);
    }
    
    // ========== LIQUIDITY FUNCTIONS ==========
    
    function addLiquidity(uint256 amountA, uint256 amountB) external whenNotPaused {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");
        
        // Transfer tokens from user
        if (tokenA == address(token)) {
            // Native token transfer
            require(token.transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
        } else {
            // For other tokens, would need IERC20 interface
            revert("Only native token supported currently");
        }
        
        if (tokenB == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountB), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Calculate liquidity tokens
        uint256 liquidityTokens;
        if (liquidityTokenTotalSupply == 0) {
            // First liquidity provider
            liquidityTokens = sqrt(amountA * amountB);
        } else {
            // Existing liquidity provider
            liquidityTokens = min(
                (amountA * liquidityTokenTotalSupply) / reserveTokenA,
                (amountB * liquidityTokenTotalSupply) / reserveTokenB
            );
        }
        
        require(liquidityTokens > 0, "Insufficient liquidity tokens");
        
        // Update reserves
        reserveTokenA += amountA;
        reserveTokenB += amountB;
        
        // Mint liquidity tokens
        liquidityTokenBalance[msg.sender] += liquidityTokens;
        liquidityTokenTotalSupply += liquidityTokens;
        
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityTokens);
    }
    
    function removeLiquidity(uint256 liquidityTokens) external whenNotPaused {
        require(liquidityTokens > 0, "Liquidity tokens must be greater than 0");
        require(liquidityTokenBalance[msg.sender] >= liquidityTokens, "Insufficient liquidity tokens");
        
        // Calculate share of reserves
        uint256 amountA = (liquidityTokens * reserveTokenA) / liquidityTokenTotalSupply;
        uint256 amountB = (liquidityTokens * reserveTokenB) / liquidityTokenTotalSupply;
        
        require(amountA > 0 && amountB > 0, "Insufficient reserves");
        
        // Update reserves
        reserveTokenA -= amountA;
        reserveTokenB -= amountB;
        
        // Burn liquidity tokens
        liquidityTokenBalance[msg.sender] -= liquidityTokens;
        liquidityTokenTotalSupply -= liquidityTokens;
        
        // Transfer tokens back to user
        if (tokenA == address(token)) {
            require(token.transfer(msg.sender, amountA), "Transfer A failed");
        }
        
        if (tokenB == address(token)) {
            require(token.transfer(msg.sender, amountB), "Transfer B failed");
        }
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityTokens);
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
        if (tokenA == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountIn), "Transfer A failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Update reserves
        reserveTokenA += amountIn;
        reserveTokenB -= amountOut;
        
        // Transfer token B to user
        if (tokenB == address(token)) {
            require(token.transfer(msg.sender, amountOut), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        emit Swap(msg.sender, tokenA, amountIn, amountOut);
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
        if (tokenB == address(token)) {
            require(token.transferFrom(msg.sender, address(this), amountIn), "Transfer B failed");
        } else {
            revert("Only native token supported currently");
        }
        
        // Update reserves
        reserveTokenB += amountIn;
        reserveTokenA -= amountOut;
        
        // Transfer token A to user
        if (tokenA == address(token)) {
            require(token.transfer(msg.sender, amountOut), "Transfer A failed");
        } else {
            revert("Only native token supported currently");
        }
        
        emit Swap(msg.sender, tokenB, amountIn, amountOut);
        return amountOut;
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
    
    function getLiquidityTokenBalance(address user) external view returns (uint256) {
        return liquidityTokenBalance[user];
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
    
    function withdrawFees() external onlyOwner {
        // Fees are collected as part of the spread
        // In a full implementation, track and withdraw accumulated fees
        revert("Fee withdrawal not implemented");
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function sqrt(uint256 x) pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function min(uint256 a, uint256 b) pure returns (uint256) {
        return a < b ? a : b;
    }
}