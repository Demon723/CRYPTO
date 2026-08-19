import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON Enhanced Standalone Blockchain with NFT Support...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy LXON TOTP Auth
  console.log('Deploying LXON TOTP Auth...');
  const LXONTOTPAuth = await ethers.getContractFactory('LXONTOTPAuth');
  const lxonTOTPAuth = await LXONTOTPAuth.deploy();
  await lxonTOTPAuth.waitForDeployment();
  const lxonTOTPAuthAddress = await lxonTOTPAuth.getAddress();
  console.log('LXON TOTP Auth deployed to:', lxonTOTPAuthAddress, '\n');

  // Deploy LXON Chip Registry
  console.log('Deploying LXON Chip Registry...');
  const LXONChipRegistry = await ethers.getContractFactory('LXONChipRegistry');
  const lxonChipRegistry = await LXONChipRegistry.deploy(lxonTOTPAuthAddress);
  await lxonChipRegistry.waitForDeployment();
  const lxonChipRegistryAddress = await lxonChipRegistry.getAddress();
  console.log('LXON Chip Registry deployed to:', lxonChipRegistryAddress, '\n');

  // Deploy LXON Card Registry
  console.log('Deploying LXON Card Registry...');
  const LXONCardRegistry = await ethers.getContractFactory('LXONCardRegistry');
  const lxonCardRegistry = await LXONCardRegistry.deploy(lxonTOTPAuthAddress);
  await lxonCardRegistry.waitForDeployment();
  const lxonCardRegistryAddress = await lxonCardRegistry.getAddress();
  console.log('LXON Card Registry deployed to:', lxonCardRegistryAddress, '\n');

  // Deploy LXON Native Token (for fungible XON)
  console.log('Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonNativeToken = await LXONNativeToken.deploy();
  await lxonNativeToken.waitForDeployment();
  const lxonNativeTokenAddress = await lxonNativeToken.getAddress();
  console.log('LXON Native Token deployed to:', lxonNativeTokenAddress, '\n');

  // Deploy LXON NFT (for physical coins)
  console.log('Deploying LXON NFT...');
  const LXONNFT = await ethers.getContractFactory('LXONNFT');
  const lxonNFT = await LXONNFT.deploy(lxonChipRegistryAddress, lxonCardRegistryAddress, lxonTOTPAuthAddress);
  await lxonNFT.waitForDeployment();
  const lxonNFTAddress = await lxonNFT.getAddress();
  console.log('LXON NFT deployed to:', lxonNFTAddress, '\n');

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
    lxonNativeTokenAddress,
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
  
  console.log('Native Token name:', tokenName);
  console.log('Native Token symbol:', tokenSymbol);
  console.log('Native Token max supply:', maxSupply.toString());
  console.log('Native Token total supply:', (await lxonNativeToken.totalSupply()).toString());

  const nftName = await lxonNFT.name();
  const nftSymbol = await lxonNFT.symbol();
  const nftTotalSupply = await lxonNFT.totalSupply();
  
  console.log('NFT name:', nftName);
  console.log('NFT symbol:', nftSymbol);
  console.log('NFT total supply:', nftTotalSupply.toString());

  const chipFounder = await lxonChipRegistry.founder();
  const cardFounder = await lxonCardRegistry.founder();
  const totpFounder = await lxonTOTPAuth.founder();
  
  console.log('Chip Registry founder:', chipFounder);
  console.log('Card Registry founder:', cardFounder);
  console.log('TOTP Auth founder:', totpFounder);

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
  console.log('Governance set as mint authority for native token');
  
  // Set up TOTP for founder
  console.log('\nSetting up TOTP for founder...');
  // Generate a random secret hash (in production, this would be generated securely)
  const founderSecretHash = ethers.keccak256(ethers.toUtf8Bytes('founder-totp-secret-' + Date.now()));
  await lxonTOTPAuth.setTOTPSecret(deployer.address, founderSecretHash);
  console.log('TOTP secret set for founder');
  console.log('Founder secret hash:', founderSecretHash);
  console.log('IMPORTANT: Store this secret hash securely for Google Authenticator setup');
  
  console.log('\n✓ Enhanced standalone blockchain with NFT support and TOTP deployment complete!');

  // Save deployment addresses
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      LXONTOTPAuth: lxonTOTPAuthAddress,
      LXONChipRegistry: lxonChipRegistryAddress,
      LXONCardRegistry: lxonCardRegistryAddress,
      LXONNativeToken: lxonNativeTokenAddress,
      LXONNFT: lxonNFTAddress,
      LXONGovernance: lxonGovernanceAddress,
      LXONNativeDEX: lxonNativeDEXAddress
    },
    founderSecretHash: founderSecretHash,
    timestamp: new Date().toISOString()
  };

  console.log('\nDeployment summary:');
  console.log(JSON.stringify(deployment, null, 2));

  console.log('\n✓ Enhanced standalone blockchain with NFT support deployment complete!');
  console.log('\nComplete ecosystem:');
  console.log('- LXON Native Token (XON) - Fungible currency for the blockchain');
  console.log('- LXON NFT - Non-fungible tokens representing physical coins');
  console.log('- LXON TOTP Auth - Google Authenticator 2FA for founder operations');
  console.log('- Physical chip authentication (PBT-style)');
  console.log('- Premium card system with Amex-style card numbers');
  console.log('- Token Bound Accounts (smart contract wallets)');
  console.log('- Physical-digital binding');
  console.log('- Stellar evolution tier system');
  console.log('- Tap-to-pay functionality');
  console.log('- Native DEX for trading');
  console.log('\nIMPORTANT SECURITY NOTES:');
  console.log('- Founder operations now require TOTP (2FA)');
  console.log('- Founder secret hash:', founderSecretHash);
  console.log('- Use this hash to set up Google Authenticator');
  console.log('- Critical operations: chip minting, token activation, freezing, deactivation');

  return deployment;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}