# Helios Premium Cardholder Guide

> **Your physical coin is now a bank, a key, and an identity.**

This guide is for owners of **Genesis** and **Supernova** tier Helios coins — the premium tier that includes the full "American Express" experience.

---

## What Makes Premium Different

| Feature | Standard (Solar/Main Sequence/Red Giant) | Premium (Genesis/Supernova) |
|---------|------------------------------------------|----------------------------|
| Physical coin | Yes | Yes |
| On-chain generative art | Yes | Yes |
| Tap-to-evolve | Yes | Yes |
| NFT-as-key (event access) | Yes | Yes |
| **Unique card number** | **No** | **Yes** |
| **Registered cardholder** | **No** | **Yes** |
| **Hardware wallet (TBA)** | **No** | **Yes** |
| **Tap-to-pay / transact** | **No** | **Yes** |

---

## Your Card Number

Every premium coin has a unique card number engraved on the acrylic surface:

```
┌─────────────────────────────┐
│      HELIOS PREMIUM         │
│                             │
│   H-3746-8291-0547-2        │  ← Your card number
│                             │
│   REGISTERED TO:            │
│   [Name hash on-chain]      │
│                             │
│   TBA: 0x71C...9A3E         │  ← Your smart contract wallet
│                             │
└─────────────────────────────┘
```

**Format:** `H-XXXX-XXXX-XXXX-X`
- `H` = Helios
- First 4 digits = Tier prefix + series
- Next 4 digits = Token ID
- Next 4 digits = Unique salt
- Last digit = Luhn checksum

This number is registered on-chain and linked to your identity hash. It cannot be duplicated or transferred to another coin.

---

## Your Hardware Wallet (TBA)

Every premium coin has an **ERC-6551 Token Bound Account** — a smart contract wallet that lives on-chain and is owned by your NFT.

### What is a TBA?

A Token Bound Account is like a bank account that is attached to your NFT. It can:
- Hold ETH
- Hold ERC-20 tokens (USDC, USDT, etc.)
- Hold other NFTs
- Execute transactions

### How to Fund Your TBA

```solidity
// Send ETH directly to your TBA address
// Or use the Helios app:
helios.depositToTBA{value: 1 ether}(tokenId);
```

### How to Check Your Balance

```javascript
const tbaAddress = await helios.getTBA(tokenId);
const balance = await provider.getBalance(tbaAddress);
console.log(`Your coin holds ${ethers.formatEther(balance)} ETH`);
```

---

## Tap to Pay

This is the core innovation. Your physical coin **is** your hardware wallet.

### The Flow

```
You want to pay Merchant 0.1 ETH
         │
         ▼
Open Helios app → Enter amount + recipient
         │
         ▼
Tap your physical coin to phone NFC
         │
         ▼
Chip signs authorization message
         │
         ▼
App submits tapToPay() to blockchain
         │
         ▼
Contract verifies chip signature
         │
         ▼
TBA sends 0.1 ETH to merchant
         │
         ▼
Done. You paid with a tap.
```

### What the Chip Signs

```
keccak256("PAY" || tokenId || to || value || dataHash || nonce || chainId)
```

Without the physical coin, the transaction cannot execute. Even if someone steals your phone, they cannot spend from your TBA without the chip.

### Code Example

```javascript
// 1. Build the payment
const tokenId = 1;
const to = "0xMerchantAddress...";
const value = ethers.parseEther("0.1");
const data = "0x"; // Empty for ETH transfer
const nonce = Date.now();

// 2. Chip signs (happens on physical coin via NFC)
const message = ethers.solidityPackedKeccak256(
  ["string", "uint256", "address", "uint256", "bytes32", "uint256", "uint256"],
  ["PAY", tokenId, to, value, ethers.keccak256(data), nonce, (await provider.getNetwork()).chainId]
);
const chipSignature = await chip.signMessage(ethers.getBytes(message));

// 3. Submit
const tx = await helios.tapToPay(tokenId, to, value, data, nonce, chipSignature);
await tx.wait();
console.log("Paid with a tap!");
```

---

## Security Model

| Threat | Protection |
|--------|-----------|
| **Phone stolen** | Thief cannot spend without physical coin |
| **Coin stolen** | Founder can freeze instantly; TBA locked |
| **Lost coin** | Founder can deactivate; TBA funds recoverable via social recovery (future) |
| **Counterfeit coin** | Deactivation destroys card number and TBA utility |
| **Replay attack** | Unique nonce per transaction |
| **Front-running** | Signature includes recipient + chainId |

---

## Transferring a Premium Coin

When you sell or gift your premium coin:

1. **Unbind your wallet** (requires chip tap)
2. **Transfer with proof** (requires chip tap)
3. **New owner taps to bind** their wallet
4. **New owner taps to re-register** as cardholder (founder must approve KYC)

The TBA stays with the token. The card number stays with the token. The identity changes.

---

## Founder Controls (What They Can and Cannot Do)

| Action | Founder Can | Founder Cannot |
|--------|-------------|----------------|
| Activate your coin | Yes | — |
| Freeze your coin | Yes (with reason) | Spend your TBA funds |
| Deactivate your coin | Yes (with reason) | Steal your TBA funds |
| Register cardholder | Yes (KYC required) | Forge your signature |
| View card number | Yes (public) | View your private keys |

---

*For technical integration details, see INTEGRATION_GUIDE.md.*
*For standard tier features, see README.md.*
