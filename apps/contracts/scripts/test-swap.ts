import { ethers } from 'hardhat';

async function main() {
  console.log('Testing SimpleSwap AMM functionality...');
  
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
    const swapAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
    console.log('\n=== Contract Addresses ===');
    console.log('LXON Token:', lxonTokenAddress);
    console.log('SimpleSwap AMM:', swapAddress);

    // Get contract instances
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    const swap = await ethers.getContractAt('SimpleSwap', swapAddress, owner);
    
    // Check initial balances
    console.log('\n=== Initial Balances ===');
    const lxonBalance = await lxonToken.balanceOf(owner.address);
    const nativeBalance = await ethers.provider.getBalance(owner.address);
    console.log('LXON Balance:', ethers.formatEther(lxonBalance));
    console.log('Native Balance:', ethers.formatEther(nativeBalance));
    
    // Check AMM reserves
    console.log('\n=== AMM Reserves ===');
    const [reserveLXON, reserveNative] = await swap.getReserves();
    console.log('LXON Reserve:', ethers.formatEther(reserveLXON));
    console.log('Native Reserve:', ethers.formatEther(reserveNative));
    
    // Test 1: Get swap quotes
    console.log('\n=== Test 1: Swap Quotes ===');
    const swapAmount = ethers.parseEther('100'); // Swap 100 LXON
    const quote = await swap.getLXONToNativeQuote(swapAmount);
    console.log('Swap 100 LXON → Native:', ethers.formatEther(quote));
    
    const nativeSwapAmount = ethers.parseEther('0.01'); // Swap 0.01 native
    const nativeQuote = await swap.getNativeToLXONQuote(nativeSwapAmount);
    console.log('Swap 0.01 Native → LXON:', ethers.formatEther(nativeQuote));
    
    // Test 2: LXON to Native swap
    console.log('\n=== Test 2: LXON → Native Swap ===');
    const swapLXONAmount = ethers.parseEther('50'); // Swap 50 LXON
    console.log('Swapping', ethers.formatEther(swapLXONAmount), 'LXON for native tokens');
    
    // Approve LXON tokens for swap
    console.log('Approving LXON tokens...');
    const approveTx = await lxonToken.approve(swapAddress, swapLXONAmount);
    await approveTx.wait();
    console.log('LXON tokens approved');
    
    // Execute swap
    console.log('Executing swap...');
    const swapTx = await swap.swapLXONForNative(swapLXONAmount);
    await swapTx.wait();
    console.log('✅ Swap completed');
    
    // Check balances after swap
    console.log('\n=== Balances After LXON → Native Swap ===');
    const newLXONBalance = await lxonToken.balanceOf(owner.address);
    const newNativeBalance = await ethers.provider.getBalance(owner.address);
    console.log('LXON Balance:', ethers.formatEther(newLXONBalance));
    console.log('Native Balance:', ethers.formatEther(newNativeBalance));
    
    // Check new reserves
    console.log('\n=== AMM Reserves After Swap ===');
    const [newReserveLXON, newReserveNative] = await swap.getReserves();
    console.log('LXON Reserve:', ethers.formatEther(newReserveLXON));
    console.log('Native Reserve:', ethers.formatEther(newReserveNative));
    
    // Test 3: Native to LXON swap
    console.log('\n=== Test 3: Native → LXON Swap ===');
    const swapNativeAmount = ethers.parseEther('0.005'); // Swap 0.005 native
    console.log('Swapping', ethers.formatEther(swapNativeAmount), 'native for LXON tokens');
    
    // Execute swap
    console.log('Executing swap...');
    const swapNativeTx = await swap.swapNativeForLXON({ value: swapNativeAmount });
    await swapNativeTx.wait();
    console.log('✅ Swap completed');
    
    // Check final balances
    console.log('\n=== Final Balances ===');
    const finalLXONBalance = await lxonToken.balanceOf(owner.address);
    const finalNativeBalance = await ethers.provider.getBalance(owner.address);
    console.log('LXON Balance:', ethers.formatEther(finalLXONBalance));
    console.log('Native Balance:', ethers.formatEther(finalNativeBalance));
    
    // Check final reserves
    console.log('\n=== Final AMM Reserves ===');
    const [finalReserveLXON, finalReserveNative] = await swap.getReserves();
    console.log('LXON Reserve:', ethers.formatEther(finalReserveLXON));
    console.log('Native Reserve:', ethers.formatEther(finalReserveNative));
    
    console.log('\n✅ All swap tests completed successfully!');
    console.log('AMM is functioning correctly.');
    
  } catch (error) {
    console.error('❌ Swap test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
