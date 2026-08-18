import { ethers } from 'hardhat';

async function main() {
  console.log('Adding technical council members...\n');

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

  // Get TECHNICAL_COUNCIL_ROLE
  const TECHNICAL_COUNCIL_ROLE = await lxonDecentralized.TECHNICAL_COUNCIL_ROLE();

  // Technical council members (from environment or default)
  const councilMembers = process.env.COUNCIL_MEMBERS 
    ? process.env.COUNCIL_MEMBERS.split(',') 
    : [
        '0x1234567890123456789012345678901234567890', // Replace with actual addresses
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012',
        '0x4567890123456789012345678901234567890123',
        '0x5678901234567890123456789012345678901234',
      ];

  console.log('Adding technical council members...\n');

  for (const member of councilMembers) {
    console.log(`Adding council member: ${member}`);
    await lxonDecentralized.grantRole(TECHNICAL_COUNCIL_ROLE, member);
    await lxonDecentralized.setTechnicalCouncilMember(member, true);
    console.log(`✓ Added: ${member}`);
  }

  console.log('\nTechnical council configuration complete!');

  // Verify council members
  console.log('\nVerifying technical council members...');
  const councilSize = await lxonDecentralized.technicalCouncilSize();
  console.log('Technical council size:', councilSize.toString());

  for (const member of councilMembers) {
    const isMember = await lxonDecentralized.isTechnicalCouncilMember(member);
    console.log(`${member} is council member:`, isMember);
  }

  console.log('\n✓ Technical council configured successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
