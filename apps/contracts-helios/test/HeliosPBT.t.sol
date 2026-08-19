// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosPBT.sol";
import "../src/HeliosFactory.sol";

contract HeliosPBTTest is Test {
    HeliosChipRegistry registry;
    HeliosPBT sunCoin;
    HeliosFactory factory;

    address deployer = address(1);
    address user = address(2);
    address buyer = address(3);
    address treasury = address(4);

    // Test chip keypair (generated off-chain)
    uint256 chipPrivateKey = 0xabc123;
    address chipPublicKey;

    function setUp() public {
        vm.startPrank(deployer);

        chipPublicKey = vm.addr(chipPrivateKey);

        registry = new HeliosChipRegistry();
        factory = new HeliosFactory(address(registry), treasury);

        sunCoin = new HeliosPBT(
            "Helios Sun Coin",
            "HELIOS",
            address(registry),
            100,
            0.25 ether,
            treasury,
            1500
        );

        vm.stopPrank();

        vm.prank(deployer);
        registry.setMinter(address(sunCoin), true);
        vm.prank(deployer);
        registry.setMinter(address(factory), true);
    }

    function test_Mint() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);

        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        assertEq(sunCoin.ownerOf(1), user);
        HeliosPBT.TokenState memory s = sunCoin.getTokenState(1);
        assertEq(s.tapCount, 0);
        assertEq(s.tier, 0); // Genesis
    }

    function test_Tap() public {
        // Mint first
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        // Create tap signature
        uint256 nonce = 123;
        bytes32 hash = keccak256(abi.encodePacked(
            "TAP",
            uint256(1),
            nonce,
            block.timestamp / 300
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(user);
        sunCoin.tap(1, nonce, sig);

        HeliosPBT.TokenState memory s2 = sunCoin.getTokenState(1);
        assertEq(s2.tapCount, 1);
    }

    function test_TransferWithProof() public {
        // Mint to user
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        // Create transfer signature
        uint256 nonce = 456;
        bytes32 hash = keccak256(abi.encodePacked(
            "TRANSFER",
            uint256(1),
            buyer,
            nonce,
            block.chainid
        ));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(user);
        sunCoin.transferWithProof(1, buyer, nonce, sig);

        assertEq(sunCoin.ownerOf(1), buyer);
    }

    function test_RevertDirectTransfer() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        vm.prank(user);
        vm.expectRevert("HeliosPBT: use transferWithProof");
        sunCoin.transferFrom(user, buyer, 1);
    }

    function test_FactoryDeployCollection() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);

        address newCollection = factory.deployCollection{value: 0.5 ether}(
            "Luxury Watch Co",
            "LWC",
            500,
            1 ether
        );

        assertTrue(factory.isHeliosCollection(newCollection));
        assertEq(factory.getCollectionCount(), 1);

        HeliosPBT collection = HeliosPBT(payable(newCollection));
        assertEq(collection.owner(), deployer);
    }

    function test_TokenURI() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        string memory uri = sunCoin.tokenURI(1);
        assertTrue(bytes(uri).length > 0);

        // Decode base64 JSON prefix
        assertEq(
            bytes4(bytes(uri)),
            bytes4("data")
        );
    }
}
