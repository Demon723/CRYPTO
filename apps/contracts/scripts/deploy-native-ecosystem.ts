import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('=== Deploying LXON Native Ecosystem ===\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), '\n');

  // Step 1: Deploy Native Token
  console.log('1. Deploying LXONNativeToken...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const token = await LXONNativeToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('LXONNativeToken deployed to:', tokenAddress);

  // Step 2: Deploy Native Swap
  console.log('\n2. Deploying LXONSwap...');
  const LXONSwap = await ethers.getContractFactory('LXONSwap');
  const swap = await LXONSwap.deploy(tokenAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log('LXONSwap deployed to:', swapAddress);

  // Step 3: Mint initial supply to deployer
  console.log('\n3. Minting initial supply...');
  const initialSupply = ethers.parseEther('100000000'); // 100M tokens
  await token.mint(deployer.address, initialSupply);
  console.log('Minted', ethers.formatEther(initialSupply), 'XON to', deployer.address);

  // Step 4: Approve swap contract
  console.log('\n4. Approving swap contract...');
  const approveAmount = ethers.parseEther('10000000'); // 10M for liquidity
  await token.approve(swapAddress, approveAmount);
  console.log('Approved', ethers.formatEther(approveAmount), 'XON for swap');

  // Step 5: Add initial liquidity
  console.log('\n5. Adding initial liquidity...');
  const nativeLiquidity = ethers.parseEther('1000'); // 1000 native tokens
  const tokenLiquidity = ethers.parseEther('10000'); // 10000 XON
  await swap.addLiquidity(tokenLiquidity, { value: nativeLiquidity });
  console.log('Added liquidity:');
  console.log('  Native:', ethers.formatEther(nativeLiquidity));
  console.log('  XON:', ethers.formatEther(tokenLiquidity));

  // Save deployment
  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      LXONNativeToken: tokenAddress,
      LXONSwap: swapAddress,
    },
    token: {
      name: 'LXON',
      symbol: 'XON',
      decimals: 18,
      initialSupply: ethers.formatEther(initialSupply),
    },
    liquidity: {
      native: ethers.formatEther(nativeLiquidity),
      token: ethers.formatEther(tokenLiquidity),
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  if (!writeFileSync) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${Number(network.chainId)}-native-ecosystem.json`, JSON.stringify(deployment, null, 2));

  console.log('\n=== ✅ Native Ecosystem Deployed Successfully ===');
  console.log('Native Token:', tokenAddress);
  console.log('Swap:', swapAddress);
  console.log('Deployment info saved to deployments/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Native ecosystem deployment failed:', error);
    process.exit(1);
  });
