// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleSwap
 * @dev Simplified AMM for LXON token trading on LXON blockchain
 * Uses constant product formula: x * y = k
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public lxonToken;
    uint256 public constant FEE_RATE = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    uint256 public reserveLXON;
    uint256 public reserveNative;
    
    address public feeRecipient;
    
    event LiquidityAdded(address indexed provider, uint256 lxonAmount, uint256 nativeAmount);
    event LiquidityRemoved(address indexed provider, uint256 lxonAmount, uint256 nativeAmount);
    event Swap(address indexed trader, uint256 amountIn, uint256 amountOut, bool lxonToNative);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address _lxonToken, address _feeRecipient) Ownable(msg.sender) {
        require(_lxonToken != address(0), "Invalid token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        lxonToken = IERC20(_lxonToken);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Add liquidity to the pool
     * @param lxonAmount Amount of LXON tokens to add
     * @param nativeAmount Amount of native tokens to add
     */
    function addLiquidity(uint256 lxonAmount, uint256 nativeAmount) external payable nonReentrant {
        require(lxonAmount > 0 && nativeAmount > 0, "Amounts must be > 0");
        
        // Transfer tokens from user
        lxonToken.safeTransferFrom(msg.sender, address(this), lxonAmount);
        
        // For native tokens, assume msg.value contains the amount
        require(msg.value == nativeAmount, "Native amount mismatch");
        
        // Update reserves
        reserveLXON += lxonAmount;
        reserveNative += nativeAmount;
        
        emit LiquidityAdded(msg.sender, lxonAmount, nativeAmount);
    }

    /**
     * @dev Remove liquidity from the pool
     * @param lxonAmount Amount of LXON tokens to remove
     * @param nativeAmount Amount of native tokens to remove
     */
    function removeLiquidity(uint256 lxonAmount, uint256 nativeAmount) external nonReentrant {
        require(lxonAmount > 0 && nativeAmount > 0, "Amounts must be > 0");
        require(reserveLXON >= lxonAmount && reserveNative >= nativeAmount, "Insufficient reserves");
        
        // Update reserves
        reserveLXON -= lxonAmount;
        reserveNative -= nativeAmount;
        
        // Transfer tokens back to user
        lxonToken.safeTransfer(msg.sender, lxonAmount);
        
        // Transfer native tokens back to user
        payable(msg.sender).transfer(nativeAmount);
        
        emit LiquidityRemoved(msg.sender, lxonAmount, nativeAmount);
    }

    /**
     * @dev Swap LXON for native tokens
     * @param lxonAmount Amount of LXON to swap
     */
    function swapLXONForNative(uint256 lxonAmount) external nonReentrant {
        require(lxonAmount > 0, "Amount must be > 0");
        require(reserveLXON > 0 && reserveNative > 0, "No liquidity");
        
        // Calculate output amount using constant product formula
        uint256 amountInWithFee = lxonAmount * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveNative;
        uint256 denominator = (reserveLXON * FEE_DENOMINATOR) + amountInWithFee;
        uint256 nativeAmountOut = numerator / denominator;
        
        require(nativeAmountOut > 0, "Insufficient output amount");
        require(nativeAmountOut < reserveNative, "Insufficient liquidity");
        
        // Transfer LXON from user
        lxonToken.safeTransferFrom(msg.sender, address(this), lxonAmount);
        
        // Update reserves
        reserveLXON += lxonAmount;
        reserveNative -= nativeAmountOut;
        
        // Transfer native tokens to user
        payable(msg.sender).transfer(nativeAmountOut);
        
        emit Swap(msg.sender, lxonAmount, nativeAmountOut, true);
    }

    /**
     * @dev Swap native tokens for LXON
     */
    function swapNativeForLXON() external payable nonReentrant {
        uint256 nativeAmountIn = msg.value;
        require(nativeAmountIn > 0, "Amount must be > 0");
        require(reserveLXON > 0 && reserveNative > 0, "No liquidity");
        
        // Calculate output amount using constant product formula
        uint256 amountInWithFee = nativeAmountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveLXON;
        uint256 denominator = (reserveNative * FEE_DENOMINATOR) + amountInWithFee;
        uint256 lxonAmountOut = numerator / denominator;
        
        require(lxonAmountOut > 0, "Insufficient output amount");
        require(lxonAmountOut < reserveLXON, "Insufficient liquidity");
        
        // Update reserves
        reserveNative += nativeAmountIn;
        reserveLXON -= lxonAmountOut;
        
        // Transfer LXON to user
        lxonToken.safeTransfer(msg.sender, lxonAmountOut);
        
        emit Swap(msg.sender, nativeAmountIn, lxonAmountOut, false);
    }

    /**
     * @dev Get quote for LXON to native swap
     */
    function getLXONToNativeQuote(uint256 lxonAmount) external view returns (uint256) {
        if (reserveLXON == 0 || reserveNative == 0) return 0;
        
        uint256 amountInWithFee = lxonAmount * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveNative;
        uint256 denominator = (reserveLXON * FEE_DENOMINATOR) + amountInWithFee;
        return numerator / denominator;
    }

    /**
     * @dev Get quote for native to LXON swap
     */
    function getNativeToLXONQuote(uint256 nativeAmount) external view returns (uint256) {
        if (reserveLXON == 0 || reserveNative == 0) return 0;
        
        uint256 amountInWithFee = nativeAmount * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveLXON;
        uint256 denominator = (reserveNative * FEE_DENOMINATOR) + amountInWithFee;
        return numerator / denominator;
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Get current reserves
     */
    function getReserves() external view returns (uint256 _reserveLXON, uint256 _reserveNative) {
        return (reserveLXON, reserveNative);
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 lxonBalance = lxonToken.balanceOf(address(this));
        uint256 nativeBalance = address(this).balance;
        
        if (lxonBalance > 0) {
            lxonToken.safeTransfer(owner(), lxonBalance);
        }
        
        if (nativeBalance > 0) {
            payable(owner()).transfer(nativeBalance);
        }
        
        reserveLXON = 0;
        reserveNative = 0;
    }

    receive() external payable {}
}
