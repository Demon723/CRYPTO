import { ethers } from 'hardhat';

async function main() {
  console.log('Checking account balance...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Account:', deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'ETH');

  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name);
  console.log('Chain ID:', network.chainId.toString());

  return {
    address: deployer.address,
    balance: ethers.formatEther(balance),
    network: network.name,
    chainId: network.chainId.toString()
  };
}

main()
  .then((result) => {
    console.log('\nBalance check complete!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
