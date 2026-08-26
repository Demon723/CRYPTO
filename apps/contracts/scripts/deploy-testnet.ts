import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

const SEPOLIA_WETH = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';

async function main() {
  console.log('Deploying Enhanced LXON Ecosystem to Sepolia Testnet...');

  const provider = ethers.provider;
  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error(`Expected Sepolia (11155111), got chainId ${network.chainId}`);
  }

  const [deployer] = await ethers.getSigners();
  const balance = await provider.getBalance(deployer.address);
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    throw new Error(
      `Deployer ${deployer.address} has 0 Sepolia ETH. Fund it from a faucet, then retry.`
    );
  }

  const deploymentAddresses: Record<string, string> = {
    deployer: deployer.address,
    network: 'sepolia',
    chainId: network.chainId.toString(),
    weth: SEPOLIA_WETH
  };

  console.log('\nPhase 1: Deploying LXON Native Token...');
  const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
  const lxonToken = await LXONNativeToken.deploy(deployer.address);
  await lxonToken.waitForDeployment();
  const lxonAddress = await lxonToken.getAddress();
  deploymentAddresses.lxonToken = lxonAddress;
  console.log('LXON Native Token deployed to:', lxonAddress);

  console.log('\nPhase 2: Governance deployment skipped (requires TimelockController)');
  console.log('\nPhase 3: DEX deployment skipped (requires additional parameters)');

  console.log('\nPhase 4: Deploying Buyback and Burn...');
  const buybackThreshold = ethers.parseEther('0.01');
  const buybackPercentage = 10n;
  const LXONBuybackBurn = await ethers.getContractFactory('LXONBuybackBurn');
  const buyback = await LXONBuybackBurn.deploy(
    lxonAddress,
    SEPOLIA_WETH,
    deployer.address,
    buybackThreshold,
    buybackPercentage
  );
  await buyback.waitForDeployment();
  const buybackAddress = await buyback.getAddress();
  deploymentAddresses.buybackBurn = buybackAddress;
  console.log('Buyback and Burn deployed to:', buybackAddress);

  console.log('\nPhase 5: Configuring buyback...');
  const enableTx = await buyback.toggleBuyback(true);
  await enableTx.wait();
  console.log('Buyback enabled (threshold 0.01, percentage 10%, treasury = deployer)');

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const deploymentPath = path.join(deploymentsDir, 'sepolia.json');
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify({ ...deploymentAddresses, deploymentDate: new Date().toISOString() }, null, 2)
  );
  console.log('\nDeployment addresses saved to:', deploymentPath);

  console.log('\nDeployment Summary:');
  console.log('LXON Native Token:', lxonAddress);
  console.log('Buyback and Burn:', buybackAddress);
  console.log('Treasury:', deployer.address);
  console.log('Base token (WETH):', SEPOLIA_WETH);
  console.log('\nNetwork: Sepolia Testnet (Chain ID: 11155111)');
  console.log(`  https://sepolia.etherscan.io/address/${lxonAddress}`);
  console.log(`  https://sepolia.etherscan.io/address/${buybackAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
