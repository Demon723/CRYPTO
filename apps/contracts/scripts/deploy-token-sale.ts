import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying LXON Token Sale contract...');
  
  // Use the owner account from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    console.log('Please set PRIVATE_KEY in your .env file');
    process.exit(1);
  }
  
  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Deploying with owner account:', owner.address);

  try {
    // Get the deployed LXON token address
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    console.log('LXON token address:', lxonTokenAddress);

    // Sale duration: 30 days
    const saleDuration = 30 * 24 * 60 * 60; // 30 days in seconds
    
    console.log('\nDeploying TokenSale contract...');
    const TokenSale = await ethers.getContractFactory('LXONTokenSale');
    const tokenSale = await TokenSale.deploy(lxonTokenAddress, saleDuration);
    
    console.log('TokenSale deployed to:', tokenSale.target);
    
    // Fund the token sale with LXON tokens
    console.log('\nFunding token sale with LXON tokens...');
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    
    // Transfer 1 million LXON tokens to the sale contract
    const fundingAmount = ethers.parseEther('1000000');
    console.log('Funding amount:', ethers.formatEther(fundingAmount), 'LXON');
    
    const fundTx = await lxonToken.transfer(tokenSale.target, fundingAmount);
    await fundTx.wait();
    console.log('Tokens transferred to sale contract');
    
    // Verify the funding
    const saleBalance = await lxonToken.balanceOf(tokenSale.target);
    console.log('Sale contract balance:', ethers.formatEther(saleBalance), 'LXON');
    
    // Get sale information
    const saleInfo = await tokenSale.getSaleInfo();
    console.log('\n=== Token Sale Information ===');
    console.log('Tokens Sold:', saleInfo.tokensSold ? ethers.formatEther(saleInfo.tokensSold) : '0');
    console.log('Sale Cap:', saleInfo.saleCap ? ethers.formatEther(saleInfo.saleCap) : '0');
    console.log('Token Price:', saleInfo.tokenPrice ? ethers.formatEther(saleInfo.tokenPrice) : '0', 'native tokens');
    console.log('Sale Active:', saleInfo.saleActive);
    console.log('Sale Start:', saleInfo.saleStartTime ? new Date(Number(saleInfo.saleStartTime) * 1000).toISOString() : 'N/A');
    console.log('Sale End:', saleInfo.saleEndTime ? new Date(Number(saleInfo.saleEndTime) * 1000).toISOString() : 'N/A');
    console.log('Remaining Tokens:', saleInfo.remainingTokens ? ethers.formatEther(saleInfo.remainingTokens) : '0');
    
    // Save deployment info
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-token-sale.json`;
    
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      contracts: {
        LXONTokenSale: tokenSale.target,
        LXON: lxonTokenAddress
      },
      deployment: {
        timestamp: new Date().toISOString(),
        deployer: owner.address,
        saleDuration: saleDuration,
        fundingAmount: ethers.formatEther(fundingAmount)
      }
    };
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log('\nDeployment info saved to:', deploymentFile);
    
    console.log('\n✅ Token sale contract deployed and funded successfully!');
    console.log('Users can now buy LXON tokens at the sale contract.');
    
  } catch (error) {
    console.error('❌ Token sale deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
