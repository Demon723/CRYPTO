// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosPBTv2.sol";
import "../src/HeliosFactory.sol";

/**
 * @title DeployHeliosV2
 * @notice Deploys the full Helios Protocol with v2 features:
 *         - Founder-gated lifecycle (activate/freeze/deactivate)
 *         - Tap-to-bind wallet
 *         - NFT-as-key utility
 */
contract DeployHeliosV2 is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Chip Registry
        HeliosChipRegistry registry = new HeliosChipRegistry();
        console.log("HeliosChipRegistry:", address(registry));

        // 2. Deploy Factory
        HeliosFactory factory = new HeliosFactory(address(registry), treasury);
        console.log("HeliosFactory:", address(factory));

        // 3. Deploy v2 Product: Helios Sun Coin
        HeliosPBTv2 sunCoin = new HeliosPBTv2(
            "Helios Sun Coin",
            "HELIOS",
            address(registry),
            100,           // Max supply
            0.25 ether,    // Mint price
            treasury,
            1500           // 15% protocol fee
        );
        console.log("HeliosPBTv2 (Sun Coin):", address(sunCoin));

        // 4. Authorize
        registry.setMinter(address(sunCoin), true);
        registry.setMinter(address(factory), true);

        // 5. Add additional founders (optional)
        // sunCoin.setFounder(0x..., true);

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Chip Registry:", address(registry));
        console.log("Factory:", address(factory));
        console.log("Sun Coin v2:", address(sunCoin));
    }
}
