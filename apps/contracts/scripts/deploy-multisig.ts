import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Deploying Multi-Sig Wallet...');
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const owners = [deployer.address];
  const confirmationsRequired = 2;

  const MultiSigWallet = await ethers.getContractFactory('MultiSigWallet');
  const multiSig = await MultiSigWallet.deploy(owners, confirmationsRequired);
  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();

  console.log('MultiSigWallet deployed to:', multiSigAddress);
  console.log('Owners:', owners);
  console.log('Confirmations required:', confirmationsRequired);

  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: { MultiSigWallet: multiSigAddress },
    config: { owners, confirmationsRequired },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-multisig.json`, JSON.stringify(deployment, null, 2));

  console.log('\n✅ Multi-Sig Wallet deployed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Multi-Sig deployment failed:', error);
    process.exit(1);
  });
