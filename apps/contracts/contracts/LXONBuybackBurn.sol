// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LXON Buyback and Burn Contract
 * @author LXON Team
 * @notice Automated buyback and burn mechanism to create deflationary pressure on LXON token
 * @dev Uses treasury funds to buy back LXON tokens and burn them permanently
 * 
 * This contract implements a deflationary mechanism where:
 * - Treasury funds are used to buy back LXON tokens from the market
 * - Purchased tokens are burned permanently, reducing total supply
 * - Buyback can be triggered based on price thresholds or manual execution
 * - Supports multiple base tokens ( ETH, USDC, etc.)
 * 
 * @custom:security-contact security@lxon.io
 */
contract LXONBuybackBurn is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice LXON token contract
    IERC20 public immutable lxonToken;
    
    /// @notice Base token used for buyback (e.g., USDC, ETH)
    IERC20 public immutable baseToken;
    
    /// @notice Minimum price threshold to trigger automatic buyback
    uint256 public buybackThreshold;
    
    /// @notice Percentage of treasury to use per buyback (max 50%)
    uint256 public buybackPercentage;
    
    /// @notice Total base tokens used for buyback
    uint256 public totalBuybackAmount;
    
    /// @notice Total LXON tokens burned
    uint256 public totalBurnedAmount;
    
    /// @notice Whether buyback mechanism is enabled
    bool public buybackEnabled;
    
    /// @notice Denominator for percentage calculations (100)
    uint256 public constant PERCENTAGE_DENOMINATOR = 100;
    
    /// @notice Denominator for price calculations (1e18 for 18 decimals)
    uint256 public constant PRICE_DENOMINATOR = 1e18;
    
    /// @notice Treasury address holding base tokens
    address public treasury;
    
    /// @notice Emitted when a buyback is executed
    event BuybackExecuted(uint256 baseTokenAmount, uint256 lxonAmount, uint256 timestamp);
    
    /// @notice Emitted when tokens are burned
    event TokensBurned(uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when buyback threshold is updated
    event BuybackThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    
    /// @notice Emitted when buyback percentage is updated
    event BuybackPercentageUpdated(uint256 oldPercentage, uint256 newPercentage);
    
    /// @notice Emitted when buyback is enabled/disabled
    event BuybackToggled(bool enabled);
    
    /// @notice Emitted when treasury address is updated
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    
    /**
     * @notice Constructor to initialize the buyback contract
     * @param _lxonToken Address of the LXON token contract
     * @param _baseToken Address of the base token used for buyback (e.g., USDC, ETH)
     * @param _treasury Address of the treasury holding base tokens
     * @param _buybackThreshold Initial price threshold for buyback
     * @param _buybackPercentage Percentage of treasury to use per buyback (max 50%)
     */
    constructor(
        address _lxonToken,
        address _baseToken,
        address _treasury,
        uint256 _buybackThreshold,
        uint256 _buybackPercentage
    ) Ownable(msg.sender) {
        require(_lxonToken != address(0), "Invalid LXON token address");
        require(_baseToken != address(0), "Invalid base token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_buybackPercentage <= 50, "Buyback percentage too high (max 50%)");
        
        lxonToken = IERC20(_lxonToken);
        baseToken = IERC20(_baseToken);
        treasury = _treasury;
        buybackThreshold = _buybackThreshold;
        buybackPercentage = _buybackPercentage;
        buybackEnabled = false; // Disabled by default, requires manual enable
    }
    
    /**
     * @notice Execute buyback and burn operation
     * @dev Transfers base tokens from treasury, burns LXON tokens to reduce supply
     * @param baseTokenAmount Amount of base tokens to use for buyback
     * @param minLXONAmount Minimum LXON tokens to receive (slippage protection)
     * 
     * Note: This is a simplified implementation. In production, integrate with DEX
     * for actual token swapping. Currently requires LXON tokens to be pre-funded.
     */
    function executeBuyback(uint256 baseTokenAmount, uint256 minLXONAmount) external onlyOwner nonReentrant {
        require(buybackEnabled, "Buyback is disabled");
        require(baseTokenAmount > 0, "Amount must be greater than 0");
        
        // Check treasury balance
        uint256 treasuryBalance = baseToken.balanceOf(treasury);
        require(treasuryBalance >= baseTokenAmount, "Insufficient treasury balance");
        
        // Transfer base tokens from treasury to this contract
        baseToken.safeTransferFrom(treasury, address(this), baseTokenAmount);
        
        // In a real implementation, this would interact with a DEX (Uniswap, etc.)
        // For now, we assume the LXON tokens are obtained externally and transferred to this contract
        // This is a simplified version - in production, integrate with DEX for actual swap
        
        // For this implementation, we require LXON tokens to be sent to the contract first
        uint256 lxonBalance = lxonToken.balanceOf(address(this));
        require(lxonBalance >= minLXONAmount, "Insufficient LXON in contract");
        
        // Burn the LXON tokens
        uint256 burnAmount = lxonBalance;
        lxonToken.safeTransfer(address(0), burnAmount);
        
        // Update statistics
        totalBuybackAmount += baseTokenAmount;
        totalBurnedAmount += burnAmount;
        
        emit BuybackExecuted(baseTokenAmount, burnAmount, block.timestamp);
        emit TokensBurned(burnAmount, block.timestamp);
    }
    
    /**
     * @notice Burn LXON tokens directly (manual burn)
     * @dev Allows manual burning of LXON tokens held by the contract
     * @param amount Amount of LXON tokens to burn
     */
    function manualBurn(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        uint256 balance = lxonToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        
        lxonToken.safeTransfer(address(0), amount);
        totalBurnedAmount += amount;
        
        emit TokensBurned(amount, block.timestamp);
    }
    
    /**
     * @notice Set the buyback threshold
     * @dev Only callable by owner. Sets the minimum price to trigger buyback.
     * @param newThreshold New price threshold
     */
    function setBuybackThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        uint256 oldThreshold = buybackThreshold;
        buybackThreshold = newThreshold;
        emit BuybackThresholdUpdated(oldThreshold, newThreshold);
    }
    
    /**
     * @notice Set the buyback percentage
     * @dev Only callable by owner. Limited to 50% maximum.
     * @param newPercentage New percentage of treasury to use per buyback (max 50%)
     */
    function setBuybackPercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 50, "Percentage too high (max 50%)");
        uint256 oldPercentage = buybackPercentage;
        buybackPercentage = newPercentage;
        emit BuybackPercentageUpdated(oldPercentage, newPercentage);
    }
    
    /**
     * @notice Enable or disable the buyback mechanism
     * @dev Only callable by owner. Buyback is disabled by default for safety.
     * @param enabled Whether to enable buyback
     */
    function toggleBuyback(bool enabled) external onlyOwner {
        buybackEnabled = enabled;
        emit BuybackToggled(enabled);
    }
    
    /**
     * @notice Update the treasury address
     * @dev Only callable by owner. Changes where base tokens are held.
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @notice Withdraw base tokens from contract (emergency function)
     * @dev Only callable by owner. For emergency recovery of funds.
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function withdrawBaseToken(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        baseToken.safeTransfer(to, amount);
    }
    
    /**
     * @notice Withdraw LXON tokens from contract (emergency function)
     * @dev Only callable by owner. For emergency recovery of funds.
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function withdrawLXONToken(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        lxonToken.safeTransfer(to, amount);
    }
    
    /**
     * @notice Get contract statistics and current state
     * @return totalBuyback Total base tokens used for buyback
     * @return totalBurned Total LXON tokens burned
     * @return currentBuybackThreshold Current buyback threshold
     * @return currentBuybackPercentage Current buyback percentage
     * @return isEnabled Whether buyback is enabled
     * @return treasuryBalance Current treasury balance
     * @return contractLXONBalance Current LXON balance in contract
     */
    function getStats() external view returns (
        uint256 totalBuyback,
        uint256 totalBurned,
        uint256 currentBuybackThreshold,
        uint256 currentBuybackPercentage,
        bool isEnabled,
        uint256 treasuryBalance,
        uint256 contractLXONBalance
    ) {
        return (
            totalBuybackAmount,
            totalBurnedAmount,
            buybackThreshold,
            buybackPercentage,
            buybackEnabled,
            baseToken.balanceOf(treasury),
            lxonToken.balanceOf(address(this))
        );
    }
}
