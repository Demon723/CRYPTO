import { ethers } from 'hardhat';

async function main() {
  console.log('Adding liquidity to LXON Native DEX...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Adding liquidity with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString(), '\n');

  try {
    // Get deployed contract addresses from deployment.json or use hardcoded addresses
    const TOKEN_ADDRESS = process.env.LXON_TOKEN_ADDRESS || 'YOUR_TOKEN_ADDRESS';
    const DEX_ADDRESS = process.env.LXON_DEX_ADDRESS || 'YOUR_DEX_ADDRESS';

    console.log('Connecting to contracts...');
    const lxonToken = await ethers.getContractAt('LXONNativeToken', TOKEN_ADDRESS);
    const lxonDEX = await ethers.getContractAt('LXONNativeDEX', DEX_ADDRESS);

    // Check if deployer has enough tokens
    const deployerBalance = await lxonToken.balanceOf(deployer.address);
    console.log('Current token balance:', ethers.formatEther(deployerBalance), 'XON');

    // Determine liquidity amount (adjust as needed)
    const liquidityAmount = ethers.parseEther('1000000'); // 1M XON
    
    if (deployerBalance < liquidityAmount) {
      console.log('Minting additional tokens for liquidity...');
      await lxonToken.mint(deployer.address, liquidityAmount - deployerBalance);
      console.log('Minted:', ethers.formatEther(liquidityAmount - deployerBalance), 'XON');
    }

    // Approve DEX to spend tokens
    console.log('Approving DEX to spend tokens...');
    await lxonToken.approve(DEX_ADDRESS, liquidityAmount);
    console.log('Approved:', ethers.formatEther(liquidityAmount), 'XON');

    // Add liquidity to DEX
    console.log('Adding liquidity to DEX...');
    const tx = await lxonDEX.addLiquidity(liquidityAmount);
    await tx.wait();
    console.log('Liquidity added successfully!');

    // Check liquidity pool status
    const poolReserves = await lxonDEX.getReserves(
      TOKEN_ADDRESS,
      TOKEN_ADDRESS
    );
    console.log('\nPool reserves:');
    console.log('Token0 reserve:', ethers.formatEther(poolReserves[0]), 'XON');
    console.log('Token1 reserve:', ethers.formatEther(poolReserves[1]), 'XON');

    console.log('\n✓ Liquidity addition complete!');
    console.log('\nTrading is now enabled on the LXON Native DEX.');
    console.log('Users can now swap XON tokens on the DEX.');

  } catch (error) {
    console.error('Liquidity addition failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });