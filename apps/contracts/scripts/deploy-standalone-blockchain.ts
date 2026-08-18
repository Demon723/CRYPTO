import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON Standalone Blockchain Contracts...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy LXON Native Token
  console.log('Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonNativeToken = await LXONNativeToken.deploy();
  await lxonNativeToken.waitForDeployment();
  const lxonNativeTokenAddress = await lxonNativeToken.getAddress();
  console.log('LXON Native Token deployed to:', lxonNativeTokenAddress, '\n');

  // Deploy LXON Governance
  console.log('Deploying LXON Governance...');
  const LXONGovernance = await ethers.getContractFactory('LXONGovernance');
  const lxonGovernance = await LXONGovernance.deploy(lxonNativeTokenAddress);
  await lxonGovernance.waitForDeployment();
  const lxonGovernanceAddress = await lxonGovernance.getAddress();
  console.log('LXON Governance deployed to:', lxonGovernanceAddress, '\n');

  // Deploy LXON Native DEX
  console.log('Deploying LXON Native DEX...');
  const LXONNativeDEX = await ethers.getContractFactory('LXONNativeDEX');
  const lxonNativeDEX = await LXONNativeDEX.deploy(
    lxonNativeTokenAddress,
    lxonNativeTokenAddress, // Using same token for both sides initially
    lxonNativeTokenAddress,
    'XON/XON Pair'
  );
  await lxonNativeDEX.waitForDeployment();
  const lxonNativeDEXAddress = await lxonNativeDEX.getAddress();
  console.log('LXON Native DEX deployed to:', lxonNativeDEXAddress, '\n');

  // Verify deployments
  console.log('Verifying deployments...');
  
  const tokenName = await lxonNativeToken.name();
  const tokenSymbol = await lxonNativeToken.symbol();
  const maxSupply = await lxonNativeToken.MAX_SUPPLY();
  
  console.log('Token name:', tokenName);
  console.log('Token symbol:', tokenSymbol);
  console.log('Max supply:', maxSupply.toString());
  console.log('Total supply:', (await lxonNativeToken.totalSupply()).toString());
  console.log('Block reward:', (await lxonNativeToken.blockReward()).toString());

  const govOwner = await lxonGovernance.owner();
  const councilSize = await lxonGovernance.councilSize();
  
  console.log('Governance owner:', govOwner);
  console.log('Council size:', councilSize.toString());

  const dexOwner = await lxonNativeDEX.owner();
  const dexFeeRate = await lxonNativeDEX.feeRate();
  
  console.log('DEX owner:', dexOwner);
  console.log('DEX fee rate:', dexFeeRate.toString());

  // Set governance mint authority
  console.log('\nConfiguring governance...');
  await lxonNativeToken.setMintAuthority(lxonGovernanceAddress);
  console.log('Governance set as mint authority');

  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      LXONNativeToken: lxonNativeTokenAddress,
      LXONGovernance: lxonGovernanceAddress,
      LXONNativeDEX: lxonNativeDEXAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log('\nDeployment summary:');
  console.log(JSON.stringify(deployment, null, 2));

  console.log('\n✓ Standalone blockchain deployment complete!');
  console.log('\nKey features:');
  console.log('- Native XON token (no ETH dependencies)');
  console.log('- Block rewards system');
  console.log('- Staking mechanism');
  console.log('- Governance with technical council');
  console.log('- Native DEX for trading');
  console.log('- Emergency override system');

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}