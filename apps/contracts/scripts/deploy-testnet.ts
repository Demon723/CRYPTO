import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying Enhanced LXON Ecosystem to Sepolia Testnet...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  const deploymentAddresses: any = {};

  // Phase 1: Deploy LXON Native Token
  console.log('\n📦 Phase 1: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(deployer.address);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  deploymentAddresses.lxonToken = lxonAddress;
  console.log('✅ LXON Native Token deployed to:', lxonAddress);

  // Phase 2: Deploy Governance (skipped - requires TimelockController)
  console.log('\n🏛️  Phase 2: Governance deployment skipped (requires TimelockController)');

  // Phase 3: Deploy Native DEX (skipped - requires additional parameters)
  console.log('\n� Phase 3: DEX deployment skipped (requires additional parameters)');

  // Phase 4: Deploy Buyback and Burn (skipped - requires base token)
  console.log('\n🔥 Phase 4: Buyback deployment skipped (requires base token)');

  // Save deployment addresses
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('\n💾 Deployment addresses saved to:', deploymentPath);

  // Print summary
  console.log('\n📋 Deployment Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LXON Native Token:', lxonAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🌟 Tokenomics Deployed:');
  console.log('  ✅ Reduced daily emission (5,000 tokens/day)');
  console.log('  ✅ Transaction burn fee (1%)');
  console.log('  ✅ Tiered staking rewards (4 tiers)');

  console.log('\n⚠️  Note: Additional contracts (Governance, DEX, Buyback) require separate deployment with proper parameters');

  console.log('\n🔗 Network: Sepolia Testnet (Chain ID: 11155111)');
  console.log(`  https://sepolia.etherscan.io/address/${lxonAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
