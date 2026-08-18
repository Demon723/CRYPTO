import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying full LXON ecosystem with NFT, TOTP, and phygital features...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  try {
    // Deploy LXON TOTP Auth first
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

    // Deploy LXON Native Token
    console.log('Deploying LXON Native Token...');
    const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
    const lxonNativeToken = await LXONNativeToken.deploy();
    await lxonNativeToken.waitForDeployment();
    const lxonNativeTokenAddress = await lxonNativeToken.getAddress();
    console.log('LXON Native Token deployed to:', lxonNativeTokenAddress, '\n');

    // Deploy LXON NFT
    console.log('Deploying LXON NFT...');
    const LXONNFT = await ethers.getContractFactory('LXONNFT');
    const lxonNFT = await LXONNFT.deploy(lxonChipRegistryAddress, lxonCardRegistryAddress, lxonTOTPAuthAddress);
    await lxonNFT.waitForDeployment();
    const lxonNFTAddress = await lxonNFT.getAddress();
    console.log('LXON NFT deployed to:', lxonNFTAddress, '\n');

    // Deploy Timelock Controller for governance
    console.log('Deploying Timelock Controller...');
    const TimelockController = await ethers.getContractFactory('TimelockController');
    const timelock = await TimelockController.deploy(
      60 * 60 * 24 * 2, // 2 days delay
      [deployer.address], // proposers
      [deployer.address], // executors
      deployer.address // admin
    );
    await timelock.waitForDeployment();
    const timelockAddress = await timelock.getAddress();
    console.log('Timelock Controller deployed to:', timelockAddress, '\n');

    // Deploy LXON Governance
    console.log('Deploying LXON Governance...');
    const LXONGovernance = await ethers.getContractFactory('LXONGovernance');
    const lxonGovernance = await LXONGovernance.deploy(timelock, lxonNativeToken);
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

    // Set governance mint authority
    console.log('Configuring governance...');
    await lxonNativeToken.setMintAuthority(lxonGovernanceAddress);
    console.log('Governance set as mint authority for native token');

    // Set up TOTP for founder
    console.log('\nSetting up TOTP for founder...');
    const founderSecretHash = ethers.keccak256(ethers.toUtf8Bytes('founder-totp-secret-' + Date.now()));
    await lxonTOTPAuth.setTOTPSecret(deployer.address, founderSecretHash);
    console.log('TOTP secret set for founder');
    console.log('Founder secret hash:', founderSecretHash);
    console.log('IMPORTANT: Store this secret hash securely for Google Authenticator setup');

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
        TimelockController: timelockAddress,
        LXONGovernance: lxonGovernanceAddress,
        LXONNativeDEX: lxonNativeDEXAddress
      },
      founderSecretHash: founderSecretHash,
      timestamp: new Date().toISOString()
    };

    console.log('\nDeployment summary:');
    console.log(JSON.stringify(deployment, null, 2));

    console.log('\n✓ Full LXON ecosystem with NFT, TOTP, and phygital features deployment complete!');
    console.log('\nDeployed contracts:');
    console.log('- LXON TOTP Auth - Google Authenticator 2FA security');
    console.log('- LXON Chip Registry - Physical chip authentication');
    console.log('- LXON Card Registry - Premium card management');
    console.log('- LXON Native Token (XON) - Fungible currency');
    console.log('- LXON NFT - Non-fungible physical coin tokens');
    console.log('- Timelock Controller - Governance time delays');
    console.log('- LXON Governance - DAO governance');
    console.log('- LXON Native DEX - Decentralized exchange');
    console.log('\n✅ NFT support: Enabled');
    console.log('✅ TOTP authentication: Enabled');
    console.log('✅ Phygital features: Enabled');

  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });