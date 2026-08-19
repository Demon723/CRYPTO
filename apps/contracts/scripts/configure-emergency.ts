import { ethers } from 'hardhat';

async function main() {
  console.log('Configuring emergency multisig...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Configuring with account:', deployer.address);

  // Get LXONDecentralized address from environment
  const lxonDecentralizedAddress = process.env.LXON_DECENTRALIZED_ADDRESS;
  if (!lxonDecentralizedAddress) {
    throw new Error('LXON_DECENTRALIZED_ADDRESS environment variable not set');
  }

  console.log('LXONDecentralized address:', lxonDecentralizedAddress, '\n');

  // Get contract instance
  const lxonDecentralized = await ethers.getContractAt('LXONDecentralized', lxonDecentralizedAddress);

  // Emergency multisig members (from environment or default)
  const emergencyMembers = process.env.EMERGENCY_MEMBERS 
    ? process.env.EMERGENCY_MEMBERS.split(',') 
    : [
        '0x1234567890123456789012345678901234567890', // Replace with actual addresses
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012',
        '0x4567890123456789012345678901234567890123',
        '0x5678901234567890123456789012345678901234',
      ];

  // Get EMERGENCY_ROLE
  const EMERGENCY_ROLE = await lxonDecentralized.EMERGENCY_ROLE();

  console.log('Configuring emergency multisig...\n');

  // Grant EMERGENCY_ROLE to all emergency members
  for (const member of emergencyMembers) {
    console.log(`Granting EMERGENCY_ROLE to: ${member}`);
    await lxonDecentralized.grantRole(EMERGENCY_ROLE, member);
    await lxonDecentralized.setEmergencyAdmin(member, true);
    console.log(`✓ Granted EMERGENCY_ROLE to: ${member}`);
  }

  // Set emergency parameters
  console.log('\nSetting emergency parameters...');
  const EMERGENCY_NOTICE_PERIOD = await lxonDecentralized.EMERGENCY_NOTICE_PERIOD();
  const EMERGENCY_COUNCIL_APPROVAL_REQUIRED = await lxonDecentralized.EMERGENCY_COUNCIL_APPROVAL_REQUIRED();

  console.log('Emergency notice period:', EMERGENCY_NOTICE_PERIOD.toString(), 'seconds (72 hours)');
  console.log('Emergency council approval required:', EMERGENCY_COUNCIL_APPROVAL_REQUIRED.toString(), '% (80%)');

  console.log('\nEmergency multisig configuration complete!');

  // Verify emergency admins
  console.log('\nVerifying emergency admins...');
  for (const member of emergencyMembers) {
    const isAdmin = await lxonDecentralized.isEmergencyAdmin(member);
    console.log(`${member} is emergency admin:`, isAdmin);
  }

  console.log('\n✓ Emergency multisig configured successfully!');
  console.log('\nEmergency system parameters:');
  console.log('- 72-hour notice period required for emergency actions');
  console.log('- 80% council approval required for emergency override');
  console.log('- Emergency actions can be reversed by council');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
