import { ethers } from 'hardhat';

async function main() {
  console.log('Voting on test governance proposal...\n');

  const [voter] = await ethers.getSigners();
  console.log('Voting with account:', voter.address);

  // Get DAO address from environment
  const lxonDAOAddress = process.env.LXON_DAO_ADDRESS;
  if (!lxonDAOAddress) {
    throw new Error('LXON_DAO_ADDRESS environment variable not set');
  }

  // Get proposal ID from environment or command line
  const proposalId = process.env.PROPOSAL_ID || process.argv[2];
  if (!proposalId) {
    throw new Error('PROPOSAL_ID environment variable not set or not provided as argument');
  }

  console.log('LXONDAO address:', lxonDAOAddress);
  console.log('Proposal ID:', proposalId, '\n');

  // Get DAO contract instance
  const lxonDAO = await ethers.getContractAt('LXONDAO', lxonDAOAddress);

  // Check voting power
  const votingPower = await lxonDAO.getVotes(voter.address, await lxonDAO.proposalSnapshot(proposalId));
  console.log('Voting power:', votingPower.toString());

  if (votingPower === 0n) {
    console.log('No voting power. Cannot vote.');
    return;
  }

  // Vote options: 0 = Against, 1 = For, 2 = Abstain
  const voteOption = process.env.VOTE_OPTION || '1'; // Default: For
  console.log('Vote option:', voteOption, '(0=Against, 1=For, 2=Abstain)');

  console.log('Casting vote...');
  const tx = await lxonDAO.castVote(proposalId, parseInt(voteOption));
  console.log('Transaction submitted:', tx.hash);
  await tx.wait();
  console.log('Transaction confirmed!');

  // Verify vote
  const hasVoted = await lxonDAO.hasVoted(proposalId, voter.address);
  console.log('Vote recorded:', hasVoted);

  console.log('\n✓ Vote cast successfully!');

  // Get proposal vote counts
  const forVotes = await lxonDAO.proposalVotes(proposalId, 1);
  const againstVotes = await lxonDAO.proposalVotes(proposalId, 0);
  const abstainVotes = await lxonDAO.proposalVotes(proposalId, 2);

  console.log('\nCurrent vote counts:');
  console.log('For:', forVotes.toString());
  console.log('Against:', againstVotes.toString());
  console.log('Abstain:', abstainVotes.toString());

  return {
    voter: voter.address,
    proposalId: proposalId,
    voteOption: voteOption,
    hasVoted: hasVoted,
    voteCounts: {
      for: forVotes.toString(),
      against: againstVotes.toString(),
      abstain: abstainVotes.toString()
    }
  };
}

main()
  .then((result) => {
    console.log('\nVoting complete!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
