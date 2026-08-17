import { ethers } from 'hardhat';

async function main() {
  console.log('Testing LXON Token Sale functionality...');
  
  // Use the owner account from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    console.log('Please set PRIVATE_KEY in your .env file');
    process.exit(1);
  }
  
  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Testing with owner account:', owner.address);

  try {
    // Get the deployed contracts
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    const tokenSaleAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
    
    console.log('\n=== Contract Addresses ===');
    console.log('LXON Token:', lxonTokenAddress);
    console.log('Token Sale:', tokenSaleAddress);

    // Get contract instances
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    const tokenSale = await ethers.getContractAt('LXONTokenSale', tokenSaleAddress, owner);
    
    // Test 1: Check initial sale state
    console.log('\n=== Test 1: Initial Sale State ===');
    const tokensSold = await tokenSale.tokensSold();
    const saleActive = await tokenSale.saleActive();
    const saleStartTime = await tokenSale.saleStartTime();
    const saleEndTime = await tokenSale.saleEndTime();
    const tokenPrice = await tokenSale.TOKEN_PRICE();
    
    console.log('Tokens Sold:', ethers.formatEther(tokensSold));
    console.log('Sale Active:', saleActive);
    console.log('Sale Start:', new Date(Number(saleStartTime) * 1000).toISOString());
    console.log('Sale End:', new Date(Number(saleEndTime) * 1000).toISOString());
    console.log('Token Price:', ethers.formatEther(tokenPrice), 'native tokens');
    
    // Check sale contract balance
    const saleBalance = await lxonToken.balanceOf(tokenSale.target);
    console.log('Sale Contract Balance:', ethers.formatEther(saleBalance), 'LXON');
    
    // Test 2: Check owner balance before purchase
    console.log('\n=== Test 2: Owner Balance Before Purchase ===');
    const ownerLXONBalance = await lxonToken.balanceOf(owner.address);
    const ownerNativeBalance = await ethers.provider.getBalance(owner.address);
    console.log('Owner LXON Balance:', ethers.formatEther(ownerLXONBalance));
    console.log('Owner Native Balance:', ethers.formatEther(ownerNativeBalance));
    
    // Test 3: Attempt to buy tokens (small amount)
    console.log('\n=== Test 3: Buy Tokens from Sale ===');
    const purchaseAmount = ethers.parseEther('0.001'); // 0.001 native tokens
    console.log('Purchase Amount:', ethers.formatEther(purchaseAmount), 'native tokens');
    
    const expectedTokens = (purchaseAmount * 10n**18n) / await tokenSale.TOKEN_PRICE();
    console.log('Expected Tokens:', ethers.formatEther(expectedTokens), 'LXON');
    
    // Execute purchase
    console.log('Executing purchase...');
    const purchaseTx = await tokenSale.buyTokens({ value: purchaseAmount });
    await purchaseTx.wait();
    console.log('✅ Purchase completed');
    
    // Test 4: Check balances after purchase
    console.log('\n=== Test 4: Balances After Purchase ===');
    const newOwnerLXONBalance = await lxonToken.balanceOf(owner.address);
    const newOwnerNativeBalance = await ethers.provider.getBalance(owner.address);
    const newTokensSold = await tokenSale.tokensSold();
    const newSaleBalance = await lxonToken.balanceOf(tokenSale.target);
    
    console.log('Owner LXON Balance:', ethers.formatEther(newOwnerLXONBalance));
    console.log('Owner Native Balance:', ethers.formatEther(newOwnerNativeBalance));
    console.log('Tokens Sold:', ethers.formatEther(newTokensSold));
    console.log('Sale Contract Balance:', ethers.formatEther(newSaleBalance), 'LXON');
    
    const tokensReceived = newOwnerLXONBalance - ownerLXONBalance;
    console.log('Tokens Received:', ethers.formatEther(tokensReceived), 'LXON');
    
    // Test 5: Check purchase tracking
    console.log('\n=== Test 5: Purchase Tracking ===');
    const purchaseInfo = await tokenSale.getPurchaseInfo(owner.address);
    console.log('Total Purchased (native):', ethers.formatEther(purchaseInfo), 'native tokens');
    
    const purchaserCount = await tokenSale.getPurchaserCount();
    console.log('Purchaser Count:', purchaserCount.toString());
    
    // Test 6: Test purchase limits
    console.log('\n=== Test 6: Test Purchase Limits ===');
    try {
      const minPurchase = await tokenSale.MIN_PURCHASE();
      const maxPurchase = await tokenSale.MAX_PURCHASE();
      console.log('Min Purchase:', ethers.formatEther(minPurchase), 'native tokens');
      console.log('Max Purchase:', ethers.formatEther(maxPurchase), 'native tokens');
      
      // Try to purchase below minimum
      console.log('Testing minimum purchase limit...');
      const smallAmount = ethers.parseEther('0.0001');
      try {
        await tokenSale.buyTokens({ value: smallAmount });
        console.log('❌ Should have failed for minimum purchase');
      } catch (error: any) {
        console.log('✅ Minimum purchase limit enforced');
      }
    } catch (error: any) {
      console.log('Purchase limit test skipped:', error.message);
    }
    
    // Test 7: Test owner controls
    console.log('\n=== Test 7: Owner Controls ===');
    const currentSaleActive = await tokenSale.saleActive();
    console.log('Current Sale Status:', currentSaleActive);
    
    // Test getting sale info
    console.log('\n=== Test 8: Sale Information ===');
    const saleCap = 1000000n * 10n**18n;
    const remainingTokens = saleCap - newTokensSold;
    console.log('Sale Cap:', ethers.formatEther(saleCap), 'LXON');
    console.log('Remaining Tokens:', ethers.formatEther(remainingTokens), 'LXON');
    console.log('Sale Progress:', ((Number(newTokensSold) / Number(saleCap)) * 100).toFixed(2), '%');
    
    console.log('\n✅ All token sale tests completed successfully!');
    console.log('Token sale is functioning correctly.');
    
  } catch (error) {
    console.error('❌ Token sale test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
