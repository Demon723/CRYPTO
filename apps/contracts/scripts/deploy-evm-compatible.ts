import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';

async function main() {
  console.log('=== Deploying LXON EVM-Compatible Ecosystem ===\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), '\n');

  // Step 1: Deploy LXON ERC20 Token
  console.log('1. Deploying LXON ERC20 Token...');
  const LXON = await ethers.getContractFactory('LXON');
  const lxon = await LXON.deploy();
  await lxon.waitForDeployment();
  const lxonAddress = await lxon.getAddress();
  console.log('LXON deployed to:', lxonAddress);

  // Step 2: Deploy SimpleSwap AMM
  console.log('\n2. Deploying SimpleSwap AMM...');
  const SimpleSwap = await ethers.getContractFactory('SimpleSwap');
  const swap = await SimpleSwap.deploy(lxonAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log('SimpleSwap deployed to:', swapAddress);

  // Step 3: Add initial liquidity
  console.log('\n3. Adding initial liquidity...');
  const liquidityAmount = ethers.parseEther('100000'); // 100K LXON
  const nativeLiquidity = ethers.parseEther('10'); // 10 ETH/native tokens
  
  await lxon.approve(swapAddress, liquidityAmount);
  await swap.addLiquidity(liquidityAmount, { value: nativeLiquidity });
  
  console.log('Added liquidity:');
  console.log('  LXON:', ethers.formatEther(liquidityAmount));
  console.log('  Native:', ethers.formatEther(nativeLiquidity));

  // Step 4: Get network info for MetaMask configuration
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  
  console.log('\n4. Network Information:');
  console.log('  Network Name:', network.name);
  console.log('  Chain ID:', chainId);
  console.log('  Block Explorer:', getBlockExplorerUrl(chainId));

  // Save deployment
  const deployment = {
    network: network.name,
    chainId: chainId,
    deployer: deployer.address,
    contracts: {
      LXON: lxonAddress,
      SimpleSwap: swapAddress,
    },
    token: {
      name: 'LXON',
      symbol: 'LXON',
      decimals: 18,
      totalSupply: ethers.formatEther(await lxon.totalSupply()),
    },
    liquidity: {
      lxon: ethers.formatEther(liquidityAmount),
      native: ethers.formatEther(nativeLiquidity),
    },
    metamask: {
      chainId: '0x' + chainId.toString(16),
      chainName: getNetworkName(chainId),
      nativeCurrency: getNativeCurrency(chainId),
      rpcUrls: getRpcUrls(chainId),
      blockExplorerUrls: [getBlockExplorerUrl(chainId)],
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = './deployments';
  const fs = require('fs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/${chainId}-evm-ecosystem.json`, JSON.stringify(deployment, null, 2));

  console.log('\n=== ✅ EVM-Compatible Ecosystem Deployed ===');
  console.log('LXON Token:', lxonAddress);
  console.log('SimpleSwap:', swapAddress);
  console.log('Deployment info saved to deployments/');
  console.log('\n=== MetaMask Configuration ===');
  console.log('Chain ID:', deployment.metamask.chainId);
  console.log('Chain Name:', deployment.metamask.chainName);
  console.log('RPC URL:', deployment.metamask.rpcUrls[0]);
}

function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
    10: 'Optimism',
    420: 'Optimism Goerli',
    31337: 'Hardhat Local',
  };
  return networks[chainId] || 'Custom Network';
}

function getNativeCurrency(chainId: number): any {
  const currencies: Record<number, any> = {
    1: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    5: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
    11155111: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    137: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    80001: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    56: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    97: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    42161: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    421613: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    10: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    420: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    31337: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  };
  return currencies[chainId] || { name: 'Ether', symbol: 'ETH', decimals: 18 };
}

function getRpcUrls(chainId: number): string[] {
  const urls: Record<number, string[]> = {
    1: ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth'],
    5: ['https://goerli.infura.io/v3/YOUR_KEY'],
    11155111: ['https://sepolia.infura.io/v3/YOUR_KEY'],
    137: ['https://polygon-rpc.com'],
    80001: ['https://rpc-mumbai.maticvigil.com'],
    56: ['https://bsc-dataseed.binance.org'],
    97: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    42161: ['https://arb1.arbitrum.io/rpc'],
    421613: ['https://goerli-rollup.arbitrum.io/rpc'],
    10: ['https://mainnet.optimism.io'],
    420: ['https://goerli.optimism.io'],
    31337: ['http://localhost:8545'],
  };
  return urls[chainId] || ['http://localhost:8545'];
}

function getBlockExplorerUrl(chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    56: 'https://bscscan.com',
    97: 'https://testnet.bscscan.com',
    42161: 'https://arbiscan.io',
    421613: 'https://goerli.arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    420: 'https://goerli-optimism.etherscan.io',
    31337: '',
  };
  return explorers[chainId] || '';
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('EVM ecosystem deployment failed:', error);
    process.exit(1);
  });
