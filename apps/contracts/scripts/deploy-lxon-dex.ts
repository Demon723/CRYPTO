import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXONAMM (Native DEX) contract...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy LXONAMM
  console.log('Deploying LXONAMM...');
  const LXONAMM = await ethers.getContractFactory('LXONAMM');
  const lxonAMM = await LXONAMM.deploy();
  await lxonAMM.waitForDeployment();
  const lxonAMMAddress = await lxonAMM.getAddress();
  console.log('LXONAMM deployed to:', lxonAMMAddress, '\n');

  // Verify deployment
  console.log('Verifying deployment...');
  const owner = await lxonAMM.owner();
  const feeRate = await lxonAMM.feeRate();
  const factory = await lxonAMM.factory();

  console.log('Owner:', owner);
  console.log('Fee rate:', feeRate.toString());
  console.log('Factory address:', factory);

  // Save deployment info
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contract: {
      LXONAMM: lxonAMMAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log('\nDeployment summary:');
  console.log(JSON.stringify(deployment, null, 2));

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
