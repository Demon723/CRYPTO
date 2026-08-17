import { ethers } from 'hardhat';

async function main() {
  console.log('=== LXON Ecosystem Monitoring ===\n');
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }
  
  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Monitoring with account:', owner.address);

  try {
    // Contract addresses
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    const swapAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    const tokenSaleAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
    
    // Get contract instances
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    const swap = await ethers.getContractAt('SimpleSwap', swapAddress, owner);
    const tokenSale = await ethers.getContractAt('LXONTokenSale', tokenSaleAddress, owner);
    
    // Network information
    const network = await ethers.provider.getNetwork();
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    
    console.log('=== Network Information ===');
    console.log('Network:', network.name);
    console.log('Chain ID:', network.chainId);
    console.log('Current Block:', blockNumber);
    console.log('Block Timestamp:', block ? new Date(Number(block.timestamp) * 1000).toISOString() : 'N/A');
    
    // Token information
    console.log('\n=== LXON Token Information ===');
    const totalSupply = await lxonToken.totalSupply();
    const maxSupply = await lxonToken.MAX_SUPPLY();
    const ownerBalance = await lxonToken.balanceOf(owner.address);
    const tokenSaleBalance = await lxonToken.balanceOf(tokenSale.target);
    const swapBalance = await lxonToken.balanceOf(swap.target);
    
    console.log('Total Supply:', ethers.formatEther(totalSupply), 'LXON');
    console.log('Max Supply:', ethers.formatEther(maxSupply), 'LXON');
    console.log('Owner Balance:', ethers.formatEther(ownerBalance), 'LXON');
    console.log('Token Sale Balance:', ethers.formatEther(tokenSaleBalance), 'LXON');
    console.log('AMM Pool Balance:', ethers.formatEther(swapBalance), 'LXON');
    console.log('Circulating Supply:', ethers.formatEther(totalSupply - tokenSaleBalance - swapBalance), 'LXON');
    
    // AMM Pool information
    console.log('\n=== AMM Pool Information ===');
    const [reserveLXON, reserveNative] = await swap.getReserves();
    const feeRate = await swap.FEE_RATE();
    const feeDenominator = await swap.FEE_DENOMINATOR();
    
    console.log('LXON Reserve:', ethers.formatEther(reserveLXON), 'LXON');
    console.log('Native Reserve:', ethers.formatEther(reserveNative), 'Native');
    console.log('Pool Value (Native):', ethers.formatEther(reserveNative), 'Native');
    
    if (reserveLXON > 0n && reserveNative > 0n) {
      const pricePerLXON = Number(reserveNative) / Number(reserveLXON);
      const pricePerNative = Number(reserveLXON) / Number(reserveNative);
      console.log('Price per LXON:', pricePerLXON.toFixed(6), 'Native');
      console.log('Price per Native:', pricePerNative.toFixed(6), 'LXON');
    }
    
    console.log('Trading Fee:', (Number(feeRate) / Number(feeDenominator) * 100).toFixed(2), '%');
    
    // Token Sale information
    console.log('\n=== Token Sale Information ===');
    const tokensSold = await tokenSale.tokensSold();
    const saleActive = await tokenSale.saleActive();
    const saleStartTime = await tokenSale.saleStartTime();
    const saleEndTime = await tokenSale.saleEndTime();
    const purchaserCount = await tokenSale.getPurchaserCount();
    const tokenPrice = await tokenSale.TOKEN_PRICE();
    
    const saleCap = 1000000n * 10n**18n;
    const remainingTokens = saleCap - tokensSold;
    const saleProgress = (Number(tokensSold) / Number(saleCap)) * 100;
    
    console.log('Tokens Sold:', ethers.formatEther(tokensSold), 'LXON');
    console.log('Sale Cap:', ethers.formatEther(saleCap), 'LXON');
    console.log('Remaining Tokens:', ethers.formatEther(remainingTokens), 'LXON');
    console.log('Sale Progress:', saleProgress.toFixed(2), '%');
    console.log('Sale Active:', saleActive);
    console.log('Token Price:', ethers.formatEther(tokenPrice), 'Native per LXON');
    console.log('Purchaser Count:', purchaserCount.toString());
    console.log('Sale Start:', new Date(Number(saleStartTime) * 1000).toISOString());
    console.log('Sale End:', new Date(Number(saleEndTime) * 1000).toISOString());
    
    // Time remaining
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = Number(saleEndTime) - currentTime;
    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (24 * 60 * 60));
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
      console.log('Time Remaining:', `${days}d ${hours}h`);
    } else {
      console.log('Time Remaining: Sale ended');
    }
    
    // Account summary
    console.log('\n=== Account Summary ===');
    const nativeBalance = await ethers.provider.getBalance(owner.address);
    console.log('Owner Native Balance:', ethers.formatEther(nativeBalance), 'Native');
    console.log('Owner LXON Balance:', ethers.formatEther(ownerBalance), 'LXON');
    
    // Calculate total value
    const totalLXONValue = Number(ethers.formatEther(ownerBalance)) * (Number(reserveNative) / Number(reserveLXON));
    const totalValue = Number(ethers.formatEther(nativeBalance)) + totalLXONValue;
    console.log('Total Account Value:', totalValue.toFixed(6), 'Native tokens');
    
    // System health check
    console.log('\n=== System Health ===');
    const healthChecks = [];
    
    // Check if sale is active
    if (saleActive) {
      healthChecks.push({ name: 'Token Sale Active', status: '✅' });
    } else {
      healthChecks.push({ name: 'Token Sale Active', status: '❌' });
    }
    
    // Check if pool has liquidity
    if (reserveLXON > 0n && reserveNative > 0n) {
      healthChecks.push({ name: 'AMM Liquidity', status: '✅' });
    } else {
      healthChecks.push({ name: 'AMM Liquidity', status: '❌' });
    }
    
    // Check if tokens available for sale
    if (remainingTokens > 0n) {
      healthChecks.push({ name: 'Tokens Available', status: '✅' });
    } else {
      healthChecks.push({ name: 'Tokens Available', status: '❌' });
    }
    
    // Check if owner has tokens
    if (ownerBalance > 0n) {
      healthChecks.push({ name: 'Owner Has Tokens', status: '✅' });
    } else {
      healthChecks.push({ name: 'Owner Has Tokens', status: '❌' });
    }
    
    healthChecks.forEach(check => {
      console.log(`${check.status} ${check.name}`);
    });
    
    // Summary
    console.log('\n=== Summary ===');
    console.log('LXON Ecosystem Status: Operational');
    console.log('Total LXON in Circulation:', ethers.formatEther(totalSupply - tokenSaleBalance - swapBalance), 'LXON');
    console.log('AMM Trading Volume Available:', ethers.formatEther(reserveLXON), 'LXON');
    console.log('Token Sale Progress:', saleProgress.toFixed(2), '%');
    console.log('Current LXON Price:', (Number(reserveNative) / Number(reserveLXON)).toFixed(6), 'Native');
    
    console.log('\n✅ Monitoring completed successfully!');
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
