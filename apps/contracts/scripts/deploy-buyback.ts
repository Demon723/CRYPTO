import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔥 Deploying Buyback and Burn Mechanism to Sepolia Testnet...\n');

  // Load existing deployment
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Sepolia deployment file not found. Please deploy LXON token first.');
    process.exit(1);
  }

  const deploymentAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  if (!deploymentAddresses.lxonToken) {
    console.error('❌ LXON token address not found in deployment file.');
    process.exit(1);
  }

  console.log('📋 Existing Deployment:');
  console.log('  LXON Token:', deploymentAddresses.lxonToken);
  console.log();

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');
  console.log();

  // Phase 1: Deploy a simple test ERC20 token as base token (mock USDC)
  console.log('📦 Phase 1: Deploying Test Base Token (Mock USDC)...');
  const TestBaseToken = await ethers.getContractFactory('ERC20Mock');
  const baseToken = await TestBaseToken.deploy('Test USDC', 'USDC', 18);
  await baseToken.waitForDeployment();
  const baseTokenAddress = await baseToken.getAddress();
  console.log('✅ Base Token deployed to:', baseTokenAddress);
  console.log();

  // Phase 2: Mint base tokens to treasury (deployer)
  console.log('💰 Phase 2: Minting Base Tokens to Treasury...');
  const mintAmount = ethers.parseUnits('1000000', 18); // 1M USDC
  const mintTx = await baseToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log('✅ Minted 1,000,000 USDC to treasury (deployer)');
  const treasuryBalance = await baseToken.balanceOf(deployer.address);
  console.log('  Treasury Balance:', ethers.formatUnits(treasuryBalance, 18), 'USDC');
  console.log();

  // Phase 3: Deploy Buyback and Burn contract
  console.log('🔥 Phase 3: Deploying Buyback and Burn Contract...');
  const LXONBuybackBurn = await ethers.getContractFactory('LXONBuybackBurn');
  
  const buybackThreshold = ethers.parseUnits('0.01', 18); // 0.01 USD equivalent
  const buybackPercentage = 10; // 10% of treasury per buyback
  
  const buyback = await LXONBuybackBurn.deploy(
    deploymentAddresses.lxonToken,
    baseTokenAddress,
    deployer.address, // Use deployer as treasury for now
    buybackThreshold,
    buybackPercentage
  );
  await buyback.waitForDeployment();
  const buybackAddress = await buyback.getAddress();
  deploymentAddresses.buybackBurn = buybackAddress;
  deploymentAddresses.baseToken = baseTokenAddress;
  deploymentAddresses.treasury = deployer.address;
  
  console.log('✅ Buyback and Burn deployed to:', buybackAddress);
  console.log();

  // Phase 4: Configure Buyback
  console.log('⚙️  Phase 4: Configuring Buyback Parameters...');
  
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
  console.log('  Buyback Threshold:', ethers.formatUnits(threshold, 18), 'USD');
  console.log('  Buyback Percentage:', percentage.toString(), '%');
  console.log('  Buyback Enabled:', enabled);
  console.log('  Treasury:', treasury);
  console.log('  Base Token:', baseTokenAddress);
  console.log();

  // Phase 5: Approve base token spending
  console.log('💰 Phase 5: Approving Base Token Spending...');
  await baseToken.approve(buybackAddress, ethers.MaxUint256);
  console.log('✅ Approved unlimited spending for buyback contract');
  console.log();

  // Save updated deployment addresses
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('💾 Updated deployment addresses saved to:', deploymentPath);
  console.log();

  // Print summary
  console.log('📋 Deployment Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LXON Token:', deploymentAddresses.lxonToken);
  console.log('Base Token (Mock USDC):', baseTokenAddress);
  console.log('Buyback and Burn:', buybackAddress);
  console.log('Treasury:', deployer.address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  console.log('🌟 Buyback Mechanism Deployed:');
  console.log('  ✅ Buyback threshold: 0.01 USD');
  console.log('  ✅ Buyback percentage: 10% of treasury');
  console.log('  ✅ Buyback enabled: true');
  console.log('  ✅ Treasury funded with 1M USDC');
  console.log();

  console.log('⚠️  Important Notes:');
  console.log('  1. This uses a mock USDC token for testing');
  console.log('  2. For production, use real USDC or WETH');
  console.log('  3. Treasury should be a multi-sig wallet in production');
  console.log('  4. Buyback requires DEX integration for actual swaps');
  console.log('  5. Current implementation requires manual LXON transfers');

  console.log('\n🔗 Network: Sepolia Testnet (Chain ID: 11155111)');
  console.log(`  LXON Token: https://sepolia.etherscan.io/address/${deploymentAddresses.lxonToken}`);
  console.log(`  Buyback: https://sepolia.etherscan.io/address/${buybackAddress}`);
  console.log(`  Base Token: https://sepolia.etherscan.io/address/${baseTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
