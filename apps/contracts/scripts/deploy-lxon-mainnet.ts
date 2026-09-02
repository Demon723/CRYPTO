import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Deploying Enhanced LXON Tokenomics to LXON Mainnet (Chain ID: 723)...\n');

  const [deployer] = await ethers.getSigners();
  
  // Gnosis Safe Multi-Sig Address
  const multiSigAddress = '0x18222bab07224d4Dad6c1295Aa53db3834D9bB90';
  
  console.log('📋 Deployment Information:');
  console.log('  Network:', (await ethers.provider.getNetwork()).name);
  console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('  Deployer Address:', deployer.address);
  console.log('  Multi-Sig Address:', multiSigAddress);
  console.log('  Account Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');
  console.log();

  // Safety check - verify this is LXON network, Sepolia testnet, or Arbitrum Sepolia
  const network = await ethers.provider.getNetwork();
  const validChainIds = [723n, 11155111n, 421614n]; // LXON mainnet, Sepolia testnet, Arbitrum Sepolia
  if (!validChainIds.includes(network.chainId)) {
    console.error('❌ ERROR: Not connected to valid network (LXON Mainnet: 723, Sepolia: 11155111, Arbitrum Sepolia: 421614)');
    console.error('Current Chain ID:', network.chainId.toString());
    process.exit(1);
  }

  const deploymentAddresses: any = {};

  // Phase 1: Deploy LXON Native Token
  console.log('📦 Phase 1: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(multiSigAddress);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  deploymentAddresses.lxonToken = lxonAddress;
  deploymentAddresses.multiSig = multiSigAddress;
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
    multiSigAddress, // Use multi-sig as treasury
    buybackThreshold,
    buybackPercentage
  );
  await buyback.waitForDeployment();
  const buybackAddress = await buyback.getAddress();
  deploymentAddresses.buybackBurn = buybackAddress;
  deploymentAddresses.treasury = multiSigAddress;
  
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
  let networkName;
  if (network.chainId === 723n) {
    networkName = 'lxon-mainnet';
  } else if (network.chainId === 11155111n) {
    networkName = 'sepolia';
  } else if (network.chainId === 421614n) {
    networkName = 'arbitrum-sepolia';
  } else {
    networkName = network.name;
  }
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('💾 Deployment addresses saved to:', deploymentPath);
  console.log();

  // Print summary
  console.log('📋 LXON Mainnet Deployment Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('LXON Token:', lxonAddress);
  console.log('Base Token (Mock USDC):', baseTokenAddress);
  console.log('Buyback and Burn:', buybackAddress);
  console.log('Multi-Sig Treasury:', multiSigAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  console.log('🌟 Tokenomics Deployed to LXON Mainnet:');
  console.log('  ✅ Reduced daily emission (5,000 tokens/day)');
  console.log('  ✅ Transaction burn fee (1%)');
  console.log('  ✅ Tiered staking rewards (4 tiers)');
  console.log('  ✅ Buyback and burn mechanism');
  console.log();

  console.log('⚠️  Post-Deployment Tasks:');
  console.log('  1. Set up proper multi-sig treasury');
  console.log('  2. Replace mock USDC with real base token if needed');
  console.log('  3. Test all tokenomics features');
  console.log('  4. Monitor contract operations');
  console.log();

  console.log('🔗 Network: LXON Mainnet (Chain ID: 723)');
  console.log('  RPC: http://3.110.221.224:8545');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
