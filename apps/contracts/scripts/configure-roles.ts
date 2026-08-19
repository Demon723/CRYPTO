import { ethers } from 'hardhat';

async function main() {
  console.log('Configuring roles for LXON ecosystem...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Configuring with account:', deployer.address);

  // Get contract addresses from environment variables
  const lxonDecentralizedAddress = process.env.LXON_DECENTRALIZED_ADDRESS;
  const lxonDAOAddress = process.env.LXON_DAO_ADDRESS;

  if (!lxonDecentralizedAddress) {
    throw new Error('LXON_DECENTRALIZED_ADDRESS environment variable not set');
  }

  if (!lxonDAOAddress) {
    throw new Error('LXON_DAO_ADDRESS environment variable not set');
  }

  console.log('LXONDecentralized address:', lxonDecentralizedAddress);
  console.log('LXONDAO address:', lxonDAOAddress, '\n');

  // Get contract instances
  const lxonDecentralized = await ethers.getContractAt('LXONDecentralized', lxonDecentralizedAddress);
  const lxonDAO = await ethers.getContractAt('LXONDAO', lxonDAOAddress);

  // Get role hashes
  const GOVERNANCE_ROLE = await lxonDecentralized.GOVERNANCE_ROLE();
  const EMITTER_ROLE = await lxonDecentralized.EMITTER_ROLE();
  const PAUSER_ROLE = await lxonDecentralized.PAUSER_ROLE();
  const MINTER_ROLE = await lxonDecentralized.MINTER_ROLE();
  const TECHNICAL_COUNCIL_ROLE = await lxonDecentralized.TECHNICAL_COUNCIL_ROLE();
  const EMERGENCY_ROLE = await lxonDecentralized.EMERGENCY_ROLE();

  // Configure emergency multisig address (from environment)
  const emergencyMultisig = process.env.EMERGENCY_MULTISIG_ADDRESS || deployer.address;

  console.log('Configuring roles...\n');

  // Grant GOVERNANCE_ROLE to DAO
  console.log('Granting GOVERNANCE_ROLE to DAO...');
  await lxonDecentralized.grantRole(GOVERNANCE_ROLE, lxonDAOAddress);
  console.log('✓ GOVERNANCE_ROLE granted to DAO');

  // Grant EMITTER_ROLE to DAO
  console.log('Granting EMITTER_ROLE to DAO...');
  await lxonDecentralized.grantRole(EMITTER_ROLE, lxonDAOAddress);
  console.log('✓ EMITTER_ROLE granted to DAO');

  // Grant PAUSER_ROLE to emergency multisig
  console.log('Granting PAUSER_ROLE to emergency multisig...');
  await lxonDecentralized.grantRole(PAUSER_ROLE, emergencyMultisig);
  console.log('✓ PAUSER_ROLE granted to emergency multisig');

  // Grant MINTER_ROLE to DAO (for emission)
  console.log('Granting MINTER_ROLE to DAO...');
  await lxonDecentralized.grantRole(MINTER_ROLE, lxonDAOAddress);
  console.log('✓ MINTER_ROLE granted to DAO');

  // Grant EMERGENCY_ROLE to emergency multisig
  console.log('Granting EMERGENCY_ROLE to emergency multisig...');
  await lxonDecentralized.grantRole(EMERGENCY_ROLE, emergencyMultisig);
  console.log('✓ EMERGENCY_ROLE granted to emergency multisig');

  console.log('\nRole configuration complete!');

  // Verify roles
  console.log('\nVerifying roles...');
  const hasGovernance = await lxonDecentralized.hasRole(GOVERNANCE_ROLE, lxonDAOAddress);
  const hasEmitter = await lxonDecentralized.hasRole(EMITTER_ROLE, lxonDAOAddress);
  const hasPauser = await lxonDecentralized.hasRole(PAUSER_ROLE, emergencyMultisig);
  const hasMinter = await lxonDecentralized.hasRole(MINTER_ROLE, lxonDAOAddress);
  const hasEmergency = await lxonDecentralized.hasRole(EMERGENCY_ROLE, emergencyMultisig);

  console.log('DAO has GOVERNANCE_ROLE:', hasGovernance);
  console.log('DAO has EMITTER_ROLE:', hasEmitter);
  console.log('Emergency multisig has PAUSER_ROLE:', hasPauser);
  console.log('DAO has MINTER_ROLE:', hasMinter);
  console.log('Emergency multisig has EMERGENCY_ROLE:', hasEmergency);

  console.log('\n✓ All roles configured successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
