# Wallet Address Creation Guide for Multi-Sig Setup

## 🔐 Creating Additional Wallet Addresses

You need 3 total wallet addresses for the 3-signer Gnosis Safe setup:
- **Signer 1:** Your existing wallet address
- **Signer 2:** New wallet address (to be created)
- **Signer 3:** New wallet address (to be created)

---

## 📱 Method 1: MetaMask (Recommended for Software Wallets)

### Creating Additional Accounts in MetaMask

1. **Open MetaMask Extension**
   - Click the MetaMask icon in your browser
   - Unlock your existing wallet

2. **Create New Account**
   - Click the account icon (top right circle)
   - Select "Create Account"
   - Enter account name (e.g., "LXON Signer 2")
   - Click "Create"

3. **Repeat for Third Account**
   - Click the account icon again
   - Select "Create Account"
   - Enter account name (e.g., "LXON Signer 3")
   - Click "Create"

4. **Copy Addresses**
   - Click on each new account
   - Copy the address (starts with 0x...)
   - Save all 3 addresses for Gnosis Safe setup

### Security Best Practices for MetaMask
- Use strong password
- Enable MetaMask's security features
- Write down seed phrases for each account
- Store seed phrases securely (never share)
- Consider using hardware wallet integration

---

## 🔐 Method 2: Hardware Wallet (Recommended for Security)

### Ledger Nano X/S

1. **Install Ledger Live**
   - Download from ledger.com
   - Install and set up device

2. **Create Additional Accounts**
   - Open Ledger Live
   - Go to "Accounts"
   - Click "Add Account"
   - Select Ethereum
   - Follow on-screen instructions
   - Repeat for second additional account

3. **Export Addresses**
   - Each account will have a unique address
   - Copy all 3 addresses for Gnosis Safe setup

### Trezor Model T/One

1. **Install Trezor Suite**
   - Download from trezor.io
   - Connect your Trezor device

2. **Create Additional Accounts**
   - Open Trezor Suite
   - Go to "Accounts"
   - Click "Add new account"
   - Select Ethereum
   - Follow on-screen instructions
   - Repeat for second additional account

3. **Export Addresses**
   - Copy all 3 addresses for Gnosis Safe setup

---

## 🌐 Method 3: Online Wallet Generators (Use with Caution)

### Using MyEtherWallet (MEW)

⚠️ **Warning:** Only use online generators for small amounts or testing. For production, use hardware wallets.

1. **Visit MEW**
   - Go to https://www.myetherwallet.com
   - Click "Create New Wallet"

2. **Generate Wallet**
   - Download keystore file
   - Save private key securely
   - Copy the address

3. **Repeat**
   - Create second wallet
   - Copy the address

---

## 📋 Address Collection Form

Once you have created the additional addresses, provide them here:

**Signer 1 (Your existing wallet):**
- Address: `_____________________`
- Type: [MetaMask/Ledger/Trezor/Other]

**Signer 2 (New wallet):**
- Address: `_____________________`
- Type: [MetaMask/Ledger/Trezor/Other]

**Signer 3 (New wallet):**
- Address: `_____________________`
- Type: [MetaMask/Ledger/Trezor/Other]

---

## 🔒 Security Checklist

**Before Proceeding:**
- [ ] All 3 addresses created
- [ ] Seed phrases written down and stored securely
- [ ] Private keys backed up (if applicable)
- [ ] Hardware wallet PINs set (if applicable)
- [ ] Addresses verified and copied correctly
- [ ] No seed phrases shared with anyone
- [ ] Private keys never entered online (except on secure sites)

**Recommended Setup:**
- **Primary Signer:** Hardware wallet (highest security)
- **Secondary Signer:** MetaMask with strong password
- **Tertiary Signer:** MetaMask or hardware wallet

---

## 💡 Alternative: Use Same Wallet with Multiple Keys

If you prefer not to create separate wallets, you can:

1. **Use Hardware Wallet with Multiple Accounts**
   - Most hardware wallets support multiple accounts
   - Each account has unique address
   - All secured by same device

2. **Use MetaMask with Multiple Accounts**
   - Create multiple accounts in MetaMask
   - All secured by same seed phrase
   - Less secure but simpler

**Note:** This reduces security but is simpler to manage. For maximum security, use separate hardware wallets.

---

## 🚀 Next Steps After Creating Addresses

1. **Provide the 3 addresses** to proceed with Gnosis Safe deployment
2. **Fund each address** with small amount of ETH for gas (0.01 ETH each)
3. **Test each address** by sending a small transaction
4. **Proceed with Gnosis Safe deployment** on Arbitrum mainnet

---

## 📞 Need Help?

If you encounter issues creating wallet addresses:
- Check wallet documentation
- Ensure you're on the correct network (Ethereum mainnet)
- Verify you have enough ETH for gas
- Contact wallet support if needed

---

**Status:** ⏳ **AWAITING WALLET ADDRESS CREATION**

**Last Updated:** August 30, 2026
**Next Step:** Provide 3 wallet addresses for Gnosis Safe setup
