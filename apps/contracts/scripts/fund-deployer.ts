import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔧 Funding Deployer Account on Local Hardhat Node...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📋 Deployer Information:');
  console.log('  Address:', deployer.address);
  console.log('  Network:', (await ethers.provider.getNetwork()).name);
  console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log();

  // Step 1: Fund deployer with native token (ETH/LXON) for gas
  console.log('💰 Step 1: Funding deployer with native token for gas...');
  const initialBalance = await ethers.provider.getBalance(deployer.address);
  console.log('  Current balance:', ethers.formatEther(initialBalance));

  if (initialBalance === 0n) {
    const fundAmount = ethers.parseEther('1000');
    await (ethers.provider as any).send('hardhat_setBalance', [deployer.address, '0x' + fundAmount.toString(16)]);
    const newBalance = await ethers.provider.getBalance(deployer.address);
    console.log('  ✅ Funded with 1,000 ETH. New balance:', ethers.formatEther(newBalance));
  } else {
    console.log('  ⏭️  Account already funded');
  }
  console.log();

  // Step 2: Deploy LXON Native Token
  console.log('📦 Step 2: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(deployer.address);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  console.log('✅ LXON Native Token deployed to:', lxonAddress);
  console.log();

  // Step 3: Mint LXON tokens to deployer
  console.log('🪙 Step 3: Minting LXON tokens to deployer...');
  const mintAmount = ethers.parseEther('1000000'); // 1M LXON
  const mintTx = await lxonToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  const tokenBalance = await lxonToken.balanceOf(deployer.address);
  console.log('✅ Minted 1,000,000 LXON to deployer');
  console.log('  Token Balance:', ethers.formatEther(tokenBalance), 'LXON');
  console.log();

  // Step 4: Save deployment addresses
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'localhost.json');
  const deploymentAddresses = {
    lxonToken: lxonAddress,
    deployer: deployer.address,
    tokenBalance: tokenBalance.toString(),
    fundedAt: new Date().toISOString()
  };
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('💾 Deployment addresses saved to:', deploymentPath);
  console.log();

  // Print summary
  console.log('📋 Funding Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Deployer Address:', deployer.address);
  console.log('Native Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');
  console.log('LXON Token:', lxonAddress);
  console.log('LXON Balance:', ethers.formatEther(tokenBalance), 'LXON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Funding failed:', error);
    process.exit(1);
  });
