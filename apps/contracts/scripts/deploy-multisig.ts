import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LXON Multi-Signature Wallet...");

  // Define initial owners (example addresses - replace with actual owner addresses)
  const owners = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Owner 1
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Owner 2
    "0x3C44CdDdB6a900fa2b585dd299e03d12f4a1cB47", // Owner 3
  ];

  const requiredSignatures = 2; // Require 2 out of 3 signatures
  const timeLock = 24 * 60 * 60; // 24 hours time lock for critical operations

  // Deploy Multi-Sig Wallet
  const LXONMultiSig = await ethers.getContractFactory("LXONMultiSig");
  const multiSig = await LXONMultiSig.deploy(owners, requiredSignatures, timeLock);
  
  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();
  
  console.log("LXON Multi-Signature Wallet deployed to:", multiSigAddress);
  console.log("Owners:", owners);
  console.log("Required signatures:", requiredSignatures);
  console.log("Time lock:", timeLock, "seconds (24 hours)");

  // Verify deployment
  const ownerCount = await multiSig.getOwnerCount();
  console.log("Owner count:", ownerCount.toString());

  const isOwner1 = await multiSig.isOwnerAddress(owners[0]);
  console.log("Owner 1 verified:", isOwner1);

  console.log("\nMulti-Sig Configuration:");
  console.log("- Time Lock: 24 hours for critical operations");
  console.log("- Required Signatures: 2 of 3");
  console.log("- Owners can be added/removed via multi-sig transactions");
  console.log("- Requirements can be changed via multi-sig transactions");
  console.log("- Time lock can be adjusted via multi-sig transactions");

  console.log("\nNext Steps:");
  console.log("1. Update LXONNativeToken constructor with multi-sig address");
  console.log("2. Update LXONNativeDEX constructor with multi-sig address");
  console.log("3. Deploy updated contracts with multi-sig integration");
  console.log("4. Test multi-sig functionality with test transactions");
  console.log("5. Verify that critical operations require multi-sig approval");

  return { multiSigAddress, owners, requiredSignatures, timeLock };
}

main()
  .then((result) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });