import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXONVesting contract...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Get LXONDecentralized address from environment or use placeholder
  const lxonTokenAddress = process.env.LXON_TOKEN_ADDRESS;
  if (!lxonTokenAddress) {
    throw new Error('LXON_TOKEN_ADDRESS environment variable not set');
  }

  console.log('LXON Token address:', lxonTokenAddress);

  // Deploy LXONVesting
  console.log('Deploying LXONVesting...');
  const LXONVesting = await ethers.getContractFactory('LXONVesting');
  const lxonVesting = await LXONVesting.deploy(lxonTokenAddress);
  await lxonVesting.waitForDeployment();
  const lxonVestingAddress = await lxonVesting.getAddress();
  console.log('LXONVesting deployed to:', lxonVestingAddress, '\n');

  // Verify deployment
  console.log('Verifying deployment...');
  const token = await lxonVesting.lxonToken();
  const totalTeamAllocation = await lxonVesting.TOTAL_TEAM_ALLOCATION();
  const vestingDuration = await lxonVesting.VESTING_DURATION();
  const cliffDuration = await lxonVesting.CLIFF_DURATION();

  console.log('Token address:', token);
  console.log('Total team allocation:', totalTeamAllocation.toString());
  console.log('Vesting duration:', vestingDuration.toString(), 'seconds');
  console.log('Cliff duration:', cliffDuration.toString(), 'seconds');

  // Save deployment info
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contract: {
      LXONVesting: lxonVestingAddress,
      LXONToken: lxonTokenAddress
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
