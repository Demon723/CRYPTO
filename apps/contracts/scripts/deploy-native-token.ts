import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying LXON Native Token with Multi-Sig Governance...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Multi-sig wallet address (replace with actual deployed multi-sig address)
  const multiSigAddress = process.env.MULTI_SIG_ADDRESS || ethers.ZeroAddress;
  console.log('Multi-sig wallet address:', multiSigAddress);

  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const token = await LXONNativeToken.deploy(multiSigAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log('LXONNativeToken deployed to:', tokenAddress);

  // Verify multi-sig integration
  const contractMultiSig = await token.multiSigWallet();
  const multiSigEnabled = await token.multiSigEnabled();
  
  console.log('Contract multi-sig wallet:', contractMultiSig);
  console.log('Multi-sig enabled:', multiSigEnabled);

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      LXONNativeToken: tokenAddress,
      MultiSigWallet: multiSigAddress,
    },
    multiSigEnabled: multiSigEnabled,
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-native-token.json`, JSON.stringify(deployment, null, 2));

  console.log('\nDeployment info saved to deployments/');
  console.log('Multi-sig governance integration:', multiSigEnabled ? 'ENABLED' : 'DISABLED');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Native token deployment failed:', error);
    process.exit(1);
  });
