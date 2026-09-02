import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔍 Checking deployed contract code...\n');

  const [deployer] = await ethers.getSigners();
  
  // Load deployment addresses
  const deploymentPath = path.join(__dirname, '..', 'deployments', '31337.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment file not found');
    process.exit(1);
  }

  const deploymentAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { lxonToken, baseToken, buybackBurn } = deploymentAddresses;

  console.log('📋 Saved Deployment Addresses:');
  console.log('  LXON Token:', lxonToken);
  console.log('  Base Token:', baseToken);
  console.log('  Buyback:', buybackBurn);
  console.log();

  // Check code at each address
  for (const [name, addr] of Object.entries({ lxonToken, baseToken, buybackBurn })) {
    const code = await ethers.provider.getCode(addr);
    console.log(`  ${name} code length:`, code.length, code.length > 2 ? '✅ HAS CODE' : '❌ NO CODE');
  }
  console.log();

  // Try to redeploy and get actual addresses
  console.log('📦 Redeploying to verify actual addresses...');
  
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxon = await LXONNativeToken.deploy(deployer.address);
  await lxon.waitForDeployment();
  const realLxonAddr = await lxon.getAddress();
  console.log('  Real LXON Token:', realLxonAddr);

  const TestBaseToken = await ethers.getContractFactory('ERC20Mock');
  const base = await TestBaseToken.deploy('USD Coin', 'USDC', 18);
  await base.waitForDeployment();
  const realBaseAddr = await base.getAddress();
  console.log('  Real Base Token:', realBaseAddr);

  // Save corrected addresses
  deploymentAddresses.lxonToken = realLxonAddr;
  deploymentAddresses.baseToken = realBaseAddr;
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log('\n💾 Corrected addresses saved to:', deploymentPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
