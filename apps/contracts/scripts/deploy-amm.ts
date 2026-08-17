import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON AMM...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  try {
    // Deploy AMM contract
    const AMMFactory = await ethers.getContractFactory('LXONAMM');
    const feeTo = deployer.address; // Fee recipient
    const lxonTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Local deployment
    
    const amm = await AMMFactory.deploy(feeTo, lxonTokenAddress);
    await amm.waitForDeployment();
    const ammAddress = await amm.getAddress();
    console.log('LXON AMM deployed to:', ammAddress);

    // Get AMM info
    const feeToAddress = await amm.feeTo();
    const tokenAddress = await amm.lxonToken();

    console.log('\nAMM Details:');
    console.log('Fee To:', feeToAddress);
    console.log('LXON Token:', tokenAddress);
    console.log('Minimum Liquidity:', ethers.formatEther(await amm.MINIMUM_LIQUIDITY()));
    console.log('Fee Rate:', (await amm.FEE_RATE()).toString(), '/', (await amm.FEE_DENOMINATOR()).toString());

    const network = await ethers.provider.getNetwork();
    const fs = require('fs');
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      contracts: {
        LXON: lxonTokenAddress,
        LXONAMM: ammAddress,
      },
      ammDetails: {
        feeTo: feeToAddress,
        lxonToken: tokenAddress,
      },
      deployedAt: new Date().toISOString(),
    };

    const dir = './deployments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${Number(network.chainId)}-amm.json`, JSON.stringify(deploymentInfo, null, 2));

    console.log('\nDeployment info saved to deployments/');
    console.log('\n✅ LXON AMM deployment successful!');

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
