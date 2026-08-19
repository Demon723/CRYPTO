import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying LXON Bridge...');
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const LXONBridge = await ethers.getContractFactory('LXONBridge');
  const bridge = await LXONBridge.deploy();
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log('LXONBridge deployed to:', bridgeAddress);

  const minConfirmations = 12;
  const transferFeePercentage = 10;
  const maxTransferAmount = ethers.parseEther('1000000');

  await bridge.setMinConfirmations(minConfirmations);
  await bridge.setTransferFeePercentage(transferFeePercentage);
  await bridge.setMaxTransferAmount(maxTransferAmount);

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: { LXONBridge: bridgeAddress },
    config: { minConfirmations, transferFeePercentage, maxTransferAmount: ethers.formatEther(maxTransferAmount) },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-bridge.json`, JSON.stringify(deployment, null, 2));

  console.log('\nDeployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Bridge deployment failed:', error);
    process.exit(1);
  });
