import { ethers } from 'hardhat';

async function main() {
  console.log('Testing compilation of individual contracts...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  try {
    console.log('Compiling LXONTOTPAuth...');
    const LXONTOTPAuth = await ethers.getContractFactory('LXONTOTPAuth');
    console.log('✓ LXONTOTPAuth compiled successfully');
  } catch (error) {
    console.error('✗ LXONTOTPAuth compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONChipRegistry...');
    const LXONChipRegistry = await ethers.getContractFactory('LXONChipRegistry');
    console.log('✓ LXONChipRegistry compiled successfully');
  } catch (error) {
    console.error('✗ LXONChipRegistry compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONCardRegistry...');
    const LXONCardRegistry = await ethers.getContractFactory('LXONCardRegistry');
    console.log('✓ LXONCardRegistry compiled successfully');
  } catch (error) {
    console.error('✗ LXONCardRegistry compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONNativeToken...');
    const LXONNativeToken = await ethers.getContractFactory('LXONNativeToken');
    console.log('✓ LXONNativeToken compiled successfully');
  } catch (error) {
    console.error('✗ LXONNativeToken compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONNFT...');
    const LXONNFT = await ethers.getContractFactory('LXONNFT');
    console.log('✓ LXONNFT compiled successfully');
  } catch (error) {
    console.error('✗ LXONNFT compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONTBAccount...');
    const LXONTBAccount = await ethers.getContractFactory('LXONTBAccount');
    console.log('✓ LXONTBAccount compiled successfully');
  } catch (error) {
    console.error('✗ LXONTBAccount compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONGovernance...');
    const LXONGovernance = await ethers.getContractFactory('LXONGovernance');
    console.log('✓ LXONGGovernance compiled successfully');
  } catch (error) {
    console.error('✗ LXONGovernance compilation failed:', error.message);
  }

  try {
    console.log('Compiling LXONNativeDEX...');
    const LXONNativeDEX = await ethers.getContractFactory('LXONNativeDEX');
    console.log('✓ LXONNativeDEX compiled successfully');
  } catch (error) {
    console.error('✗ LXONNativeDEX compilation failed:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
}