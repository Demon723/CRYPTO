import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('⚠️  MAINNET DEPLOYMENT WARNING ⚠️');
  console.log('You are about to deploy to Ethereum Mainnet.');
  console.log('This involves real money and cannot be undone.');
  console.log();
  
  // Safety checks
  const [deployer] = await ethers.getSigners();
  console.log('🔍 Pre-deployment Safety Checks:');
  console.log('  Deployer Address:', deployer.address);
  console.log('  Network:', (await ethers.provider.getNetwork()).name);
  console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('  Account Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');
  console.log();
  
  // Verify this is mainnet
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1n) {
    console.error('❌ ERROR: Not connected to Ethereum Mainnet (Chain ID: 1)');
    console.error('Current Chain ID:', network.chainId.toString());
    process.exit(1);
  }
  
  // Check minimum balance
  const balance = await deployer.provider.getBalance(deployer.address);
  const minBalance = ethers.parseEther('0.5'); // Minimum 0.5 ETH for gas
  if (balance < minBalance) {
    console.error('❌ ERROR: Insufficient ETH balance for deployment');
    console.error('Required:', ethers.formatEther(minBalance), 'ETH');
    console.error('Current:', ethers.formatEther(balance), 'ETH');
    process.exit(1);
  }
  
  console.log('✅ Safety checks passed');
  console.log();
  
  console.log('🚀 Deploying Enhanced LXON Ecosystem to Ethereum Mainnet...\n');

  const deploymentAddresses: any = {};

  // Phase 1: Deploy LXON Native Token
  console.log('📦 Phase 1: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(deployer.address);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  deploymentAddresses.lxonToken = lxonAddress;
  console.log('✅ LXON Native Token deployed to:', lxonAddress);
  console.log('🔗 Etherscan:', `https://etherscan.io/address/${lxonAddress}`);
  console.log();

  // Phase 2: Deploy Real USDC (or use existing)
  console.log('💰 Phase 2: Base Token Setup...');
  console.log('⚠️  For mainnet, you should use real USDC or WETH');
  console.log('⚠️  Deploying mock USDC for testing purposes only');
  console.log('⚠️  REPLACE WITH REAL USDC ADDRESS FOR PRODUCTION');
  
  const TestBaseToken = await ethers.getContractFactory('ERC20Mock');
  const baseToken = await TestBaseToken.deploy('USD Coin', 'USDC', 6);
  await baseToken.waitForDeployment();
  const baseTokenAddress = await baseToken.getAddress();
  deploymentAddresses.baseToken = baseTokenAddress;
  console.log('⚠️  Mock USDC deployed to:', baseTokenAddress);
  console.log('🔗 Etherscan:', `https://etherscan.io/address/${baseTokenAddress}`);
  console.log();

  // Phase 3: Set up Treasury (use multi-sig for production)
  console.log('🏛️  Phase 3: Treasury Setup...');
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log('⚠️  Treasury Address:', treasuryAddress);
  console.log('⚠️  For production, use a multi-sig wallet (Gnosis Safe)');
  console.log('⚠️  Current treasury is deployer address - NOT SECURE FOR PRODUCTION');
  console.log();

  // Phase 4: Deploy Buyback and Burn
  console.log('🔥 Phase 4: Deploying Buyback and Burn Contract...');
  const LXONBuybackBurn = await ethers.getContractFactory('LXONBuybackBurn');
  
  const buybackThreshold = ethers.parseUnits('0.01', 6); // 0.01 USD (USDC has 6 decimals)
  const buybackPercentage = 10; // 10% of treasury per buyback
  
  const buyback = await LXONBuybackBurn.deploy(
    lxonAddress,
    baseTokenAddress,
    treasuryAddress,
    buybackThreshold,
    buybackPercentage
  );
  await buyback.waitForDeployment();
  const buybackAddress = await buyback.getAddress();
  deploymentAddresses.buybackBurn = buybackAddress;
  deploymentAddresses.treasury = treasuryAddress;
  
  console.log('✅ Buyback and Burn deployed to:', buybackAddress);
  console.log('🔗 Etherscan:', `https://etherscan.io/address/${buybackAddress}`);
  console.log();

  // Phase 5: Configure Buyback
  console.log('⚙️  Phase 5: Configuring Buyback Parameters...');
  
  // Enable buyback
  await buyback.toggleBuyback(true);
  console.log('✅ Buyback enabled');
  
  // Verify configuration
  const threshold = await buyback.buybackThreshold();
  const percentage = await buyback.buybackPercentage();
  const enabled = await buyback.buybackEnabled();
  const treasury = await buyback.treasury();
  
  console.log();
  console.log('📊 Buyback Configuration:');
  console.log('  Buyback Threshold:', ethers.formatUnits(threshold, 6), 'USD');
  console.log('  Buyback Percentage:', percentage.toString(), '%');
  console.log('  Buyback Enabled:', enabled);
  console.log('  Treasury:', treasury);
  console.log('  Base Token:', baseTokenAddress);
  console.log();

  // Save deployment addresses
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'mainnet.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('💾 Deployment addresses saved to:', deploymentPath);
  console.log();

  // Print summary
  console.log('📋 Mainnet Deployment Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LXON Token:', lxonAddress);
  console.log('Base Token (Mock USDC):', baseTokenAddress);
  console.log('Buyback and Burn:', buybackAddress);
  console.log('Treasury:', treasuryAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  console.log('🌟 Tokenomics Deployed to Mainnet:');
  console.log('  ✅ Reduced daily emission (5,000 tokens/day)');
  console.log('  ✅ Transaction burn fee (1%)');
  console.log('  ✅ Tiered staking rewards (4 tiers)');
  console.log('  ✅ Buyback and burn mechanism');
  console.log();

  console.log('⚠️  CRITICAL POST-DEPLOYMENT TASKS:');
  console.log('  1. Replace mock USDC with real USDC or WETH');
  console.log('  2. Set up proper multi-sig treasury (Gnosis Safe)');
  console.log('  3. Fund treasury with sufficient USDC/ETH for buyback');
  console.log('  4. Verify contracts on Etherscan');
  console.log('  5. Test with small amounts first');
  console.log('  6. Monitor gas costs and optimize if needed');
  console.log('  7. Set up monitoring and alerts');
  console.log();

  console.log('🔗 Network: Ethereum Mainnet (Chain ID: 1)');
  console.log(`  LXON Token: https://etherscan.io/address/${lxonAddress}`);
  console.log(`  Buyback: https://etherscan.io/address/${buybackAddress}`);
  console.log(`  Base Token: https://etherscan.io/address/${baseTokenAddress}`);
  console.log();

  console.log('⚠️  SECURITY REMINDERS:');
  console.log('  - Never share your private key');
  console.log('  - Use hardware wallet for large operations');
  console.log('  - Enable multi-sig for treasury operations');
  console.log('  - Monitor contract activity');
  console.log('  - Have emergency plans ready');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
