// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LXONBuybackBurn
 * @dev Contract for automated buyback and burn mechanism to create deflationary pressure
 * Uses treasury funds to buy back LXON tokens and burn them permanently
 */
contract LXONBuybackBurn is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable lxonToken;
    IERC20 public immutable baseToken; // Token used for buyback (e.g., USDC, ETH)
    
    uint256 public buybackThreshold; // Minimum price to trigger buyback
    uint256 public buybackPercentage; // Percentage of treasury to use per buyback
    uint256 public totalBuybackAmount;
    uint256 public totalBurnedAmount;
    
    bool public buybackEnabled;
    uint256 public constant PERCENTAGE_DENOMINATOR = 100;
    uint256 public constant PRICE_DENOMINATOR = 1e18;
    
    address public treasury;
    
    event BuybackExecuted(uint256 baseTokenAmount, uint256 lxonAmount, uint256 timestamp);
    event TokensBurned(uint256 amount, uint256 timestamp);
    event BuybackThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event BuybackPercentageUpdated(uint256 oldPercentage, uint256 newPercentage);
    event BuybackToggled(bool enabled);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    
    /**
     * @dev Constructor to initialize the buyback contract
     * @param _lxonToken Address of the LXON token
     * @param _baseToken Address of the base token used for buyback (e.g., USDC)
     * @param _treasury Address of the treasury holding base tokens
     * @param _buybackThreshold Initial price threshold for buyback
     * @param _buybackPercentage Percentage of treasury to use per buyback
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
     * @dev Execute buyback and burn
     * @param baseTokenAmount Amount of base tokens to use for buyback
     * @param minLXONAmount Minimum LXON tokens to receive (slippage protection)
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
     * @dev Burn LXON tokens directly (manual burn)
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
     * @dev Set buyback threshold
     * @param newThreshold New price threshold
     */
    function setBuybackThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        uint256 oldThreshold = buybackThreshold;
        buybackThreshold = newThreshold;
        emit BuybackThresholdUpdated(oldThreshold, newThreshold);
    }
    
    /**
     * @dev Set buyback percentage
     * @param newPercentage New percentage (max 50%)
     */
    function setBuybackPercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 50, "Percentage too high (max 50%)");
        uint256 oldPercentage = buybackPercentage;
        buybackPercentage = newPercentage;
        emit BuybackPercentageUpdated(oldPercentage, newPercentage);
    }
    
    /**
     * @dev Toggle buyback mechanism
     * @param enabled Whether to enable buyback
     */
    function toggleBuyback(bool enabled) external onlyOwner {
        buybackEnabled = enabled;
        emit BuybackToggled(enabled);
    }
    
    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @dev Withdraw base tokens from contract (emergency)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function withdrawBaseToken(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        baseToken.safeTransfer(to, amount);
    }
    
    /**
     * @dev Withdraw LXON tokens from contract (emergency)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function withdrawLXONToken(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        lxonToken.safeTransfer(to, amount);
    }
    
    /**
     * @dev Get contract statistics
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
