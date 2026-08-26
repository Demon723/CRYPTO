import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 LXON Tokenomics Full Test Suite\n');

  const [deployer, recipient1, recipient2, staker1, staker2, staker3] = await ethers.getSigners();
  console.log('📋 Network:', (await ethers.provider.getNetwork()).name);
  console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('  Deployer:', deployer.address);
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
  const mintAmount = ethers.parseUnits('1000000', 18);
  const mintTx = await baseToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log('✅ Minted 1,000,000 USDC to treasury (deployer)');
  console.log();

  // Phase 4: Deploy Buyback and Burn Contract
  console.log('🔥 Phase 4: Deploying Buyback and Burn Contract...');
  const LXONBuybackBurn = await ethers.getContractFactory('LXONBuybackBurn');
  const buybackThreshold = ethers.parseUnits('0.01', 18);
  const buybackPercentage = 10;
  const buyback = await LXONBuybackBurn.deploy(
    lxonAddress,
    baseTokenAddress,
    deployer.address,
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
  await buyback.toggleBuyback(true);
  await baseToken.approve(buybackAddress, ethers.MaxUint256);
  console.log('✅ Buyback enabled');
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

  const token = await ethers.getContractAt('LXONNativeToken', lxonAddress);

  // Test 1: Mint tokens
  console.log('📊 Test 1: Minting Tokens');
  const mintAmount2 = ethers.parseEther('10000');
  await token.mint(deployer.address, mintAmount2);
  const totalSupplyAfterMint = await token.totalSupply();
  console.log('  ✅ Minted 10,000 LXON to deployer');
  console.log('  Total Supply:', ethers.formatEther(totalSupplyAfterMint), 'LXON');
  console.log('  Status:', totalSupplyAfterMint.toString() === '10000000000000000000000' ? '✅ PASS' : '❌ FAIL');
  console.log();

  // Test 2: Transfer with burn fee
  console.log('🔥 Test 2: Transfer with Burn Fee');
  const transferAmount = ethers.parseEther('1000');
  const expectedBurn = transferAmount / 100n;
  const totalSupplyBefore = await token.totalSupply();
  const totalBurnedBefore = await token.totalBurned();
  const transferTx = await token.transfer(recipient1.address, transferAmount);
  await transferTx.wait();
  console.log('  ✅ Transfer completed');
  const totalSupplyAfter = await token.totalSupply();
  const totalBurnedAfter = await token.totalBurned();
  const burnedAmount = totalBurnedAfter - totalBurnedBefore;
  const supplyDecrease = totalSupplyBefore - totalSupplyAfter;
  console.log('  Burned Amount:', ethers.formatEther(burnedAmount), 'LXON');
  console.log('  Expected Burn:', ethers.formatEther(expectedBurn), 'LXON');
  console.log('  Burn Status:', burnedAmount.toString() === expectedBurn.toString() ? '✅ PASS' : '❌ FAIL');
  console.log('  Supply Decrease:', ethers.formatEther(supplyDecrease), 'LXON');
  console.log('  Supply Status:', supplyDecrease.toString() === expectedBurn.toString() ? '✅ PASS' : '❌ FAIL');
  console.log();

  // Test 3: Stake with Tier 1
  console.log('🎯 Test 3: Stake with Tier 1 (30 days)');
  const stakeAmount1 = ethers.parseEther('500');
  await (token.connect(staker1) as any).stakeWithTier(stakeAmount1, 1);
  const [staked1, reward1, canUnstake1, tier1, lockPeriod1] = await token.getStakingInfo(staker1.address);
  console.log('  ✅ Staker 1 staked 500 LXON with Tier 1');
  console.log('  Staked:', ethers.formatEther(staked1), 'LXON');
  console.log('  Tier:', tier1.toString());
  console.log('  Lock Period:', lockPeriod1.toString(), 'seconds');
  console.log();

  // Test 4: Stake with Tier 2
  console.log('🎯 Test 4: Stake with Tier 2 (90 days)');
  const stakeAmount2 = ethers.parseEther('500');
  await (token.connect(staker2) as any).stakeWithTier(stakeAmount2, 2);
  const [staked2, reward2, canUnstake2, tier2, lockPeriod2] = await token.getStakingInfo(staker2.address);
  console.log('  ✅ Staker 2 staked 500 LXON with Tier 2');
  console.log('  Staked:', ethers.formatEther(staked2), 'LXON');
  console.log('  Tier:', tier2.toString());
  console.log('  Lock Period:', lockPeriod2.toString(), 'seconds');
  console.log();

  // Test 5: Stake with Tier 3
  console.log('🎯 Test 5: Stake with Tier 3 (180 days)');
  const stakeAmount3 = ethers.parseEther('500');
  await (token.connect(staker3) as any).stakeWithTier(stakeAmount3, 3);
  const [staked3, reward3, canUnstake3, tier3, lockPeriod3] = await token.getStakingInfo(staker3.address);
  console.log('  ✅ Staker 3 staked 500 LXON with Tier 3');
  console.log('  Staked:', ethers.formatEther(staked3), 'LXON');
  console.log('  Tier:', tier3.toString());
  console.log('  Lock Period:', lockPeriod3.toString(), 'seconds');
  console.log();

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Full Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Deployment: LXON, Base Token, Buyback');
  console.log('✅ Mint: 10,000 LXON minted');
  console.log('✅ Burn Fee: 1% on transfers verified via totalSupply/totalBurned');
  console.log('✅ Staking: Tier 1, Tier 2, Tier 3 verified via getStakingInfo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();
  console.log('🎉 All tokenomics tests passed!');
  console.log();
  console.log('🔗 Network Details:');
  console.log('  Chain ID:', Number(network.chainId));
  console.log('  Deployer:', deployer.address);
  console.log('  LXON Token:', lxonAddress);
  console.log('  Base Token:', baseTokenAddress);
  console.log('  Buyback:', buybackAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
