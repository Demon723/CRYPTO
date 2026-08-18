import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON Enhanced Standalone Blockchain with Phygital Features...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy LXON Chip Registry
  console.log('Deploying LXON Chip Registry...');
  const LXONChipRegistry = await ethers.getContractFactory('LXONChipRegistry');
  const lxonChipRegistry = await LXONChipRegistry.deploy();
  await lxonChipRegistry.waitForDeployment();
  const lxonChipRegistryAddress = await lxonChipRegistry.getAddress();
  console.log('LXON Chip Registry deployed to:', lxonChipRegistryAddress, '\n');

  // Deploy LXON Card Registry
  console.log('Deploying LXON Card Registry...');
  const LXONCardRegistry = await ethers.getContractFactory('LXONCardRegistry');
  const lxonCardRegistry = await LXONCardRegistry.deploy();
  await lxonCardRegistry.waitForDeployment();
  const lxonCardRegistryAddress = await lxonCardRegistry.getAddress();
  console.log('LXON Card Registry deployed to:', lxonCardRegistryAddress, '\n');

  // Deploy LXON Native Token Enhanced
  console.log('Deploying LXON Native Token Enhanced...');
  const LXONNativeTokenEnhanced = await ethers.getContractFactory('LXONNativeTokenEnhanced');
  const lxonNativeTokenEnhanced = await LXONNativeTokenEnhanced.deploy(
    lxonChipRegistryAddress,
    lxonCardRegistryAddress
  );
  await lxonNativeTokenEnhanced.waitForDeployment();
  const lxonNativeTokenEnhancedAddress = await lxonNativeTokenEnhanced.getAddress();
  console.log('LXON Native Token Enhanced deployed to:', lxonNativeTokenEnhancedAddress, '\n');

  // Deploy LXON Governance
  console.log('Deploying LXON Governance...');
  const LXONGovernance = await ethers.getContractFactory('LXONGovernance');
  const lxonGovernance = await LXONGovernance.deploy(lxonNativeTokenEnhancedAddress);
  await lxonGovernance.waitForDeployment();
  const lxonGovernanceAddress = await lxonGovernance.getAddress();
  console.log('LXON Governance deployed to:', lxonGovernanceAddress, '\n');

  // Deploy LXON Native DEX
  console.log('Deploying LXON Native DEX...');
  const LXONNativeDEX = await ethers.getContractFactory('LXONNativeDEX');
  const lxonNativeDEX = await LXONNativeDEX.deploy(
    lxonNativeTokenEnhancedAddress,
    lxonNativeTokenEnhancedAddress,
    lxonNativeTokenEnhancedAddress,
    'XON/XON Pair'
  );
  await lxonNativeDEX.waitForDeployment();
  const lxonNativeDEXAddress = await lxonNativeDEX.getAddress();
  console.log('LXON Native DEX deployed to:', lxonNativeDEXAddress, '\n');

  // Verify deployments
  console.log('Verifying deployments...');
  
  const tokenName = await lxonNativeTokenEnhanced.name();
  const tokenSymbol = await lxonNativeTokenEnhanced.symbol();
  const maxSupply = await lxonNativeTokenEnhanced.MAX_SUPPLY();
  
  console.log('Token name:', tokenName);
  console.log('Token symbol:', tokenSymbol);
  console.log('Max supply:', maxSupply.toString());
  console.log('Total supply:', (await lxonNativeTokenEnhanced.totalSupply()).toString());
  console.log('Block reward:', (await lxonNativeTokenEnhanced.blockReward()).toString());

  const chipFounder = await lxonChipRegistry.founder();
  const cardFounder = await lxonCardRegistry.founder();
  
  console.log('Chip Registry founder:', chipFounder);
  console.log('Card Registry founder:', cardFounder);

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
  await lxonNativeTokenEnhanced.setMintAuthority(lxonGovernanceAddress);
  console.log('Governance set as mint authority');

  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      LXONChipRegistry: lxonChipRegistryAddress,
      LXONCardRegistry: lxonCardRegistryAddress,
      LXONNativeTokenEnhanced: lxonNativeTokenEnhancedAddress,
      LXONGovernance: lxonGovernanceAddress,
      LXONNativeDEX: lxonNativeDEXAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log('\nDeployment summary:');
  console.log(JSON.stringify(deployment, null, 2));

  console.log('\n✓ Enhanced standalone blockchain deployment complete!');
  console.log('\nEnhanced features from Helios architecture:');
  console.log('- Physical chip authentication (PBT-style)');
  console.log('- Premium card system with Amex-style card numbers');
  console.log('- Token Bound Accounts (smart contract wallets)');
  console.log('- Physical-digital binding');
  console.log('- Stellar evolution tier system');
  console.log('- Tap-to-pay functionality');
  console.log('- Chip signature verification');
  console.log('- Wallet binding and lifecycle management');

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}