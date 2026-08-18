import { ethers } from 'hardhat';

async function main() {
  console.log('=== Configuring LXON Native Governance ===\n');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Configuring with account:', owner.address);

  try {
    // Get deployed contract addresses
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-native-ecosystem.json`;
    
    if (!fs.existsSync(deploymentFile)) {
      console.error('Native ecosystem deployment file not found');
      console.log('Please deploy native ecosystem first');
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const tokenAddress = deploymentInfo.contracts.LXONNativeToken;
    const governanceAddress = process.env.GOVERNANCE_ADDRESS || deploymentInfo.contracts.LXONGovernance;

    if (!governanceAddress) {
      console.error('Governance contract address not found');
      console.log('Please set GOVERNANCE_ADDRESS environment variable');
      process.exit(1);
    }

    console.log('Token Address:', tokenAddress);
    console.log('Governance Address:', governanceAddress);

    // Get contract instances
    const token = await ethers.getContractAt('LXONNativeToken', tokenAddress, owner);
    const governance = await ethers.getContractAt('LXONGovernance', governanceAddress, owner);

    // Step 1: Grant governance roles
    console.log('\n1. Granting governance roles...');
    
    // Grant MINTER_ROLE to governance
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, governanceAddress);
    console.log('✅ Granted MINTER_ROLE to governance');

    // Grant GOVERNANCE_ROLE to governance
    const GOVERNANCE_ROLE = await governance.GOVERNANCE_ROLE();
    await governance.grantRole(GOVERNANCE_ROLE, governanceAddress);
    console.log('✅ Granted GOVERNANCE_ROLE to governance');

    // Step 2: Configure voting parameters
    console.log('\n2. Configuring voting parameters...');
    const votingDelay = 86400; // 1 day delay in seconds
    const votingPeriod = 604800; // 7 day voting period in seconds
    const quorum = 4; // 4% quorum

    await governance.setVotingParameters(votingDelay, votingPeriod, quorum);
    console.log('✅ Voting parameters configured');
    console.log('   Voting Delay:', votingDelay / 86400, 'days');
    console.log('   Voting Period:', votingPeriod / 86400, 'days');
    console.log('   Quorum:', quorum, '%');

    // Step 3: Configure emergency parameters
    console.log('\n3. Configuring emergency parameters...');
    const emergencyDelay = 259200; // 72 hour emergency delay in seconds
    const emergencyQuorum = 80; // 80% approval required

    await governance.setEmergencyParameters(emergencyDelay, emergencyQuorum);
    console.log('✅ Emergency parameters configured');
    console.log('   Emergency Delay:', emergencyDelay / 3600, 'hours');
    console.log('   Emergency Quorum:', emergencyQuorum, '%');

    // Step 4: Add council members
    console.log('\n4. Adding technical council members...');
    const councilMembers = process.env.COUNCIL_MEMBERS 
      ? process.env.COUNCIL_MEMBERS.split(',') 
      : [owner.address];

    for (const member of councilMembers) {
      await governance.addCouncilMember(member);
      console.log('✅ Added council member:', member);
    }

    // Step 5: Configure emission schedule
    console.log('\n5. Configuring emission schedule...');
    const dailyEmission = ethers.parseEther('13800'); // 13,800 XON daily
    const declineRate = ethers.parseEther('50'); // 50 XON decline per day

    await governance.setEmissionSchedule(dailyEmission, declineRate);
    console.log('✅ Emission schedule configured');
    console.log('   Daily Emission:', ethers.formatEther(dailyEmission), 'XON');
    console.log('   Decline Rate:', ethers.formatEther(declineRate), 'XON/day');

    // Save configuration
    const config = {
      network: network.name,
      chainId: Number(network.chainId),
      configuredBy: owner.address,
      contracts: {
        LXONNativeToken: tokenAddress,
        LXONGovernance: governanceAddress,
      },
      governance: {
        votingDelay: votingDelay.toString(),
        votingPeriod: votingPeriod.toString(),
        quorum: quorum,
        emergencyDelay: emergencyDelay.toString(),
        emergencyQuorum: emergencyQuorum,
        councilMembers: councilMembers,
        dailyEmission: ethers.formatEther(dailyEmission),
        declineRate: ethers.formatEther(declineRate),
      },
      configuredAt: new Date().toISOString(),
    };

    const dir = './deployments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${Number(network.chainId)}-governance-config.json`, JSON.stringify(config, null, 2));

    console.log('\n=== ✅ Governance Configuration Complete ===');
    console.log('Configuration saved to deployments/');

  } catch (error) {
    console.error('❌ Governance configuration failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
