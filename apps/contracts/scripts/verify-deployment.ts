import { ethers } from 'hardhat';

async function main() {
  console.log('Verifying LXON Token Deployment...');
  
  const deployedAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
  
  try {
    const lxon = await ethers.getContractAt('LXON', deployedAddress);
    
    console.log('\n=== Contract Verification ===');
    const name = await lxon.name();
    const symbol = await lxon.symbol();
    const totalSupply = await lxon.totalSupply();
    const maxSupply = await lxon.MAX_SUPPLY();
    const initialSupply = await lxon.INITIAL_SUPPLY();
    const decimals = await lxon.decimals();
    
    console.log('Contract Address:', deployedAddress);
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals);
    console.log('Total Supply:', ethers.formatEther(totalSupply));
    console.log('Max Supply:', ethers.formatEther(maxSupply));
    console.log('Initial Supply:', ethers.formatEther(initialSupply));
    
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await lxon.balanceOf(deployer.address);
    console.log('Deployer Balance:', ethers.formatEther(deployerBalance));
    
    const owner = await lxon.owner();
    console.log('Contract Owner:', owner);
    
    console.log('\n✅ Contract verification successful!');
    console.log('Your LXON tokens are now live on the blockchain!');
    
  } catch (error) {
    console.error('Verification failed:', error);
    console.log('\nNote: If verification fails, make sure:');
    console.log('1. The blockchain node is running');
    console.log('2. The RPC endpoint is accessible');
    console.log('3. The contract address is correct');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
