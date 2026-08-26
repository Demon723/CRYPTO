import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('📊 LXON Tokenomics Monitor\n');

  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId.toString());
  console.log();

  // Load deployment addresses based on network
  let deploymentPath: string;
  if (network.chainId === 11155111n) {
    deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia.json');
  } else if (network.chainId === 31337n) {
    deploymentPath = path.join(__dirname, '..', 'deployments', '31337.json');
  } else if (network.chainId === 723n) {
    deploymentPath = path.join(__dirname, '..', 'deployments', 'lxon-mainnet.json');
  } else {
    console.error('❌ Unsupported network');
    process.exit(1);
  }

  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment file not found for this network');
    process.exit(1);
  }

  const deploymentAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { lxonToken, buybackBurn } = deploymentAddresses;

  console.log('📋 Contract Addresses:');
  console.log('  LXON Token:', lxonToken);
  if (buybackBurn) {
    console.log('  Buyback Contract:', buybackBurn);
  }
  console.log();

  const token = await ethers.getContractAt('LXONNativeToken', lxonToken);

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TOKENOMICS METRICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Emission Metrics
    console.log('\n📈 EMISSION METRICS:');
    try {
      const totalEmitted = await (token as any).totalEmitted();
      const currentDailyEmission = await (token as any).currentDailyEmission();
      const emissionStartTime = await (token as any).emissionStartTime();
      
      console.log('  Total Emitted:', ethers.formatEther(totalEmitted), 'LXON');
      console.log('  Current Daily Emission:', ethers.formatEther(currentDailyEmission), 'LXON');
      console.log('  Emission Start Time:', new Date(Number(emissionStartTime) * 1000).toLocaleString());
      
      const daysSinceStart = Math.floor((Date.now() / 1000 - Number(emissionStartTime)) / (24 * 60 * 60));
      console.log('  Days Since Emission Start:', daysSinceStart);
    } catch (e) {
      console.log('  ⚠️  Emission metrics not available');
    }

    // Supply Metrics
    console.log('\n💰 SUPPLY METRICS:');
    try {
      const totalSupply = await token.totalSupply();
      const maxSupply = await (token as any).MAX_SUPPLY();
      const totalBurned = await (token as any).totalBurned();
      
      console.log('  Total Supply:', ethers.formatEther(totalSupply), 'LXON');
      console.log('  Max Supply:', ethers.formatEther(maxSupply), 'LXON');
      console.log('  Total Burned:', ethers.formatEther(totalBurned), 'LXON');
      console.log('  Supply Percentage:', (Number(totalSupply) / Number(maxSupply) * 100).toFixed(2), '%');
      console.log('  Burn Percentage:', (Number(totalBurned) / Number(maxSupply) * 100).toFixed(4), '%');
    } catch (e) {
      console.log('  ⚠️  Supply metrics not available');
    }

    // Staking Metrics
    console.log('\n🎯 STAKING METRICS:');
    try {
      const totalStaked = await (token as any).totalStaked();
      console.log('  Total Staked:', ethers.formatEther(totalStaked), 'LXON');
      
      const [deployer] = await ethers.getSigners();
      const stakedBalance = await (token as any).stakedBalance(deployer.address);
      const stakingTier = await (token as any).stakingTier(deployer.address);
      
      console.log('  Your Staked Balance:', ethers.formatEther(stakedBalance), 'LXON');
      console.log('  Your Staking Tier:', stakingTier.toString());
    } catch (e) {
      console.log('  ⚠️  Staking metrics not available');
    }

    // Burn Fee Configuration
    console.log('\n🔥 BURN FEE CONFIGURATION:');
    console.log('  Burn Fee: 1% (10/1000)');
    console.log('  Status: Active on all transfers');

    // Tiered Staking Configuration
    console.log('\n🎯 TIERED STAKING CONFIGURATION:');
    console.log('  Tier 1: 30 days, 5% annual, 1x multiplier');
    console.log('  Tier 2: 90 days, 8% annual, 1.5x multiplier');
    console.log('  Tier 3: 180 days, 12% annual, 2x multiplier');
    console.log('  Tier 4: 365 days, 18% annual, 3x multiplier');

    // Buyback Metrics (if available)
    if (buybackBurn) {
      console.log('\n💸 BUYBACK METRICS:');
      try {
        const buyback = await ethers.getContractAt('LXONBuybackBurn', buybackBurn);
        const stats = await (buyback as any).getStats();
        
        console.log('  Total Buyback Amount:', ethers.formatEther(stats[0]), 'Base Tokens');
        console.log('  Total Burned Amount:', ethers.formatEther(stats[1]), 'LXON');
        console.log('  Buyback Threshold:', ethers.formatEther(stats[2]), 'USD');
        console.log('  Buyback Percentage:', stats[3].toString(), '%');
        console.log('  Buyback Enabled:', stats[4]);
        console.log('  Treasury Balance:', ethers.formatEther(stats[5]), 'Base Tokens');
        console.log('  Contract LXON Balance:', ethers.formatEther(stats[6]), 'LXON');
      } catch (e) {
        console.log('  ⚠️  Buyback metrics not available');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MONITORING COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Tips:');
    console.log('  - Run this script regularly to track tokenomics');
    console.log('  - Monitor emission decline over time');
    console.log('  - Track burn accumulation from transfers');
    console.log('  - Watch staking participation growth');
    console.log('  - Check buyback execution frequency');

  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
