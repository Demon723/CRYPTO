import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying SimpleSwap AMM to Production...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  try {
    // Deploy SimpleSwap contract
    const SimpleSwapFactory = await ethers.getContractFactory('SimpleSwap');
    
    // Use the deployed LXON token address from production
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    const feeRecipient = deployer.address;
    
    console.log('Deploying SimpleSwap with LXON token:', lxonTokenAddress);
    console.log('Fee recipient:', feeRecipient);
    
    const swap = await SimpleSwapFactory.deploy(lxonTokenAddress, feeRecipient);
    console.log('Transaction hash:', swap.deploymentTransaction()?.hash);
    console.log('Waiting for deployment...');
    
    await swap.waitForDeployment();
    const swapAddress = await swap.getAddress();
    
    console.log('✅ SimpleSwap deployed to:', swapAddress);

    // Get AMM info
    const tokenAddress = await swap.lxonToken();
    const feeRecipientAddress = await swap.feeRecipient();
    const feeRate = await swap.FEE_RATE();
    const feeDenominator = await swap.FEE_DENOMINATOR();
    
    console.log('\n=== AMM Details ===');
    console.log('LXON Token:', tokenAddress);
    console.log('Fee Recipient:', feeRecipientAddress);
    console.log('Fee Rate:', feeRate.toString(), '/', feeDenominator.toString(), '(0.3%)');

    const network = await ethers.provider.getNetwork();
    const fs = require('fs');
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      contracts: {
        LXON: lxonTokenAddress,
        SimpleSwap: swapAddress,
      },
      ammDetails: {
        lxonToken: tokenAddress,
        feeRecipient: feeRecipientAddress,
        feeRate: feeRate.toString(),
        feeDenominator: feeDenominator.toString(),
      },
      deployedAt: new Date().toISOString(),
    };

    const dir = './deployments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${Number(network.chainId)}-swap.json`, JSON.stringify(deploymentInfo, null, 2));

    console.log('\nDeployment info saved to deployments/');
    console.log('\n=== Next Steps ===');
    console.log('1. Add liquidity to enable trading:');
    console.log('   npx hardhat run scripts/add-liquidity.ts --network lxon');
    console.log('2. Test swap functionality:');
    console.log('   npx hardhat run scripts/test-swap.ts --network lxon');
    console.log('3. Set up trading interface for users');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
