import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";

async function main() {
  console.log("=== LXON Testnet Complete Deployment ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  
  // Phase 1: Deploy Multi-Sig Wallet
  console.log("\n=== Phase 1: Multi-Sig Wallet ===");
  const owners = [
    deployer.address,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Owner 2 (test)
    "0x3C44CdDdB6a900fa2b585dd299e03d12f4a1cB47", // Owner 3 (test)
  ];
  
  const requiredSignatures = 2;
  const timeLock = 24 * 60 * 60; // 24 hours for testnet (shorter than mainnet)
  
  const LXONMultiSig = await ethers.getContractFactory("LXONMultiSig");
  const multiSig = await LXONMultiSig.deploy(owners, requiredSignatures, timeLock);
  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();
  
  console.log("Multi-Sig Wallet deployed to:", multiSigAddress);
  console.log("Owners:", owners);
  console.log("Required signatures:", requiredSignatures);
  console.log("Time lock:", timeLock, "seconds");
  
  // Phase 2: Deploy Native Token with Multi-Sig
  console.log("\n=== Phase 2: Native Token ===");
  const LXONNativeToken = await ethers.getContractFactory("LXONNativeToken");
  const token = await LXONNativeToken.deploy(multiSigAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log("LXON Native Token deployed to:", tokenAddress);
  
  // Verify multi-sig integration
  const contractMultiSig = await token.multiSigWallet();
  const multiSigEnabled = await token.multiSigEnabled();
  console.log("Token multi-sig wallet:", contractMultiSig);
  console.log("Multi-sig enabled:", multiSigEnabled);
  
  // Phase 3: Deploy DEX with Multi-Sig
  console.log("\n=== Phase 3: Native DEX ===");
  const tokenA = deployer.address; // Using deployer as token A placeholder
  const tokenB = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Token B placeholder
  const pairName = "XON/TEST";
  
  const LXONNativeDEX = await ethers.getContractFactory("LXONNativeDEX");
  const dex = await LXONNativeDEX.deploy(tokenAddress, tokenA, tokenB, pairName, multiSigAddress);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  
  console.log("LXON Native DEX deployed to:", dexAddress);
  
  // Verify DEX multi-sig integration
  const dexMultiSig = await dex.multiSigWallet();
  const dexMultiSigEnabled = await dex.multiSigEnabled();
  console.log("DEX multi-sig wallet:", dexMultiSig);
  console.log("DEX multi-sig enabled:", dexMultiSigEnabled);
  
  // Phase 4: Deploy Staking Contract
  console.log("\n=== Phase 4: Staking Contract ===");
  const LXONStaking = await ethers.getContractFactory("LXONStaking");
  const staking = await LXONStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  
  console.log("LXON Staking deployed to:", stakingAddress);
  
  // Phase 5: Deploy TOTP Auth
  console.log("\n=== Phase 5: TOTP Auth ===");
  const LXONTOTPAuth = await ethers.getContractFactory("LXONTOTPAuth");
  const totpAuth = await LXONTOTPAuth.deploy();
  await totpAuth.waitForDeployment();
  const totpAuthAddress = await totpAuth.getAddress();
  
  console.log("LXON TOTP Auth deployed to:", totpAuthAddress);
  
  // Phase 6: Fund Multi-Sig with Test Tokens
  console.log("\n=== Phase 6: Fund Multi-Sig ===");
  const fundAmount = ethers.parseEther("1000");
  const fundTx = await token.transfer(multiSigAddress, fundAmount);
  await fundTx.wait();
  
  console.log("Funded multi-sig with 1000 tokens");
  
  // Phase 7: Test Multi-Sig Functionality
  console.log("\n=== Phase 7: Test Multi-Sig ===");
  
  // Submit a test transaction
  const testDestination = deployer.address;
  const testValue = ethers.parseEther("1");
  const testData = "0x";
  
  const submitTx = await multiSig.submitTransaction(testDestination, testValue, testData);
  const submitReceipt = await submitTx.wait();
  
  const txId = 0; // First transaction
  console.log("Test transaction submitted, ID:", txId);
  
  // Confirm transaction (deployer as first owner)
  const confirmTx = await multiSig.confirmTransaction(txId);
  await confirmTx.wait();
  console.log("Transaction confirmed by owner 1");
  
  // Get confirmation count
  const confirmations = await multiSig.getConfirmationCount(txId);
  console.log("Confirmation count:", confirmations.toString());
  
  // Save deployment information
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      multiSig: multiSigAddress,
      nativeToken: tokenAddress,
      nativeDEX: dexAddress,
      staking: stakingAddress,
      totpAuth: totpAuthAddress,
    },
    configuration: {
      multiSig: {
        owners: owners,
        requiredSignatures: requiredSignatures,
        timeLock: timeLock,
      },
      token: {
        multiSigWallet: contractMultiSig,
        multiSigEnabled: multiSigEnabled,
      },
      dex: {
        multiSigWallet: dexMultiSig,
        multiSigEnabled: dexMultiSigEnabled,
      },
    },
    testResults: {
      multiSigTest: {
        transactionId: txId,
        confirmations: confirmations.toString(),
        status: "SUBMITTED_AND_CONFIRMED",
      },
    },
  };
  
  const dir = './deployments';
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/testnet-complete.json`, JSON.stringify(deployment, null, 2));
  
  console.log("\n=== Deployment Summary ===");
  console.log("All contracts deployed successfully to testnet");
  console.log("Deployment info saved to deployments/testnet-complete.json");
  
  console.log("\n=== Next Steps ===");
  console.log("1. Test multi-sig execution with 2nd owner confirmation");
  console.log("2. Test token contract functionality");
  console.log("3. Test DEX functionality with multi-sig protected functions");
  console.log("4. Test staking contract");
  console.log("5. Test TOTP authentication");
  console.log("6. Verify all security improvements work as expected");
  
  return deployment;
}

main()
  .then(() => {
    console.log("\n✅ Testnet deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Testnet deployment failed:", error);
    process.exit(1);
  });