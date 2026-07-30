import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const LXONFactory = await ethers.getContractFactory('LXON');
  const lxon = await LXONFactory.deploy();
  await lxon.waitForDeployment();
  const lxonAddress = await lxon.getAddress();
  console.log('LXON token deployed to:', lxonAddress);

  const network = await ethers.provider.getNetwork();
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      LXON: lxonAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/${Number(network.chainId)}.json`, JSON.stringify(deploymentInfo, null, 2));

  console.log('\nDeployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
