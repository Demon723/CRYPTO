// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosCardRegistry.sol";
import "../src/HeliosTBAccount.sol";
import "../src/HeliosPBTv3.sol";
import "../src/HeliosFactory.sol";

/**
 * @title DeployHeliosV3
 * @notice Deploys the complete Helios Protocol v3 with:
 *         - Founder-gated lifecycle
 *         - Tap-to-bind wallet
 *         - NFT-as-key utility
 *         - PREMIUM: Amex-style card registration
 *         - PREMIUM: ERC-6551 hardware wallet
 *         - PREMIUM: Tap-to-pay
 */
contract DeployHeliosV3 is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Chip Registry
        HeliosChipRegistry chipRegistry = new HeliosChipRegistry();
        console.log("HeliosChipRegistry:", address(chipRegistry));

        // 2. Deploy Card Registry
        HeliosCardRegistry cardRegistry = new HeliosCardRegistry();
        console.log("HeliosCardRegistry:", address(cardRegistry));

        // 3. Deploy TBA Implementation
        HeliosTBAccount tbaImpl = new HeliosTBAccount();
        console.log("HeliosTBAccount (impl):", address(tbaImpl));

        // 4. Deploy Factory
        HeliosFactory factory = new HeliosFactory(address(chipRegistry), treasury);
        console.log("HeliosFactory:", address(factory));

        // 5. Deploy v3 Product: Helios Sun Coin
        HeliosPBTv3 sunCoin = new HeliosPBTv3(
            "Helios Sun Coin",
            "HELIOS",
            address(chipRegistry),
            address(cardRegistry),
            100,           // Max supply
            0.25 ether,    // Mint price
            treasury,
            1500           // 15% protocol fee
        );
        console.log("HeliosPBTv3 (Sun Coin):", address(sunCoin));

        // 6. Wire everything
        sunCoin.setTBAImplementation(address(tbaImpl));
        chipRegistry.setMinter(address(sunCoin), true);
        chipRegistry.setMinter(address(factory), true);
        cardRegistry.setRegistrar(address(sunCoin), true);

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Chip Registry:", address(chipRegistry));
        console.log("Card Registry:", address(cardRegistry));
        console.log("TBA Implementation:", address(tbaImpl));
        console.log("Factory:", address(factory));
        console.log("Sun Coin v3:", address(sunCoin));
        console.log("\n=== PREMIUM TIERS ===");
        console.log("Genesis (0) and Supernova (4) get:");
        console.log("  - Unique card number (H-XXXX-XXXX-XXXX-X)");
        console.log("  - Registered cardholder identity");
        console.log("  - ERC-6551 Token Bound Account");
        console.log("  - Tap-to-pay transaction execution");
    }
}
