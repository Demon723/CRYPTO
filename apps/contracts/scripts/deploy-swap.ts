import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying SimpleSwap AMM...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  try {
    // Deploy SimpleSwap contract
    const SimpleSwapFactory = await ethers.getContractFactory('SimpleSwap');
    
    // Use the deployed LXON token address
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    const feeRecipient = deployer.address;
    
    const swap = await SimpleSwapFactory.deploy(lxonTokenAddress, feeRecipient);
    await swap.waitForDeployment();
    const swapAddress = await swap.getAddress();
    
    console.log('SimpleSwap deployed to:', swapAddress);

    // Get AMM info
    const tokenAddress = await swap.lxonToken();
    const feeRecipientAddress = await swap.feeRecipient();
    const feeRate = await swap.FEE_RATE();
    const feeDenominator = await swap.FEE_DENOMINATOR();
    
    console.log('\nAMM Details:');
    console.log('LXON Token:', tokenAddress);
    console.log('Fee Recipient:', feeRecipientAddress);
    console.log('Fee Rate:', feeRate.toString(), '/', feeDenominator.toString());

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
    console.log('\n✅ SimpleSwap AMM deployment successful!');
    console.log('\nNext steps:');
    console.log('1. Add liquidity to the pool');
    console.log('2. Test swap functionality');
    console.log('3. Set up trading interface');

  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
