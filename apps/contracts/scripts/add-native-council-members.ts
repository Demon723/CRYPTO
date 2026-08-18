import { ethers } from 'hardhat';

async function main() {
  console.log('=== Adding Native Council Members ===\n');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Adding with account:', owner.address);

  try {
    // Get governance contract address
    const governanceAddress = process.env.GOVERNANCE_ADDRESS;
    if (!governanceAddress) {
      console.error('GOVERNANCE_ADDRESS environment variable not set');
      process.exit(1);
    }

    console.log('Governance Address:', governanceAddress);

    // Get contract instance
    const governance = await ethers.getContractAt('LXONGovernance', governanceAddress, owner);

    // Get council members from environment
    const councilMembers = process.env.COUNCIL_MEMBERS 
      ? process.env.COUNCIL_MEMBERS.split(',') 
      : [];

    if (councilMembers.length === 0) {
      console.log('No council members to add. Set COUNCIL_MEMBERS environment variable.');
      return;
    }

    console.log('Adding', councilMembers.length, 'council members...\n');

    // Add each council member
    for (const member of councilMembers) {
      try {
        await governance.addCouncilMember(member);
        console.log('✅ Added council member:', member);
      } catch (error: any) {
        console.log('❌ Failed to add:', member, '-', error.message);
      }
    }

    // Verify council size
    const councilSize = await governance.getCouncilSize();
    console.log('\nTotal council members:', councilSize.toString());

    // List council members
    console.log('\nCouncil members:');
    const members = await governance.getCouncilMembers();
    for (const member of members) {
      console.log('  -', member);
    }

    console.log('\n=== ✅ Council Members Added Successfully ===');

  } catch (error) {
    console.error('❌ Failed to add council members:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
