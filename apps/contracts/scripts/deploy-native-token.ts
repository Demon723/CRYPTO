import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying LXON Native Token...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const token = await LXONNativeToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log('LXONNativeToken deployed to:', tokenAddress);

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      LXONNativeToken: tokenAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-native-token.json`, JSON.stringify(deployment, null, 2));

  console.log('\nDeployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Native token deployment failed:', error);
    process.exit(1);
  });
