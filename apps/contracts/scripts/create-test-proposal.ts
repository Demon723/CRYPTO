import { ethers } from 'hardhat';

async function main() {
  console.log('Creating test governance proposal...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Creating proposal with account:', deployer.address);

  // Get DAO address from environment
  const lxonDAOAddress = process.env.LXON_DAO_ADDRESS;
  if (!lxonDAOAddress) {
    throw new Error('LXON_DAO_ADDRESS environment variable not set');
  }

  console.log('LXONDAO address:', lxonDAOAddress, '\n');

  // Get DAO contract instance
  const lxonDAO = await ethers.getContractAt('LXONDAO', lxonDAOAddress);

  // Proposal parameters
  const targets = [process.env.LXON_DECENTRALIZED_ADDRESS]; // Target contract
  const values = [0]; // ETH value to send
  const calldatas = [
    // Example: propose emission schedule change
    // This is encoded calldata for a hypothetical function
    '0x' // Replace with actual calldata
  ];
  const description = 'Test proposal: Emission schedule adjustment';

  console.log('Creating proposal...');
  console.log('Targets:', targets);
  console.log('Values:', values);
  console.log('Description:', description, '\n');

  // Create proposal
  const tx = await lxonDAO.propose(
    targets,
    values,
    calldatas,
    description
  );

  console.log('Transaction submitted:', tx.hash);
  await tx.wait();
  console.log('Transaction confirmed!');

  // Get proposal ID
  const proposalId = await lxonDAO.latestProposalIds(deployer.address);
  console.log('Proposal ID:', proposalId.toString());

  // Get proposal state
  const proposalState = await lxonDAO.state(proposalId);
  console.log('Proposal state:', proposalState); // 0: Pending, 1: Active, 2: Canceled, 3: Defeated, 4: Succeeded, 5: Queued, 6: Expired, 7: Executed

  console.log('\n✓ Test proposal created successfully!');
  console.log('\nNext steps:');
  console.log('1. Vote on the proposal using vote-test-proposal.ts');
  console.log('2. Wait for voting period to end');
  console.log('3. Execute the proposal if it passes');

  return {
    proposalId: proposalId.toString(),
    transactionHash: tx.hash,
    proposalState: proposalState.toString()
  };
}

main()
  .then((result) => {
    console.log('\nProposal creation complete!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
