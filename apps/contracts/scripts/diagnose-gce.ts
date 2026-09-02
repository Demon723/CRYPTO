import { ethers } from 'hardhat';

/**
 * Diagnose GCE network configuration and status
 */

async function main() {
  console.log("=== GCE Network Diagnosis ===\n");

  const [signer] = await ethers.getSigners();
  const provider = signer.provider;
  
  console.log("Connected to:", await provider.getNetwork());
  console.log("Signer address:", signer.address);
  console.log();

  // Check network ID
  const network = await provider.getNetwork();
  console.log("Chain ID:", network.chainId);
  console.log();

  // Check balance
  const balance = await provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log();

  // Check block number
  const blockNumber = await provider.getBlockNumber();
  console.log("Current block:", blockNumber);
  console.log();

  // Get latest block
  const latestBlock = await provider.getBlock("latest");
  console.log("Latest block hash:", latestBlock?.hash);
  console.log("Latest block number:", latestBlock?.number);
  console.log();

  // Check gas price
  try {
    const feeData = await provider.getFeeData();
    console.log("Gas price:", feeData.gasPrice?.toString());
    console.log("Max fee per gas:", feeData.maxFeePerGas?.toString());
    console.log("Max priority fee per gas:", feeData.maxPriorityFeePerGas?.toString());
  } catch (error) {
    console.log("Gas price check failed:", error);
  }
  console.log();

  // Test simple transaction
  console.log("Testing network connectivity...");
  try {
    const tx = await signer.sendTransaction({
      to: signer.address,
      value: 0
    });
    console.log("Test transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    await tx.wait();
    console.log("Test transaction confirmed!");
  } catch (error) {
    console.log("Test transaction failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
