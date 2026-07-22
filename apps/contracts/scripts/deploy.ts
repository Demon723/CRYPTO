import { ethers } from 'hardhat';
import { ContractFactory } from 'ethers';
import { LXON } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

async function main() {
  console.log('Deploying Synex Contracts...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const LXONFactory: ContractFactory = await ethers.getContractFactory('LXON');
  const lxon: LXON = await LXONFactory.deploy();
  await lxon.waitForDeployment();
  const lxonAddress = await lxon.getAddress();
  console.log('LXON token deployed to:', lxonAddress);

  const stakingFactory = await ethers.getContractFactory('SynexStaking');
  const staking = await stakingFactory.deploy(lxonAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log('Staking contract deployed to:', stakingAddress);

  const governanceFactory = await ethers.getContractFactory('SynexGovernance');
  const governance = await governanceFactory.deploy(lxonAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log('Governance contract deployed to:', governanceAddress);

  console.log('\n=== Deployment Summary ===');
  console.log('LXON Token:', lxonAddress);
  console.log('Staking:', stakingAddress);
  console.log('Governance:', governanceAddress);
  console.log('Deployer:', deployer.address);

  const fs = require('fs');
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      LXON: lxonAddress,
      Staking: stakingAddress,
      Governance: governanceAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${(await ethers.provider.getNetwork()).chainId}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\nDeployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
