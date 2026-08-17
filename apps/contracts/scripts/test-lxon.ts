import { ethers } from 'hardhat';

async function main() {
  console.log('Testing LXON Token...');

  const [deployer, user1] = await ethers.getSigners();
  const lxonAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  const lxon = await ethers.getContractAt('LXON', lxonAddress);

  console.log('\n=== Token Info ===');
  const name = await lxon.name();
  const symbol = await lxon.symbol();
  const totalSupply = await lxon.totalSupply();
  const maxSupply = await lxon.MAX_SUPPLY();
  const initialSupply = await lxon.INITIAL_SUPPLY();
  
  console.log('Name:', name);
  console.log('Symbol:', symbol);
  console.log('Total Supply:', ethers.formatEther(totalSupply));
  console.log('Max Supply:', ethers.formatEther(maxSupply));
  console.log('Initial Supply:', ethers.formatEther(initialSupply));

  console.log('\n=== Deployer Balance ===');
  const deployerBalance = await lxon.balanceOf(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(deployerBalance));

  console.log('\n=== Transfer Test ===');
  const transferAmount = ethers.parseEther('1000');
  const tx = await lxon.transfer(user1.address, transferAmount);
  await tx.wait();
  
  const user1Balance = await lxon.balanceOf(user1.address);
  const deployerBalanceAfter = await lxon.balanceOf(deployer.address);
  
  console.log('Transferred:', ethers.formatEther(transferAmount), 'LXON to user1');
  console.log('User1 balance:', ethers.formatEther(user1Balance));
  console.log('Deployer balance after:', ethers.formatEther(deployerBalanceAfter));

  console.log('\n=== Approval Test ===');
  const approveAmount = ethers.parseEther('500');
  const approveTx = await lxon.approve(user1.address, approveAmount);
  await approveTx.wait();
  
  const allowance = await lxon.allowance(deployer.address, user1.address);
  console.log('Approved user1 to spend:', ethers.formatEther(allowance), 'LXON');

  console.log('\n=== Mint Test (Owner Only) ===');
  const mintAmount = ethers.parseEther('10000');
  const mintTx = await lxon.mint(deployer.address, mintAmount);
  await mintTx.wait();
  
  const newTotalSupply = await lxon.totalSupply();
  console.log('Minted:', ethers.formatEther(mintAmount), 'LXON');
  console.log('New total supply:', ethers.formatEther(newTotalSupply));

  console.log('\n=== Burn Test ===');
  const burnAmount = ethers.parseEther('1000');
  const burnTx = await lxon.burn(burnAmount);
  await burnTx.wait();
  
  const finalSupply = await lxon.totalSupply();
  console.log('Burned:', ethers.formatEther(burnAmount), 'LXON');
  console.log('Final total supply:', ethers.formatEther(finalSupply));

  console.log('\n✅ All LXON token tests passed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
