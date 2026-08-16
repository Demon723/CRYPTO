import { ethers } from 'hardhat';
import { expect } from 'chai';

async function main() {
  console.log('Starting LXON Decentralized Token deployment...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy LXONDecentralized
  console.log('Deploying LXONDecentralized...');
  const LXONDecentralized = await ethers.getContractFactory('LXONDecentralized');
  const lxonDecentralized = await LXONDecentralized.deploy();
  await lxonDecentralized.waitForDeployment();
  const lxonDecentralizedAddress = await lxonDecentralized.getAddress();
  console.log('LXONDecentralized deployed to:', lxonDecentralizedAddress, '\n');

  // Deploy LXONDAO
  console.log('Deploying LXONDAO...');
  const LXONDAO = await ethers.getContractFactory('LXONDAO');
  const TimelockController = await ethers.getContractFactory('TimelockController');
  
  // Deploy timelock controller
  const timelock = await TimelockController.deploy(
    60 * 60 * 24 * 2, // 2 days delay
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address // admin
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log('TimelockController deployed to:', timelockAddress);

  const lxonDAO = await LXONDAO.deploy(
    lxonDecentralized,
    timelock
  );
  await lxonDAO.waitForDeployment();
  const lxonDAOAddress = await lxonDAO.getAddress();
  console.log('LXONDAO deployed to:', lxonDAOAddress, '\n');

  // Deploy LXONVesting
  console.log('Deploying LXONVesting...');
  const LXONVesting = await ethers.getContractFactory('LXONVesting');
  const lxonVesting = await LXONVesting.deploy(lxonDecentralized);
  await lxonVesting.waitForDeployment();
  const lxonVestingAddress = await lxonVesting.getAddress();
  console.log('LXONVesting deployed to:', lxonVestingAddress, '\n');

  // Configure roles
  console.log('Configuring roles...');
  
  // Grant MINTER_ROLE to deployer
  const MINTER_ROLE = await lxonDecentralized.MINTER_ROLE();
  await lxonDecentralized.grantRole(MINTER_ROLE, deployer.address);
  console.log('MINTER_ROLE granted to deployer');

  // Grant GOVERNANCE_ROLE to DAO
  const GOVERNANCE_ROLE = await lxonDecentralized.GOVERNANCE_ROLE();
  await lxonDecentralized.grantRole(GOVERNANCE_ROLE, lxonDAOAddress);
  console.log('GOVERNANCE_ROLE granted to DAO');

  // Grant PAUSER_ROLE to deployer
  const PAUSER_ROLE = await lxonDecentralized.PAUSER_ROLE();
  await lxonDecentralized.grantRole(PAUSER_ROLE, deployer.address);
  console.log('PAUSER_ROLE granted to deployer');

  // Transfer DEFAULT_ADMIN_ROLE to DAO (after setup is complete)
  // For now, keep with deployer for initial setup
  console.log('DEFAULT_ADMIN_ROLE kept with deployer for initial setup\n');

  // Verify deployment
  console.log('Verifying deployment...');
  const name = await lxonDecentralized.name();
  const symbol = await lxonDecentralized.symbol();
  const maxSupply = await lxonDecentralized.MAX_SUPPLY();
  
  console.log('Token name:', name);
  console.log('Token symbol:', symbol);
  console.log('Max supply:', maxSupply.toString());
  console.log('Total supply:', (await lxonDecentralized.totalSupply()).toString());
  console.log('Initial supply:', '0 (fair launch)\n');

  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      LXONDecentralized: lxonDecentralizedAddress,
      LXONDAO: lxonDAOAddress,
      TimelockController: timelockAddress,
      LXONVesting: lxonVestingAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log('Deployment summary:');
  console.log(JSON.stringify(deployment, null, 2));

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });