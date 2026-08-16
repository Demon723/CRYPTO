// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosPBT.sol";
import "../src/HeliosFactory.sol";

/**
 * @title DeployHelios
 * @notice Foundry deployment script for Helios Protocol.
 *         
 *         Run with:
 *         forge script script/Deploy.s.sol:DeployHelios \
 *           --rpc-url $RPC_URL \
 *           --broadcast \
 *           --verify \
 *           -vvvv
 */
contract DeployHelios is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Chip Registry (root of trust)
        HeliosChipRegistry registry = new HeliosChipRegistry();
        console.log("HeliosChipRegistry deployed at:", address(registry));

        // 2. Deploy Factory (protocol layer)
        HeliosFactory factory = new HeliosFactory(address(registry), treasury);
        console.log("HeliosFactory deployed at:", address(factory));

        // 3. Set factory as minter on registry
        registry.setMinter(address(factory), true);

        // 4. Deploy the first product collection: Helios Sun Coin
        HeliosPBT sunCoin = new HeliosPBT(
            "Helios Sun Coin",
            "HELIOS",
            address(registry),
            100,           // Max supply: 100 (Drop 1)
            0.25 ether,    // Mint price: 0.25 ETH
            treasury,
            1500           // 15% protocol fee
        );
        console.log("Helios Sun Coin (Product) deployed at:", address(sunCoin));

        // 5. Set Sun Coin as minter on registry
        registry.setMinter(address(sunCoin), true);

        vm.stopBroadcast();

        // Summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Ethereum mainnet or configured RPC");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Chip Registry:", address(registry));
        console.log("Factory:", address(factory));
        console.log("Sun Coin:", address(sunCoin));
    }
}
