import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('Adding liquidity to LXON Native Swap...');

  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  const fs = require('fs');
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const deploymentFile = `./deployments/${chainId}-native-ecosystem.json`;

  if (!fs.existsSync(deploymentFile)) {
    console.error('Native ecosystem not deployed. Run deploy-native-ecosystem.ts first.');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const tokenAddress = deployment.contracts.LXONNativeToken;
  const swapAddress = deployment.contracts.LXONSwap;

  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const token = LXONNativeToken.attach(tokenAddress);

  const LXONSwap = await ethers.getContractFactory('LXONSwap');
  const swap = LXONSwap.attach(swapAddress);

  const tokenAmount = ethers.parseEther('10000');
  const nativeAmount = ethers.parseEther('1000');

  console.log('Approving swap contract...');
  await token.approve(swapAddress, tokenAmount);

  console.log('Adding liquidity...');
  await swap.addLiquidity(tokenAmount, { value: nativeAmount });

  console.log('Liquidity added:');
  console.log('  Native:', ethers.formatEther(nativeAmount));
  console.log('  XON:', ethers.formatEther(tokenAmount));

  const [reserveNative, reserveToken] = await swap.getReserves();
  console.log('\nPool reserves:');
  console.log('  Native:', ethers.formatEther(reserveNative));
  console.log('  XON:', ethers.formatEther(reserveToken));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Add liquidity failed:', error);
    process.exit(1);
  });
