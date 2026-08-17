import { ethers } from 'hardhat';

async function main() {
  console.log('Minting LXON tokens to deployer account...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Minting to account:', deployer.address);

  try {
    // Get the deployed LXON token address
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    console.log('LXON token address:', lxonTokenAddress);

    // Get contract instance
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress);
    
    // Check current balance
    const currentBalance = await lxonToken.balanceOf(deployer.address);
    console.log('Current LXON balance:', ethers.formatEther(currentBalance));
    
    // Mint 100,000 LXON tokens (adjust as needed)
    const mintAmount = ethers.parseEther('100000');
    console.log('Minting amount:', ethers.formatEther(mintAmount));
    
    // Mint tokens
    console.log('\nMinting tokens...');
    const mintTx = await lxonToken.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log('Tokens minted successfully!');
    
    // Check new balance
    const newBalance = await lxonToken.balanceOf(deployer.address);
    console.log('New LXON balance:', ethers.formatEther(newBalance));
    
    console.log('\n✅ Token minting successful!');
    console.log('You can now add liquidity to the AMM pool.');
    
  } catch (error) {
    console.error('❌ Token minting failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
