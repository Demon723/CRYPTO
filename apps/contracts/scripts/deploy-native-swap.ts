import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying LXON Native Swap...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Load deployed native token address
  const fs = require('fs');
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const tokenDeploymentFile = `./deployments/${chainId}-native-token.json`;

  let tokenAddress;
  if (fs.existsSync(tokenDeploymentFile)) {
    const tokenDeployment = JSON.parse(fs.readFileSync(tokenDeploymentFile, 'utf8'));
    tokenAddress = tokenDeployment.contracts.LXONNativeToken;
    console.log('Using existing LXONNativeToken at:', tokenAddress);
  } else {
    console.error('Native token not deployed. Run deploy-native-token.ts first.');
    process.exit(1);
  }

  // Deploy swap
  const LXONSwap = await ethers.getContractFactory('LXONSwap');
  const swap = await LXONSwap.deploy(tokenAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();

  console.log('LXONSwap deployed to:', swapAddress);

  // Save deployment
  const deployment = {
    network: network.name,
    chainId: chainId,
    deployer: deployer.address,
    contracts: {
      LXONSwap: swapAddress,
      LXONNativeToken: tokenAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${chainId}-native-swap.json`, JSON.stringify(deployment, null, 2));

  console.log('\nDeployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Native swap deployment failed:', error);
    process.exit(1);
  });
