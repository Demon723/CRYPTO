# Helios Key Integration Guide

> **The Helios coin is not just an NFT. It is a physical access credential.**

This guide is for developers, event organizers, and dApp builders who want to use the Helios coin as a cryptographic key.

---

## 1. The Key Model

A wallet is a **valid key** if and only if:

1. It **owns** a Helios token
2. The token is **ACTIVE** (not INACTIVE, not FROZEN, not DEACTIVATED)
3. The token is **bound** to that wallet via a physical chip tap

This means:
- You cannot buy a Helios coin on OpenSea and immediately use it as a key. You must physically tap the coin to bind it.
- If the founders freeze or deactivate the coin, the key stops working instantly.
- If you sell the coin, the binding is cleared. The new owner must rebind.

---

## 2. Checking If a Wallet Has a Valid Key

### Solidity (On-Chain)

```solidity
import "./HeliosPBTv2.sol";

contract MyEventGate {
    HeliosPBTv2 public helios;

    constructor(address _helios) {
        helios = HeliosPBTv2(_helios);
    }

    function enterEvent(address attendee) external returns (bool) {
        (bool valid, uint256 tokenId) = helios.isKeyValid(attendee);
        require(valid, "You need an active Helios coin to enter");

        // Record that they used their key for this event
        helios.useKey(keccak256(abi.encodePacked("EVENT_001", block.timestamp)));

        // Grant access
        return true;
    }
}
```

### JavaScript / Ethers.js (Off-Chain)

```javascript
const helios = new ethers.Contract(HELIOS_ADDRESS, HELIOS_ABI, provider);

async function checkKey(walletAddress) {
    const [valid, tokenId] = await helios.isKeyValid(walletAddress);
    if (valid) {
        console.log(`Wallet holds Helios key: token #${tokenId}`);
        return true;
    } else {
        console.log("No valid Helios key found");
        return false;
    }
}

// Batch check (for airdrop eligibility, whitelist, etc.)
async function batchCheck(wallets) {
    const [validArray, tokenIds] = await helios.batchIsKeyValid(wallets);
    return wallets.map((addr, i) => ({
        wallet: addr,
        valid: validArray[i],
        tokenId: tokenIds[i].toString()
    }));
}
```

---

## 3. The User Flow: Tap to Bind

```
User receives physical Helios coin in mail
         │
         ▼
User opens Helios mobile app (or web app)
         │
         ▼
User taps coin to phone NFC reader
         │
         ▼
Chip generates signature: keccak256("BIND" || tokenId || wallet || nonce || chainId)
         │
         ▼
App calls helios.bindWallet(tokenId, wallet, nonce, chipSignature)
         │
         ▼
Contract verifies chip signature → binds wallet → emits WalletBound()
         │
         ▼
User now has a valid key. isKeyValid(wallet) returns true.
```

---

## 4. Founder Controls (For Helios Team)

### Activate a Token
```solidity
helios.activate(tokenId);
// Moves: INACTIVE → ACTIVE
// Use after: shipping confirmation, KYC, manual review
```

### Freeze a Token
```solidity
helios.freeze(tokenId, "Dispute investigation");
// Moves: ACTIVE → FROZEN
// Effect: Cannot transfer, cannot bind, key is invalid
// Use for: suspected theft, chargeback, regulatory hold
```

### Unfreeze a Token
```solidity
helios.unfreeze(tokenId);
// Moves: FROZEN → ACTIVE
```

### Deactivate a Token
```solidity
helios.deactivate(tokenId, "Confirmed counterfeit");
// Moves: ANY → DEACTIVATED (IRREVERSIBLE)
// Effect: Permanently dead. Cannot transfer, cannot bind, key destroyed.
// Wallet binding is cleared automatically.
// Use for: fraud, lost/stolen with no recovery, regulatory seizure
```

---

## 5. Security Considerations

| Threat | Mitigation |
|--------|-----------|
| Stolen coin used as key | Founders can freeze instantly. Key stops working on-chain. |
| Sold coin still works as key | Binding auto-clears on transfer. New owner must rebind. |
| Counterfeit coin | Deactivation destroys the token's utility permanently. |
| Replay attack | Unique nonce per signature. Consumed permanently. |
| Front-running | Signature includes intended wallet and chainId. |

---

## 6. Example: Discord Bot Integration

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');

const helios = new ethers.Contract(HELIOS_ADDRESS, HELIOS_ABI, provider);

client.on('interactionCreate', async interaction => {
    if (interaction.commandName === 'verify') {
        const wallet = interaction.options.getString('wallet');
        const [valid, tokenId] = await helios.isKeyValid(wallet);

        if (valid) {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await member.roles.add('HELIOS_HOLDER_ROLE');
            await interaction.reply(`✅ Verified Helios Key: Token #${tokenId}`);
        } else {
            await interaction.reply('❌ No active Helios key found. Tap your coin to bind.');
        }
    }
});
```

---

## 7. Contract Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Mainnet | HeliosPBTv3 | `TBD` |
| Mainnet | HeliosChipRegistry | `TBD` |

---

*For smart contract details, see the full README and source code in `/src`.*
