import { ethers } from "hardhat";

/**
 * Generate additional wallet addresses for multi-sig setup
 * This script uses Hardhat's built-in wallet generation
 */

async function main() {
  console.log("Generating wallet addresses for multi-sig setup...\n");

  // Method 1: Generate from existing private key (if set in .env)
  const existingPrivateKey = process.env.PRIVATE_KEY;
  
  if (existingPrivateKey) {
    console.log("=== Method 1: Using Existing Private Key ===");
    const existingWallet = new ethers.Wallet(existingPrivateKey);
    console.log("Signer 1 (Existing):", existingWallet.address);
    console.log("Private Key:", existingPrivateKey);
    console.log();
  }

  // Method 2: Generate new random wallets
  console.log("=== Method 2: Generate New Random Wallets ===");
  
  const wallet2 = ethers.Wallet.createRandom();
  const wallet3 = ethers.Wallet.createRandom();
  
  console.log("Signer 2 (New Random):");
  console.log("Address:", wallet2.address);
  console.log("Private Key:", wallet2.privateKey);
  console.log("Mnemonic:", wallet2.mnemonic?.phrase);
  console.log();
  
  console.log("Signer 3 (New Random):");
  console.log("Address:", wallet3.address);
  console.log("Private Key:", wallet3.privateKey);
  console.log("Mnemonic:", wallet3.mnemonic?.phrase);
  console.log();

  // Method 3: Derive from single mnemonic (HD wallets)
  console.log("=== Method 3: Derive from Single Mnemonic (HD Wallet) ===");
  
  const hdWallet = ethers.Wallet.createRandom();
  console.log("Master Mnemonic:", hdWallet.mnemonic?.phrase);
  console.log();
  
  // Derive additional accounts from same mnemonic
  const derivationPath = "m/44'/60'/0'/0";
  const hdWallet2 = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic!.phrase, "", `${derivationPath}/1`);
  const hdWallet3 = ethers.HDNodeWallet.fromPhrase(hdWallet.mnemonic!.phrase, "", `${derivationPath}/2`);
  
  console.log("Signer 1 (HD Account 0):", hdWallet.address);
  console.log("Signer 2 (HD Account 1):", hdWallet2.address);
  console.log("Signer 3 (HD Account 2):", hdWallet3.address);
  console.log();

  // Method 4: Use Hardhat's default accounts
  console.log("=== Method 4: Hardhat Default Accounts ===");
  const accounts = await ethers.getSigners();
  console.log("Number of available accounts:", accounts.length);
  for (let i = 0; i < Math.min(3, accounts.length); i++) {
    console.log(`Account ${i + 1}:`, await accounts[i].getAddress());
  }
  console.log();

  console.log("=== RECOMMENDATION ===");
  console.log("For production deployment, use Method 3 (HD Wallet) or hardware wallets.");
  console.log("For testing, use Method 2 (Random Wallets) or Method 4 (Hardhat Accounts).");
  console.log();
  console.log("⚠️  SECURITY WARNING:");
  console.log("- Never share private keys or mnemonics");
  console.log("- Store them securely (password manager, hardware wallet)");
  console.log("- For production, use hardware wallets (Ledger, Trezor)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
