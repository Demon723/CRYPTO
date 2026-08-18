import { ethers } from 'hardhat';

async function main() {
  console.log('Transferring governance to DAO...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Transferring with account:', deployer.address);

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
  const DEFAULT_ADMIN_ROLE = await lxonDecentralized.DEFAULT_ADMIN_ROLE();
  const GOVERNANCE_ROLE = await lxonDecentralized.GOVERNANCE_ROLE();
  const EMITTER_ROLE = await lxonDecentralized.EMITTER_ROLE();
  const MINTER_ROLE = await lxonDecentralized.MINTER_ROLE();

  console.log('Transferring governance roles to DAO...\n');

  // Check current admin
  const currentAdmin = await lxonDecentralized.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log('Deployer has DEFAULT_ADMIN_ROLE:', currentAdmin);

  if (!currentAdmin) {
    console.log('Deployer no longer has DEFAULT_ADMIN_ROLE. Governance may already be transferred.');
    return;
  }

  // Transfer DEFAULT_ADMIN_ROLE to DAO
  console.log('Transferring DEFAULT_ADMIN_ROLE to DAO...');
  await lxonDecentralized.grantRole(DEFAULT_ADMIN_ROLE, lxonDAOAddress);
  console.log('✓ DEFAULT_ADMIN_ROLE granted to DAO');

  // Revoke DEFAULT_ADMIN_ROLE from deployer
  console.log('Revoking DEFAULT_ADMIN_ROLE from deployer...');
  await lxonDecentralized.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log('✓ DEFAULT_ADMIN_ROLE revoked from deployer');

  // Verify other governance roles are with DAO
  console.log('\nVerifying governance roles...');
  const daoHasGovernance = await lxonDecentralized.hasRole(GOVERNANCE_ROLE, lxonDAOAddress);
  const daoHasEmitter = await lxonDecentralized.hasRole(EMITTER_ROLE, lxonDAOAddress);
  const daoHasMinter = await lxonDecentralized.hasRole(MINTER_ROLE, lxonDAOAddress);

  console.log('DAO has GOVERNANCE_ROLE:', daoHasGovernance);
  console.log('DAO has EMITTER_ROLE:', daoHasEmitter);
  console.log('DAO has MINTER_ROLE:', daoHasMinter);

  // Verify DEFAULT_ADMIN_ROLE transfer
  const daoHasAdmin = await lxonDecentralized.hasRole(DEFAULT_ADMIN_ROLE, lxonDAOAddress);
  const deployerHasAdmin = await lxonDecentralized.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log('\nDEFAULT_ADMIN_ROLE transfer verification:');
  console.log('DAO has DEFAULT_ADMIN_ROLE:', daoHasAdmin);
  console.log('Deployer has DEFAULT_ADMIN_ROLE:', deployerHasAdmin);

  if (daoHasAdmin && !deployerHasAdmin) {
    console.log('\n✓ Governance successfully transferred to DAO!');
    console.log('\nGovernance structure:');
    console.log('- DAO now has DEFAULT_ADMIN_ROLE (full control)');
    console.log('- DAO has GOVERNANCE_ROLE (governance operations)');
    console.log('- DAO has EMITTER_ROLE (token emission)');
    console.log('- DAO has MINTER_ROLE (controlled minting)');
    console.log('- Deployer no longer has admin rights');
  } else {
    console.log('\n⚠ Governance transfer may not be complete. Please verify manually.');
  }

  console.log('\nIMPORTANT: After governance transfer:');
  console.log('- Deployer can no longer make administrative changes');
  console.log('- DAO controls all governance operations');
  console.log('- Technical council still has veto power');
  console.log('- Emergency multisig still has emergency powers');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
