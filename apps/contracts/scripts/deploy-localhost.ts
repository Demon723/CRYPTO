import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying LXON Tokenomics to Localhost...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📋 Deployment Information:');
  console.log('  Network:', (await ethers.provider.getNetwork()).name);
  console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('  Deployer Address:', deployer.address);
  console.log('  Account Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');
  console.log();

  const deploymentAddresses: any = {};

  // Phase 1: Deploy LXON Native Token
  console.log('📦 Phase 1: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(deployer.address);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  deploymentAddresses.lxonToken = lxonAddress;
  console.log('✅ LXON Native Token deployed to:', lxonAddress);
  console.log();

  // Phase 2: Deploy Base Token (Mock USDC for testing)
  console.log('💰 Phase 2: Deploying Base Token (Mock USDC)...');
  const TestBaseToken = await ethers.getContractFactory('ERC20Mock');
  const baseToken = await TestBaseToken.deploy('USD Coin', 'USDC', 18);
  await baseToken.waitForDeployment();
  const baseTokenAddress = await baseToken.getAddress();
  deploymentAddresses.baseToken = baseTokenAddress;
  console.log('✅ Base Token deployed to:', baseTokenAddress);
  console.log();

  // Phase 3: Mint base tokens to treasury
  console.log('💰 Phase 3: Minting Base Tokens to Treasury...');
  const mintAmount = ethers.parseUnits('1000000', 18); // 1M USDC
  const mintTx = await baseToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  const treasuryBalance = await baseToken.balanceOf(deployer.address);
  console.log('✅ Minted 1,000,000 USDC to treasury (deployer)');
  console.log('  Treasury Balance:', ethers.formatUnits(treasuryBalance, 18), 'USDC');
  console.log();

  // Phase 4: Deploy Buyback and Burn Contract
  console.log('🔥 Phase 4: Deploying Buyback and Burn Contract...');
  const LXONBuybackBurn = await ethers.getContractFactory('LXONBuybackBurn');
  
  const buybackThreshold = ethers.parseUnits('0.01', 18); // 0.01 USD equivalent
  const buybackPercentage = 10; // 10% of treasury per buyback
  
  const buyback = await LXONBuybackBurn.deploy(
    lxonAddress,
    baseTokenAddress,
    deployer.address, // Use deployer as treasury for now
    buybackThreshold,
    buybackPercentage
  );
  await buyback.waitForDeployment();
  const buybackAddress = await buyback.getAddress();
  deploymentAddresses.buybackBurn = buybackAddress;
  deploymentAddresses.treasury = deployer.address;
  
  console.log('✅ Buyback and Burn deployed to:', buybackAddress);
  console.log();

  // Phase 5: Configure Buyback
  console.log('⚙️  Phase 5: Configuring Buyback Parameters...');
  
  // Enable buyback
  await buyback.toggleBuyback(true);
  console.log('✅ Buyback enabled');
  
  // Approve base token spending
  await baseToken.approve(buybackAddress, ethers.MaxUint256);
  console.log('✅ Approved unlimited spending for buyback contract');
  
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

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${Number(network.chainId)}.json`);
  deploymentAddresses.network = network.name;
  deploymentAddresses.chainId = Number(network.chainId);
  deploymentAddresses.deployer = deployer.address;
  deploymentAddresses.deployedAt = new Date().toISOString();
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('💾 Deployment addresses saved to:', deploymentPath);
  console.log();

  // Print summary
  console.log('📋 Deployment Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LXON Token:', lxonAddress);
  console.log('Base Token (Mock USDC):', baseTokenAddress);
  console.log('Buyback and Burn:', buybackAddress);
  console.log('Treasury:', deployer.address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  console.log('🌟 Tokenomics Deployed:');
  console.log('  ✅ Reduced daily emission (5,000 tokens/day)');
  console.log('  ✅ Transaction burn fee (1%)');
  console.log('  ✅ Tiered staking rewards (4 tiers)');
  console.log('  ✅ Buyback and burn mechanism');
  console.log();

  console.log('🔗 Network Details:');
  console.log('  Chain ID:', Number(network.chainId));
  console.log('  Deployer:', deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
