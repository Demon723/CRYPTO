import { ethers } from 'hardhat';

async function main() {
  console.log('🔍 Verifying LXON Mainnet RPC Connection...\n');

  try {
    const [deployer] = await ethers.getSigners();
    console.log('✅ Connected to network');
    console.log('  Network:', (await ethers.provider.getNetwork()).name);
    console.log('  Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
    console.log('  Deployer Address:', deployer.address);
    console.log('  Account Balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'LXON');
    console.log();
    console.log('✅ RPC connection successful!');
  } catch (error) {
    console.error('❌ RPC connection failed:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
