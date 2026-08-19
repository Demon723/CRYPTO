import { ethers } from 'hardhat';
import { LXONDecentralized, LXONDAO, LXONVesting, TimelockController } from '../typechain-types';

async function main() {
  console.log('Starting LXON Governance Setup...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Setting up governance with account:', deployer.address);

  // Get deployed contract addresses from environment or previous deployment
  const lxonDecentralizedAddress = process.env.LXON_DECENTRALIZED_ADDRESS;
  const lxonDAOAddress = process.env.LXON_DAO_ADDRESS;
  const timelockAddress = process.env.TIMELOCK_ADDRESS;
  const lxonVestingAddress = process.env.LXON_VESTING_ADDRESS;

  if (!lxonDecentralizedAddress || !lxonDAOAddress || !timelockAddress || !lxonVestingAddress) {
    throw new Error('Contract addresses not provided in environment variables');
  }

  // Get contract instances
  const lxonDecentralized = await ethers.getContractAt('LXONDecentralized', lxonDecentralizedAddress);
  const lxonDAO = await ethers.getContractAt('LXONDAO', lxonDAOAddress);
  const timelock = await ethers.getContractAt('TimelockController', timelockAddress);
  const lxonVesting = await ethers.getContractAt('LXONVesting', lxonVestingAddress);

  console.log('Contracts loaded successfully\n');

  // Setup technical council
  console.log('Setting up technical council...');
  const councilMembers = [
    process.env.COUNCIL_MEMBER_1 || deployer.address,
    process.env.COUNCIL_MEMBER_2,
    process.env.COUNCIL_MEMBER_3,
    process.env.COUNCIL_MEMBER_4,
    process.env.COUNCIL_MEMBER_5
  ].filter(Boolean);

  for (const member of councilMembers) {
    await lxonDecentralized.addCouncilMember(member);
    console.log('Added council member:', member);
  }

  // Setup emergency admins
  console.log('\nSetting up emergency admins...');
  const emergencyAdmins = [
    process.env.EMERGENCY_ADMIN_1 || deployer.address,
    process.env.EMERGENCY_ADMIN_2
  ].filter(Boolean);

  for (const admin of emergencyAdmins) {
    await lxonDecentralized.addEmergencyAdmin(admin);
    console.log('Added emergency admin:', admin);
  }

  // Configure timelock
  console.log('\nConfiguring timelock controller...');
  const proposers = [lxonDAOAddress, deployer.address];
  const executors = [timelockAddress]; // Only timelock can execute

  // Grant roles to timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();

  for (const proposer of proposers) {
    await timelock.grantRole(PROPOSER_ROLE, proposer);
    console.log('Granted PROPOSER_ROLE to:', proposer);
  }

  for (const executor of executors) {
    await timelock.grantRole(EXECUTOR_ROLE, executor);
    console.log('Granted EXECUTOR_ROLE to:', executor);
  }

  await timelock.grantRole(CANCELLER_ROLE, deployer.address);
  console.log('Granted CANCELLER_ROLE to deployer');

  // Configure DAO timelock
  console.log('\nConfiguring DAO timelock...');
  await lxonDAO.connect(deployer).setTimelock(timelock);
  console.log('DAO timelock configured');

  // Setup team vesting
  console.log('\nSetting up team vesting...');
  const teamMembers = [
    { address: process.env.TEAM_MEMBER_1, allocation: ethers.parseEther('50000000') },
    { address: process.env.TEAM_MEMBER_2, allocation: ethers.parseEther('50000000') },
    { address: process.env.TEAM_MEMBER_3, allocation: ethers.parseEther('50000000') },
    { address: process.env.TEAM_MEMBER_4, allocation: ethers.parseEther('50000000') }
  ].filter(m => m.address);

  for (const member of teamMembers) {
    const startTime = Math.floor(Date.now() / 1000);
    await lxonVesting.addBeneficiary(member.address, member.allocation, startTime);
    console.log('Added team member:', member.address, 'Allocation:', member.allocation.toString());
  }

  // Verify configuration
  console.log('\nVerifying governance configuration...');
  const councilSize = await lxonDecentralized.getCouncilSize();
  console.log('Technical council size:', councilSize.toString());

  const emergencyStatus = await lxonDecentralized.getEmergencyStatus();
  console.log('Emergency active:', emergencyStatus.active);

  const isCouncilMember = await lxonDecentralized.isCouncilMember(deployer.address);
  console.log('Deployer is council member:', isCouncilMember);

  console.log('\nGovernance setup completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });