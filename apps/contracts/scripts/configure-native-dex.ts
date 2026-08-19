import { ethers } from 'hardhat';

async function main() {
  console.log('=== Configuring LXON Native DEX ===\n');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Configuring with account:', owner.address);

  try {
    // Get deployed contract addresses
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-native-ecosystem.json`;
    
    if (!fs.existsSync(deploymentFile)) {
      console.error('Native ecosystem deployment file not found');
      console.log('Please deploy native ecosystem first');
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const tokenAddress = deploymentInfo.contracts.LXONNativeToken;
    const swapAddress = deploymentInfo.contracts.LXONSwap;
    const dexAddress = process.env.DEX_ADDRESS || deploymentInfo.contracts.LXONNativeDEX;

    if (!dexAddress) {
      console.error('DEX contract address not found');
      console.log('Please set DEX_ADDRESS environment variable');
      process.exit(1);
    }

    console.log('Token Address:', tokenAddress);
    console.log('Swap Address:', swapAddress);
    console.log('DEX Address:', dexAddress);

    // Get contract instances
    const token = await ethers.getContractAt('LXONNativeToken', tokenAddress, owner);
    const swap = await ethers.getContractAt('LXONSwap', swapAddress, owner);
    const dex = await ethers.getContractAt('LXONNativeDEX', dexAddress, owner);

    // Step 1: Configure DEX parameters
    console.log('\n1. Configuring DEX parameters...');
    const feeRate = 30; // 0.3% fee
    const feeDenominator = 10000;

    await dex.setFeeRate(feeRate);
    console.log('✅ Fee rate configured:', feeRate / feeDenominator * 100, '%');

    // Step 2: Add liquidity pools
    console.log('\n2. Adding liquidity pools...');
    
    // Approve tokens for DEX
    const liquidityAmount = ethers.parseEther('100000'); // 100K XON
    await token.approve(dexAddress, liquidityAmount);
    console.log('✅ Approved', ethers.formatEther(liquidityAmount), 'XON for DEX');

    // Add native/XON pool
    const nativeAmount = ethers.parseEther('10000'); // 10K native tokens
    await dex.addLiquidity(tokenAddress, liquidityAmount, { value: nativeAmount });
    console.log('✅ Added liquidity to native/XON pool');
    console.log('   Native:', ethers.formatEther(nativeAmount));
    console.log('   XON:', ethers.formatEther(liquidityAmount));

    // Step 3: Configure trading pairs
    console.log('\n3. Configuring trading pairs...');
    await dex.addTradingPair(tokenAddress, true); // Enable trading
    console.log('✅ Enabled XON trading pair');

    // Step 4: Set fee recipient
    console.log('\n4. Setting fee recipient...');
    const feeRecipient = process.env.FEE_RECIPIENT || owner.address;
    await dex.setFeeRecipient(feeRecipient);
    console.log('✅ Fee recipient set to:', feeRecipient);

    // Step 5: Configure swap integration
    console.log('\n5. Configuring swap integration...');
    await swap.setDEX(dexAddress);
    console.log('✅ Swap contract linked to DEX');

    // Save configuration
    const config = {
      network: network.name,
      chainId: Number(network.chainId),
      configuredBy: owner.address,
      contracts: {
        LXONNativeToken: tokenAddress,
        LXONSwap: swapAddress,
        LXONNativeDEX: dexAddress,
      },
      dex: {
        feeRate: feeRate,
        feeDenominator: feeDenominator,
        feePercentage: feeRate / feeDenominator * 100,
        feeRecipient: feeRecipient,
        liquidity: {
          native: ethers.formatEther(nativeAmount),
          token: ethers.formatEther(liquidityAmount),
        },
      },
      configuredAt: new Date().toISOString(),
    };

    const dir = './deployments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${Number(network.chainId)}-dex-config.json`, JSON.stringify(config, null, 2));

    console.log('\n=== ✅ DEX Configuration Complete ===');
    console.log('Configuration saved to deployments/');

  } catch (error) {
    console.error('❌ DEX configuration failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
