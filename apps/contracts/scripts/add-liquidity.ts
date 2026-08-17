import { ethers } from 'hardhat';

async function main() {
  console.log('Adding liquidity to SimpleSwap AMM...');
  
  // Use the owner account from private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY environment variable not set');
    console.log('Please set PRIVATE_KEY in your .env file');
    process.exit(1);
  }
  
  const owner = new ethers.Wallet(privateKey, ethers.provider);
  console.log('Adding liquidity with owner account:', owner.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(owner.address)));

  try {
    // Get the deployed SimpleSwap contract address
    const fs = require('fs');
    const network = await ethers.provider.getNetwork();
    const deploymentFile = `./deployments/${Number(network.chainId)}-swap.json`;
    
    if (!fs.existsSync(deploymentFile)) {
      console.error('AMM deployment file not found. Please deploy AMM first.');
      console.log('Run: npx hardhat run scripts/deploy-swap-production.ts --network localhost');
      process.exit(1);
    }
    
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const swapAddress = deploymentInfo.contracts.SimpleSwap;
    const lxonTokenAddress = deploymentInfo.contracts.LXON;
    
    console.log('SimpleSwap address:', swapAddress);
    console.log('LXON token address:', lxonTokenAddress);

    // Get contract instances
    const swap = await ethers.getContractAt('SimpleSwap', swapAddress, owner);
    const lxonToken = await ethers.getContractAt('LXON', lxonTokenAddress, owner);
    
    // Check current reserves
    const [reserveLXON, reserveNative] = await swap.getReserves();
    console.log('\nCurrent reserves:');
    console.log('LXON:', ethers.formatEther(reserveLXON));
    console.log('Native:', ethers.formatEther(reserveNative));
    
    // Define liquidity amounts (adjust these values as needed)
    const lxonAmount = ethers.parseEther('10000'); // 10,000 LXON
    const nativeAmount = ethers.parseEther('1'); // 1 native token
    
    console.log('\nAdding liquidity:');
    console.log('LXON amount:', ethers.formatEther(lxonAmount));
    console.log('Native amount:', ethers.formatEther(nativeAmount));
    
    // Check if owner has enough LXON tokens
    const lxonBalance = await lxonToken.balanceOf(owner.address);
    console.log('Owner LXON balance:', ethers.formatEther(lxonBalance));
    
    if (lxonBalance < lxonAmount) {
      console.error('Insufficient LXON tokens. Need:', ethers.formatEther(lxonAmount), 'Have:', ethers.formatEther(lxonBalance));
      console.log('Please mint or transfer LXON tokens to the owner account first.');
      process.exit(1);
    }
    
    // Approve LXON tokens for the swap contract
    console.log('\nApproving LXON tokens...');
    const approveTx = await lxonToken.approve(swapAddress, lxonAmount);
    await approveTx.wait();
    console.log('LXON tokens approved');
    
    // Add liquidity
    console.log('\nAdding liquidity to AMM...');
    const addLiquidityTx = await swap.addLiquidity(lxonAmount, nativeAmount, { value: nativeAmount });
    await addLiquidityTx.wait();
    console.log('Liquidity added successfully!');
    
    // Check new reserves
    const [newReserveLXON, newReserveNative] = await swap.getReserves();
    console.log('\nNew reserves:');
    console.log('LXON:', ethers.formatEther(newReserveLXON));
    console.log('Native:', ethers.formatEther(newReserveNative));
    
    console.log('\n✅ Liquidity added successfully!');
    console.log('Trading is now enabled for LXON ↔ Native token pair');
    
  } catch (error) {
    console.error('❌ Adding liquidity failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
