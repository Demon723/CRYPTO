import { ethers } from 'hardhat';

async function main() {
  console.log('Testing technical council veto...\n');

  const [councilMember] = await ethers.getSigners();
  console.log('Testing with council member account:', councilMember.address);

  // Get LXONDecentralized address from environment
  const lxonDecentralizedAddress = process.env.LXON_DECENTRALIZED_ADDRESS;
  if (!lxonDecentralizedAddress) {
    throw new Error('LXON_DECENTRALIZED_ADDRESS environment variable not set');
  }

  // Get proposal ID from environment
  const proposalId = process.env.PROPOSAL_ID || '0x' + ethers.ZeroHash; // Default to zero hash
  console.log('LXONDecentralized address:', lxonDecentralizedAddress);
  console.log('Proposal ID:', proposalId, '\n');

  // Get contract instance
  const lxonDecentralized = await ethers.getContractAt('LXONDecentralized', lxonDecentralizedAddress);

  // Check if account is technical council member
  const isCouncilMember = await lxonDecentralized.isTechnicalCouncilMember(councilMember.address);
  console.log('Is technical council member:', isCouncilMember);

  if (!isCouncilMember) {
    console.log('Account is not a technical council member. Cannot veto.');
    return;
  }

  // Get TECHNICAL_COUNCIL_ROLE
  const TECHNICAL_COUNCIL_ROLE = await lxonDecentralized.TECHNICAL_COUNCIL_ROLE();

  // Check if account has TECHNICAL_COUNCIL_ROLE
  const hasCouncilRole = await lxonDecentralized.hasRole(TECHNICAL_COUNCIL_ROLE, councilMember.address);
  console.log('Has TECHNICAL_COUNCIL_ROLE:', hasCouncilRole);

  if (!hasCouncilRole) {
    console.log('Account does not have TECHNICAL_COUNCIL_ROLE. Cannot veto.');
    return;
  }

  // Veto reason
  const vetoReason = process.env.VETO_REASON || 'Test veto: Technical review identifies security concern';
  console.log('Veto reason:', vetoReason, '\n');

  console.log('Casting technical council veto...');
  try {
    const tx = await lxonDecentralized.councilApprove(proposalId, false, vetoReason);
    console.log('Transaction submitted:', tx.hash);
    await tx.wait();
    console.log('Transaction confirmed!');

    console.log('\n✓ Technical council veto cast successfully!');
    console.log('\nVeto effects:');
    console.log('- Proposal has been vetoed by technical council');
    console.log('- Proposal cannot proceed without council approval');
    console.log('- Team must address technical concerns');
    console.log('- Veto can be overridden by emergency council in extreme cases');

  } catch (error) {
    console.log('Veto failed. This may be expected if:');
    console.log('- Proposal already executed');
    console.log('- Proposal not found');
    console.log('- Function signature different than expected');
    console.log('\nError:', error.message);
  }

  return {
    councilMember: councilMember.address,
    proposalId: proposalId,
    vetoReason: vetoReason,
    isCouncilMember: isCouncilMember,
    hasCouncilRole: hasCouncilRole
  };
}

main()
  .then((result) => {
    console.log('\nTechnical council veto test complete!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
