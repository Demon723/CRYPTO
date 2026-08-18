import { ethers } from 'hardhat';

async function main() {
  console.log('=== Verifying LXON Native Deployment ===\n');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Verifying with account:', owner.address);

  try {
    // Get deployed contract addresses
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-native-ecosystem.json`;
    
    if (!fs.existsSync(deploymentFile)) {
      console.error('Native ecosystem deployment file not found');
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    
    console.log('Network:', network.name);
    console.log('Chain ID:', network.chainId);
    console.log('Deployer:', deploymentInfo.deployer);
    console.log('Deployed At:', deploymentInfo.deployedAt);

    console.log('\n=== Contract Addresses ===');
    console.log('LXONNativeToken:', deploymentInfo.contracts.LXONNativeToken);
    console.log('LXONSwap:', deploymentInfo.contracts.LXONSwap);

    console.log('\n=== Token Configuration ===');
    console.log('Name:', deploymentInfo.token.name);
    console.log('Symbol:', deploymentInfo.token.symbol);
    console.log('Decimals:', deploymentInfo.token.decimals);
    console.log('Initial Supply:', deploymentInfo.token.initialSupply);

    console.log('\n=== Liquidity Configuration ===');
    console.log('Native Liquidity:', deploymentInfo.liquidity.native);
    console.log('Token Liquidity:', deploymentInfo.liquidity.token);

    // Verify contracts are deployed and accessible
    console.log('\n=== Verifying Contract Accessibility ===');
    
    const token = await ethers.getContractAt('LXONNativeToken', deploymentInfo.contracts.LXONNativeToken, owner);
    const swap = await ethers.getContractAt('LXONSwap', deploymentInfo.contracts.LXONSwap, owner);

    // Verify token
    const tokenName = await token.name();
    const tokenSymbol = await token.symbol();
    const tokenSupply = await token.totalSupply();
    
    console.log('✅ Token Contract Accessible');
    console.log('   Name:', tokenName);
    console.log('   Symbol:', tokenSymbol);
    console.log('   Supply:', ethers.formatEther(tokenSupply));

    // Verify swap
    const [reserveNative, reserveToken] = await swap.getReserves();
    
    console.log('✅ Swap Contract Accessible');
    console.log('   Native Reserve:', ethers.formatEther(reserveNative));
    console.log('   Token Reserve:', ethers.formatEther(reserveToken));

    // Verify owner balance
    const ownerBalance = await token.balanceOf(owner.address);
    const ownerNativeBalance = await ethers.provider.getBalance(owner.address);
    
    console.log('\n=== Owner Balances ===');
    console.log('Token Balance:', ethers.formatEther(ownerBalance));
    console.log('Native Balance:', ethers.formatEther(ownerNativeBalance));

    // Check for governance configuration
    const governanceConfigFile = `./deployments/${Number(network.chainId)}-governance-config.json`;
    if (fs.existsSync(governanceConfigFile)) {
      const governanceConfig = JSON.parse(fs.readFileSync(governanceConfigFile, 'utf8'));
      console.log('\n=== Governance Configuration ===');
      console.log('Governance Address:', governanceConfig.contracts.LXONGovernance);
      console.log('Voting Delay:', governanceConfig.governance.votingDelay / 86400, 'days');
      console.log('Voting Period:', governanceConfig.governance.votingPeriod / 86400, 'days');
      console.log('Quorum:', governanceConfig.governance.quorum, '%');
      console.log('Council Members:', governanceConfig.governance.councilMembers.length);
    }

    // Check for DEX configuration
    const dexConfigFile = `./deployments/${Number(network.chainId)}-dex-config.json`;
    if (fs.existsSync(dexConfigFile)) {
      const dexConfig = JSON.parse(fs.readFileSync(dexConfigFile, 'utf8'));
      console.log('\n=== DEX Configuration ===');
      console.log('DEX Address:', dexConfig.contracts.LXONNativeDEX);
      console.log('Fee Rate:', dexConfig.dex.feePercentage, '%');
      console.log('Fee Recipient:', dexConfig.dex.feeRecipient);
    }

    console.log('\n=== ✅ Deployment Verification Complete ===');
    console.log('All contracts are deployed and accessible.');

  } catch (error) {
    console.error('❌ Deployment verification failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
