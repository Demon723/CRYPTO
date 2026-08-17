import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON Token only...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  try {
    const LXONFactory = await ethers.getContractFactory('LXON');
    const lxon = await LXONFactory.deploy();
    await lxon.waitForDeployment();
    const lxonAddress = await lxon.getAddress();
    console.log('LXON token deployed to:', lxonAddress);

    // Get token info
    const name = await lxon.name();
    const symbol = await lxon.symbol();
    const totalSupply = await lxon.totalSupply();
    const maxSupply = await lxon.MAX_SUPPLY();
    const initialSupply = await lxon.INITIAL_SUPPLY();

    console.log('\nToken Details:');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', ethers.formatEther(totalSupply));
    console.log('Max Supply:', ethers.formatEther(maxSupply));
    console.log('Initial Supply:', ethers.formatEther(initialSupply));

    const network = await ethers.provider.getNetwork();
    const fs = require('fs');
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      contracts: {
        LXON: lxonAddress,
      },
      tokenDetails: {
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        maxSupply: maxSupply.toString(),
        initialSupply: initialSupply.toString(),
      },
      deployedAt: new Date().toISOString(),
    };

    const dir = './deployments';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${Number(network.chainId)}.json`, JSON.stringify(deploymentInfo, null, 2));

    console.log('\nDeployment info saved to deployments/');
    console.log('\n✅ LXON Token deployment successful!');

  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
