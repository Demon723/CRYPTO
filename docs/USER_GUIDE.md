# LXON Tokenomics User Guide

## Overview

LXON is a native blockchain token with enhanced tokenomics designed for long-term value appreciation through deflationary mechanisms and incentivized staking.

## Key Features

### 1. Reduced Emission Schedule
- **Initial Daily Emission:** 5,000 LXON (64% reduction from original 13,800)
- **Emission Decline Rate:** 100 LXON per day
- **Emission Duration:** 10 years (3,650 days)
- **Purpose:** Create scarcity and drive price appreciation over time

### 2. Transaction Burn Fee
- **Burn Rate:** 1% on all token transfers
- **Mechanism:** Automatically burns 1% of transferred tokens
- **Purpose:** Deflationary pressure to reduce total supply over time
- **Example:** Transferring 1,000 LXON burns 10 LXON, recipient receives 990 LXON

### 3. Tiered Staking Rewards
Users can stake LXON tokens in different tiers with varying lock periods and reward rates:

| Tier | Lock Period | Annual Reward | Multiplier |
|------|-------------|---------------|------------|
| Tier 1 | 30 days | 5% | 1x |
| Tier 2 | 90 days | 8% | 1.5x |
| Tier 3 | 180 days | 12% | 2x |
| Tier 4 | 365 days | 18% | 3x |

**Benefits:**
- Higher tiers offer better reward rates
- Multipliers enhance reward calculations
- Lock periods ensure token stability
- Flexible unstaking options

### 4. Buyback and Burn Mechanism
- **Purpose:** Use treasury funds to buy back LXON tokens and burn them
- **Trigger:** When token price falls below threshold
- **Percentage:** Uses up to 10% of treasury per buyback
- **Effect:** Additional deflationary pressure

## How to Use LXON

### Basic Transfers

```solidity
// Transfer LXON tokens (1% burn fee applies)
function transfer(address to, uint256 amount) external;
```

**Example:**
- Send 1,000 LXON to friend
- 10 LXON burned automatically
- Friend receives 990 LXON

### Staking LXON

```solidity
// Stake with specific tier
function stakeWithTier(uint256 amount, uint8 tier) external;

// Upgrade staking tier
function upgradeStakingTier(uint8 newTier) external;

// Unstake tokens
function unstake(uint256 amount) external;
```

**Staking Example:**
```javascript
// Stake 1,000 LXON with Tier 2 (90 days, 8% reward)
await lxonToken.stakeWithTier(ethers.parseEther('1000'), 2);

// After lock period, unstake
await lxonToken.unstake(ethers.parseEther('1000'));
```

### Approving Spending

```solidity
// Approve another address to spend your tokens
function approve(address spender, uint256 amount) external;

// Transfer from approved spender
function transferFrom(address from, address to, uint256 amount) external;
```

## Tokenomics Mechanics

### Emission Calculation

The daily emission decreases over time:

```
Day 1: 5,000 LXON
Day 2: 4,900 LXON
Day 3: 4,800 LXON
...
Day 50: 0 LXON (emission ends)
```

### Burn Fee Calculation

For any transfer:
```
Burn Amount = (Transfer Amount × 10) / 1000
Received Amount = Transfer Amount - Burn Amount
```

### Staking Rewards

Rewards are calculated based on:
- Staked amount
- Tier reward rate
- Tier multiplier
- Time staked

```
Annual Reward = Staked Amount × (Reward Rate / 100) × Multiplier
```

## Best Practices

### For Holders
1. **Long-term holding:** Benefit from emission reduction and burn fee
2. **Strategic staking:** Choose tier based on your timeline
3. **Monitor metrics:** Use monitoring tools to track tokenomics

### For Traders
1. **Account for burn fee:** Include 1% loss in transfer calculations
2. **Timing considerations:** Consider staking during holding periods
3. **Supply monitoring:** Watch total supply changes from burns

### For Stakers
1. **Tier selection:** Match lock period to your investment horizon
2. **Reward optimization:** Higher tiers for longer commitments
3. **Unstaking planning:** Plan around lock period expiration

## Monitoring Tools

### Tokenomics Monitor Script

Run the monitoring script to check current metrics:

```bash
# Local network
npx hardhat run scripts/monitor-tokenomics.ts --network hardhat

# Sepolia testnet
npx hardhat run scripts/monitor-tokenomics.ts --network sepolia

# LXON mainnet
npx hardhat run scripts/monitor-tokenomics.ts --network lxonMainnet
```

### Key Metrics to Track

- **Total Supply:** Current circulating supply
- **Total Burned:** Cumulative tokens burned
- **Total Staked:** Amount locked in staking
- **Daily Emission:** Current emission rate
- **Buyback Activity:** Treasury buyback executions

## Security Considerations

### Contract Security
- Multi-sig governance for critical changes
- Emergency pause mechanisms
- Reentrancy protection
- Access control for sensitive functions

### User Security
- Never share private keys
- Use hardware wallets for large holdings
- Verify contract addresses before transactions
- Monitor for suspicious contract activity

### Best Practices
- Start with small test transactions
- Verify all parameters before executing
- Keep records of important transactions
- Use reputable wallets and interfaces

## FAQ

### Q: Why is there a 1% burn fee?
A: The burn fee creates deflationary pressure, reducing total supply over time and potentially increasing token value.

### Q: Can I avoid the burn fee?
A: No, the burn fee applies to all transfers by design to ensure consistent deflationary pressure.

### Q: What happens if I unstake before the lock period?
A: You cannot unstake before the lock period expires. The contract enforces lock periods.

### Q: Can I upgrade my staking tier?
A: Yes, you can upgrade to a higher tier, which will extend your lock period accordingly.

### Q: How is the buyback mechanism triggered?
A: The buyback is triggered manually by the treasury when the token price falls below the configured threshold.

### Q: What happens to burned tokens?
A: Burned tokens are permanently removed from circulation, reducing the total supply.

### Q: Can the emission parameters be changed?
A: Emission parameters are set as constants in the contract and cannot be changed after deployment.

### Q: How do I check my staking rewards?
A: Staking rewards are calculated automatically and can be claimed when you unstake your tokens.

## Support and Resources

### Documentation
- Contract documentation: `contracts/LXONNativeToken.sol`
- Deployment guides: `DEPLOYMENT_SUMMARY.md`
- Setup guides: `MAINNET_SETUP_GUIDE.md`

### Scripts
- Deployment: `scripts/deploy-*.ts`
- Testing: `scripts/test-*.ts`
- Monitoring: `scripts/monitor-tokenomics.ts`
- Verification: `scripts/verify-*.ts`

### Community
- GitHub: https://github.com/Demon723/LXON
- Documentation: `docs/` directory

## Getting Started

1. **Get LXON tokens** through minting or purchase
2. **Choose your strategy**: hold, stake, or trade
3. **Monitor tokenomics** using the monitoring script
4. **Optimize rewards** through strategic staking
5. **Stay informed** about protocol updates

## Disclaimer

This guide is for informational purposes only. Cryptocurrency investments carry risks. Always do your own research and consult with financial advisors before making investment decisions.

---

**Last Updated:** August 26, 2026
**Version:** 1.0
