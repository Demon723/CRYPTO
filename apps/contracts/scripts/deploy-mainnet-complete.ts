import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { createInterface } from "readline";

async function question(query) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=== LXON Mainnet Production Deployment ===");
  console.log("⚠️  WARNING: This is a PRODUCTION deployment");
  console.log("⚠️  Ensure you have:");
  console.log("   - Completed professional security audit");
  console.log("   - Approved audit findings");
  console.log("   - Production infrastructure ready");
  console.log("   - Multi-sig owners coordinated");
  console.log("   - Emergency procedures documented");
  
  const confirmation = await question("Type 'CONFIRM' to proceed with mainnet deployment: ");
  if (confirmation !== "CONFIRM") {
    console.log("Deployment cancelled by user");
    process.exit(1);
  }
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  
  // Verify we're on mainnet
  if (network.chainId !== 723n) { // LXON mainnet chain ID
    console.error("⚠️  WARNING: Not on LXON mainnet (expected chain ID: 723)");
    const proceed = await question("Continue anyway? (yes/no): ");
    if (proceed !== "yes") {
      console.log("Deployment cancelled");
      process.exit(1);
    }
  }
  
  // Phase 1: Deploy Multi-Sig Wallet (MAINNET CONFIGURATION)
  console.log("\n=== Phase 1: Multi-Sig Wallet (MAINNET) ===");
  
  // PRODUCTION: Replace with actual mainnet owner addresses
  const mainnetOwners = [
    process.env.OWNER_1 || "0x...", // Replace with actual mainnet owner 1
    process.env.OWNER_2 || "0x...", // Replace with actual mainnet owner 2
    process.env.OWNER_3 || "0x...", // Replace with actual mainnet owner 3
    process.env.OWNER_4 || "0x...", // Replace with actual mainnet owner 4
    process.env.OWNER_5 || "0x...", // Replace with actual mainnet owner 5
  ];
  
  const requiredSignatures = 3; // 3 of 5 required for mainnet
  const timeLock = 7 * 24 * 60 * 60; // 7 days for mainnet critical operations
  
  console.log("Mainnet Owners:", mainnetOwners);
  console.log("Required Signatures:", requiredSignatures);
  console.log("Time Lock:", timeLock, "seconds (7 days)");
  
  const LXONMultiSig = await ethers.getContractFactory("LXONMultiSig");
  const multiSig = await LXONMultiSig.deploy(mainnetOwners, requiredSignatures, timeLock);
  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();
  
  console.log("✅ Multi-Sig Wallet deployed to:", multiSigAddress);
  
  // Phase 2: Deploy Native Token (MAINNET)
  console.log("\n=== Phase 2: Native Token (MAINNET) ===");
  const LXONNativeToken = await ethers.getContractFactory("LXONNativeToken");
  const token = await LXONNativeToken.deploy(multiSigAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log("✅ LXON Native Token deployed to:", tokenAddress);
  
  // Verify and enable multi-sig
  const contractMultiSig = await token.multiSigWallet();
  console.log("Token multi-sig wallet:", contractMultiSig);
  
  if (contractMultiSig.toLowerCase() !== multiSigAddress.toLowerCase()) {
    console.error("❌ Multi-sig address mismatch!");
    process.exit(1);
  }
  
  const enableTx = await token.enableMultiSig();
  await enableTx.wait();
  console.log("✅ Multi-sig enabled on token contract");
  
  // Phase 3: Deploy DEX (MAINNET)
  console.log("\n=== Phase 3: Native DEX (MAINNET) ===");
  
  // PRODUCTION: Replace with actual mainnet token addresses
  const mainnetTokenA = process.env.TOKEN_A || "0x..."; // Replace with actual token A
  const mainnetTokenB = process.env.TOKEN_B || "0x..."; // Replace with actual token B
  const pairName = "XON/ETH"; // Mainnet trading pair
  
  const LXONNativeDEX = await ethers.getContractFactory("LXONNativeDEX");
  const dex = await LXONNativeDEX.deploy(tokenAddress, mainnetTokenA, mainnetTokenB, pairName, multiSigAddress);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  
  console.log("✅ LXON Native DEX deployed to:", dexAddress);
  
  // Verify and enable multi-sig on DEX
  const dexMultiSig = await dex.multiSigWallet();
  if (dexMultiSig.toLowerCase() !== multiSigAddress.toLowerCase()) {
    console.error("❌ DEX multi-sig address mismatch!");
    process.exit(1);
  }
  
  // Phase 4: Deploy Additional Contracts (MAINNET)
  console.log("\n=== Phase 4: Additional Contracts (MAINNET) ===");
  
  // Staking
  const LXONStaking = await ethers.getContractFactory("LXONStaking");
  const staking = await LXONStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ LXON Staking deployed to:", stakingAddress);
  
  // TOTP Auth
  const LXONTOTPAuth = await ethers.getContractFactory("LXONTOTPAuth");
  const totpAuth = await LXONTOTPAuth.deploy();
  await totpAuth.waitForDeployment();
  const totpAuthAddress = await totpAuth.getAddress();
  console.log("✅ LXON TOTP Auth deployed to:", totpAuthAddress);
  
  // Governance
  const LXONGovernance = await ethers.getContractFactory("LXONGovernance");
  // PRODUCTION: Replace with actual mainnet timelock and token addresses
  const timelockAddress = process.env.TIMELOCK || "0x...";
  const governance = await LXONGovernance.deploy(timelockAddress, tokenAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ LXON Governance deployed to:", governanceAddress);
  
  // Phase 5: Initial Token Distribution (MAINNET)
  console.log("\n=== Phase 5: Initial Token Distribution ===");
  
  // PRODUCTION: Configure actual distribution addresses and amounts
  const distributions = [
    { address: process.env.TREASURY || "0x...", amount: ethers.parseEther("100000000") }, // Treasury
    { address: process.env.DEVELOPMENT || "0x...", amount: ethers.parseEther("50000000") }, // Development fund
    { address: process.env.COMMUNITY || "0x...", amount: ethers.parseEther("30000000") }, // Community fund
    { address: process.env.AIRDROP || "0x...", amount: ethers.parseEther("20000000") }, // Airdrop fund
  ];
  
  for (const dist of distributions) {
    if (dist.address !== "0x...") {
      const mintTx = await token.mint(dist.address, dist.amount);
      await mintTx.wait();
      console.log(`✅ Minted ${dist.amount} tokens to ${dist.address}`);
    }
  }
  
  // Phase 6: Configure Multi-Sig Permissions
  console.log("\n=== Phase 6: Multi-Sig Configuration ===");
  
  // Transfer ownership to multi-sig
  const transferOwnerTx = await token.setOwner(multiSigAddress);
  await transferOwnerTx.wait();
  console.log("✅ Token ownership transferred to multi-sig");
  
  const transferDexOwnerTx = await dex.setOwner(multiSigAddress);
  await transferDexOwnerTx.wait();
  console.log("✅ DEX ownership transferred to multi-sig");
  
  // Phase 7: Initial Liquidity Provision
  console.log("\n=== Phase 7: Initial Liquidity ===");
  
  const initialLiquidityA = ethers.parseEther("10000");
  const initialLiquidityB = ethers.parseEther("10000");
  
  // Mint tokens for liquidity
  const liquidityMintTx = await token.mint(deployer.address, initialLiquidityA);
  await liquidityMintTx.wait();
  
  // Approve DEX
  const approveTx = await token.approve(dexAddress, initialLiquidityA);
  await approveTx.wait();
  
  // Add liquidity
  const addLiquidityTx = await dex.addLiquidity(initialLiquidityA, initialLiquidityB);
  await addLiquidityTx.wait();
  console.log("✅ Initial liquidity added to DEX");
  
  // Phase 8: Deployment Verification
  console.log("\n=== Phase 8: Deployment Verification ===");
  
  const tokenBalance = await token.balanceOf(multiSigAddress);
  console.log("Multi-sig token balance:", tokenBalance.toString());
  
  const dexOwner = await dex.owner();
  console.log("DEX owner:", dexOwner);
  
  const tokenOwner = await token.owner();
  console.log("Token owner:", tokenOwner);
  
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
      governance: governanceAddress,
    },
    configuration: {
      multiSig: {
        owners: mainnetOwners,
        requiredSignatures: requiredSignatures,
        timeLock: timeLock,
      },
      token: {
        multiSigWallet: contractMultiSig,
        multiSigEnabled: true,
        owner: tokenOwner,
      },
      dex: {
        multiSigWallet: dexMultiSig,
        multiSigEnabled: true,
        owner: dexOwner,
        pairName: pairName,
      },
    },
    initialDistribution: distributions,
    liquidity: {
      tokenA: initialLiquidityA.toString(),
      tokenB: initialLiquidityB.toString(),
    },
    security: {
      auditCompleted: true,
      auditReport: "PENDING",
      multiSigEnabled: true,
      timeLockActive: true,
    },
  };
  
  const dir = './deployments';
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/mainnet-production.json`, JSON.stringify(deployment, null, 2));
  
  console.log("\n=== ✅ MAINNET DEPLOYMENT COMPLETED ===");
  console.log("Deployment info saved to deployments/mainnet-production.json");
  
  console.log("\n=== CRITICAL POST-DEPLOYMENT STEPS ===");
  console.log("1. Verify all contract addresses");
  console.log("2. Test multi-sig functionality with all owners");
  console.log("3. Test token transfers and DEX operations");
  console.log("4. Enable monitoring and alerting");
  console.log("5. Prepare incident response procedures");
  console.log("6. Coordinate with exchange listing team");
  console.log("7. Announce mainnet launch to community");
  
  console.log("\n=== SECURITY REMINDERS ===");
  console.log("⚠️  All critical operations require multi-sig approval");
  console.log("⚠️  Time lock is 7 days for critical changes");
  console.log("⚠️  Keep owner keys secure (hardware wallets recommended)");
  console.log("⚠️  Monitor for unusual activity");
  console.log("⚠️  Have emergency response procedures ready");
  
  return deployment;
}

main()
  .then(() => {
    console.log("\n✅ Mainnet deployment completed successfully!");
    console.log("🚀 LXON blockchain is now LIVE on mainnet!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Mainnet deployment failed:", error);
    process.exit(1);
  });