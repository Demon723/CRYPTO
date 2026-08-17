import { ethers } from 'hardhat';

async function main() {
  console.log('=== LXON Asset Lookup Program ===\n');
  
  // Use the owner account from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    console.log('Please set PRIVATE_KEY in your .env file');
    process.exit(1);
  }
  
  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Querying with account:', owner.address);

  try {
    // Get the deployed contracts
    const lxonTokenAddress = '0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00';
    const swapAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
    
    // Get contract instances
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    const swap = await ethers.getContractAt('SimpleSwap', swapAddress, owner);
    
    // Get command line arguments for address lookup
    const targetAddress = process.argv[2] || owner.address;
    console.log('Target Address:', targetAddress);
    
    console.log('\n=== Account Information ===');
    const nativeBalance = await ethers.provider.getBalance(targetAddress);
    console.log('Native Token Balance:', ethers.formatEther(nativeBalance));
    
    console.log('\n=== LXON Token Information ===');
    const lxonBalance = await lxonToken.balanceOf(targetAddress);
    console.log('LXON Balance:', ethers.formatEther(lxonBalance));
    
    // Get token information
    console.log('\n=== Token Details ===');
    const name = await lxonToken.name();
    const symbol = await lxonToken.symbol();
    const decimals = await lxonToken.decimals();
    const totalSupply = await lxonToken.totalSupply();
    const maxSupply = await lxonToken.MAX_SUPPLY();
    
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals);
    console.log('Total Supply:', ethers.formatEther(totalSupply));
    console.log('Max Supply:', ethers.formatEther(maxSupply));
    
    console.log('\n=== AMM Pool Information ===');
    const [reserveLXON, reserveNative] = await swap.getReserves();
    console.log('LXON Reserve:', ethers.formatEther(reserveLXON));
    console.log('Native Reserve:', ethers.formatEther(reserveNative));
    
    // Calculate pool value
    const poolValueNative = ethers.formatEther(reserveNative);
    console.log('Pool Value (Native):', poolValueNative);
    
    // Calculate price
    if (reserveLXON > 0n && reserveNative > 0n) {
      const pricePerLXON = Number(reserveNative) / Number(reserveLXON);
      const pricePerNative = Number(reserveLXON) / Number(reserveNative);
      console.log('Price per LXON (in Native):', pricePerLXON.toFixed(18));
      console.log('Price per Native (in LXON):', pricePerNative.toFixed(18));
    }
    
    // Get swap quotes
    console.log('\n=== Swap Quotes ===');
    const testAmount = ethers.parseEther('100');
    const lxonToNativeQuote = await swap.getLXONToNativeQuote(testAmount);
    console.log('100 LXON → Native:', ethers.formatEther(lxonToNativeQuote));
    
    const nativeTestAmount = ethers.parseEther('0.01');
    const nativeToLXONQuote = await swap.getNativeToLXONQuote(nativeTestAmount);
    console.log('0.01 Native → LXON:', ethers.formatEther(nativeToLXONQuote));
    
    // Get AMM fee information
    console.log('\n=== AMM Fee Information ===');
    const feeRate = await swap.FEE_RATE();
    const feeDenominator = await swap.FEE_DENOMINATOR();
    const feeRecipient = await swap.feeRecipient();
    
    console.log('Fee Rate:', feeRate.toString(), '/', feeDenominator.toString());
    console.log('Fee Percentage:', (Number(feeRate) / Number(feeDenominator) * 100).toFixed(2) + '%');
    console.log('Fee Recipient:', feeRecipient);
    
    // Get network information
    console.log('\n=== Network Information ===');
    const network = await ethers.provider.getNetwork();
    console.log('Network:', network.name);
    console.log('Chain ID:', network.chainId);
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Current Block:', blockNumber);
    
    console.log('\n=== Summary ===');
    console.log('Account:', targetAddress);
    console.log('LXON Balance:', ethers.formatEther(lxonBalance));
    console.log('Native Balance:', ethers.formatEther(nativeBalance));
    console.log('Total Asset Value:', (Number(ethers.formatEther(lxonBalance)) * (Number(reserveNative) / Number(reserveLXON)) + Number(ethers.formatEther(nativeBalance))).toFixed(18), 'Native tokens');
    
  } catch (error) {
    console.error('❌ Asset lookup failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
