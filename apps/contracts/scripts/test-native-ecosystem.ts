import { ethers } from 'hardhat';

async function main() {
  console.log('=== Testing LXON Native Ecosystem ===\n');

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    process.exit(1);
  }

  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Testing with account:', owner.address);

  try {
    // Get deployed contract addresses
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-native-ecosystem.json`;
    
    if (!fs.existsSync(deploymentFile)) {
      console.error('Native ecosystem deployment file not found');
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const tokenAddress = deploymentInfo.contracts.LXONNativeToken;
    const swapAddress = deploymentInfo.contracts.LXONSwap;

    console.log('Token Address:', tokenAddress);
    console.log('Swap Address:', swapAddress);

    // Get contract instances
    const token = await ethers.getContractAt('LXONNativeToken', tokenAddress, owner);
    const swap = await ethers.getContractAt('LXONSwap', swapAddress, owner);

    // Test 1: Token Information
    console.log('\n=== Test 1: Token Information ===');
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    const ownerBalance = await token.balanceOf(owner.address);

    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', ethers.formatEther(totalSupply));
    console.log('Max Supply:', ethers.formatEther(maxSupply));
    console.log('Owner Balance:', ethers.formatEther(ownerBalance));

    // Test 2: Swap Information
    console.log('\n=== Test 2: Swap Information ===');
    const [reserveNative, reserveToken] = await swap.getReserves();
    const feeRate = await swap.FEE_RATE();
    const feeDenominator = await swap.FEE_DENOMINATOR();

    console.log('Native Reserve:', ethers.formatEther(reserveNative));
    console.log('Token Reserve:', ethers.formatEther(reserveToken));
    console.log('Fee Rate:', feeRate.toString(), '/', feeDenominator.toString());
    console.log('Fee Percentage:', (Number(feeRate) / Number(feeDenominator) * 100).toFixed(2), '%');

    // Test 3: Calculate Price
    console.log('\n=== Test 3: Price Calculation ===');
    if (reserveToken > 0n && reserveNative > 0n) {
      const pricePerToken = Number(reserveNative) / Number(reserveToken);
      const pricePerNative = Number(reserveToken) / Number(reserveNative);
      console.log('Price per XON:', pricePerToken.toFixed(6), 'Native');
      console.log('Price per Native:', pricePerNative.toFixed(6), 'XON');
    }

    // Test 4: Swap Quote
    console.log('\n=== Test 4: Swap Quote ===');
    const testAmount = ethers.parseEther('100'); // 100 XON
    const quote = await swap.getAmountOut(testAmount);
    console.log('Swap 100 XON → Native:', ethers.formatEther(quote));

    // Test 5: Token Transfer
    console.log('\n=== Test 5: Token Transfer ===');
    const testAddress = owner.address;
    const transferAmount = ethers.parseEther('1');
    
    const balanceBefore = await token.balanceOf(testAddress);
    await token.transfer(testAddress, transferAmount);
    const balanceAfter = await token.balanceOf(testAddress);
    
    console.log('Balance Before:', ethers.formatEther(balanceBefore));
    console.log('Balance After:', ethers.formatEther(balanceAfter));
    console.log('✅ Token transfer successful');

    // Test 6: Token Approval
    console.log('\n=== Test 6: Token Approval ===');
    const approveAmount = ethers.parseEther('1000');
    await token.approve(swapAddress, approveAmount);
    const allowance = await token.allowance(owner.address, swapAddress);
    console.log('Approved Amount:', ethers.formatEther(allowance));
    console.log('✅ Token approval successful');

    // Test 7: Native Token Swap
    console.log('\n=== Test 7: Native Token Swap ===');
    const swapAmount = ethers.parseEther('0.1'); // 0.1 native
    const swapQuote = await swap.getAmountOut(swapAmount);
    
    console.log('Swapping', ethers.formatEther(swapAmount), 'Native for XON');
    console.log('Expected Output:', ethers.formatEther(swapQuote), 'XON');
    
    const swapTx = await swap.swapNativeForToken({ value: swapAmount });
    await swapTx.wait();
    console.log('✅ Native swap successful');

    // Test 8: Check Balances After Swap
    console.log('\n=== Test 8: Balances After Swap ===');
    const finalNativeBalance = await ethers.provider.getBalance(owner.address);
    const finalTokenBalance = await token.balanceOf(owner.address);
    
    console.log('Final Native Balance:', ethers.formatEther(finalNativeBalance));
    console.log('Final Token Balance:', ethers.formatEther(finalTokenBalance));

    console.log('\n=== ✅ All Native Ecosystem Tests Passed ===');

  } catch (error) {
    console.error('❌ Native ecosystem test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
