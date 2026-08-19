// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosCardRegistry.sol";
import "../src/HeliosTBAccount.sol";
import "../src/HeliosPBTv3.sol";

contract HeliosPBTv3Test is Test {
    HeliosChipRegistry chipRegistry;
    HeliosCardRegistry cardRegistry;
    HeliosTBAccount tbaImpl;
    HeliosPBTv3 sunCoin;

    address deployer = address(1);
    address founder = address(2);
    address user = address(3);
    address buyer = address(4);
    address treasury = address(5);
    address merchant = address(6);

    uint256 chipPrivateKey = 0xabc123;
    address chipPublicKey;

    function setUp() public {
        vm.startPrank(deployer);
        chipPublicKey = vm.addr(chipPrivateKey);

        chipRegistry = new HeliosChipRegistry();
        cardRegistry = new HeliosCardRegistry();
        tbaImpl = new HeliosTBAccount();

        sunCoin = new HeliosPBTv3(
            "Helios Sun Coin",
            "HELIOS",
            address(chipRegistry),
            address(cardRegistry),
            100,
            0.25 ether,
            treasury,
            1500
        );

        sunCoin.setTBAImplementation(address(tbaImpl));
        chipRegistry.setMinter(address(sunCoin), true);
        cardRegistry.setRegistrar(address(sunCoin), true);
        sunCoin.setFounder(founder, true);

        vm.stopPrank();
    }

    // ============================================================
    // PREMIUM GATING
    // ============================================================

    function test_GenesisIsPremium() public {
        _mintToken(1, user, 0); // Genesis tier
        assertTrue(sunCoin.isPremium(1));
    }

    function test_SupernovaIsPremium() public {
        _mintToken(1, user, 4); // Supernova tier
        assertTrue(sunCoin.isPremium(1));
    }

    function test_SolarIsNotPremium() public {
        _mintToken(1, user, 1); // Solar tier
        assertFalse(sunCoin.isPremium(1));
    }

    function test_RedGiantIsNotPremium() public {
        _mintToken(1, user, 3); // Red Giant tier
        assertFalse(sunCoin.isPremium(1));
    }

    // ============================================================
    // TBA CREATION (PREMIUM ONLY)
    // ============================================================

    function test_PremiumGetsTBAOnActivate() public {
        _mintToken(1, user, 0); // Genesis
        vm.prank(founder);
        sunCoin.activate(1);

        address tba = sunCoin.getTBA(1);
        assertTrue(tba != address(0));
        assertEq(sunCoin.tokenToTBA(1), tba);
    }

    function test_NonPremiumNoTBAOnActivate() public {
        _mintToken(1, user, 1); // Solar (not premium)
        vm.prank(founder);
        sunCoin.activate(1);

        assertEq(sunCoin.getTBA(1), address(0));
    }

    function test_TBAReceivesDeposits() public {
        _mintAndActivatePremium(1, user, 0);
        address tba = sunCoin.getTBA(1);

        vm.deal(user, 1 ether);
        vm.prank(user);
        sunCoin.depositToTBA{value: 0.5 ether}(1);

        assertEq(address(tba).balance, 0.5 ether);
    }

    // ============================================================
    // CARD REGISTRATION (PREMIUM ONLY)
    // ============================================================

    function test_RegisterCardholderPremium() public {
        _mintAndActivatePremium(1, user, 0);

        bytes32 nameHash = keccak256("Satoshi Nakamoto");
        bytes32 kycHash = keccak256("KYC_DOC_123");

        vm.prank(founder);
        sunCoin.registerCardholder(1, nameHash, kycHash);

        HeliosCardRegistry.Cardholder memory ch = sunCoin.getCardholder(1);
        assertTrue(ch.registered);
        assertEq(ch.nameHash, nameHash);
        assertTrue(bytes(ch.cardNumber).length > 0);
    }

    function test_CannotRegisterNonPremium() public {
        _mintAndActivate(1, user, 1); // Solar

        vm.prank(founder);
        vm.expectRevert("Helios: premium only");
        sunCoin.registerCardholder(1, keccak256("Name"), keccak256("KYC"));
    }

    function test_CardNumberUnique() public {
        _mintAndActivatePremium(1, user, 0, chipPublicKey);
        _mintAndActivatePremium(2, buyer, 4, vm.addr(0xabc456));

        vm.startPrank(founder);
        sunCoin.registerCardholder(1, keccak256("User1"), keccak256("KYC1"));
        sunCoin.registerCardholder(2, keccak256("User2"), keccak256("KYC2"));
        vm.stopPrank();

        HeliosCardRegistry.Cardholder memory ch1 = sunCoin.getCardholder(1);
        HeliosCardRegistry.Cardholder memory ch2 = sunCoin.getCardholder(2);

        assertTrue(
            keccak256(bytes(ch1.cardNumber)) != keccak256(bytes(ch2.cardNumber))
        );
    }

    // ============================================================
    // TAP TO PAY (PREMIUM ONLY)
    // ============================================================

    function test_TapToPay() public {
        _mintAndActivatePremium(1, user, 0);
        _bindWallet(1, user);

        address tba = sunCoin.getTBA(1);

        // Fund the TBA
        vm.deal(user, 1 ether);
        vm.prank(user);
        sunCoin.depositToTBA{value: 0.5 ether}(1);
        assertEq(address(tba).balance, 0.5 ether);

        // User taps coin to pay merchant 0.1 ETH
        uint256 nonce = 999;
        bytes memory sig = _signPay(1, merchant, 0.1 ether, "", nonce);

        uint256 merchantBefore = merchant.balance;

        vm.prank(user);
        sunCoin.tapToPay(1, merchant, 0.1 ether, "", nonce, sig);

        assertEq(merchant.balance - merchantBefore, 0.1 ether);
        assertEq(address(tba).balance, 0.4 ether);
    }

    function test_TapToPay_CannotUseNonPremium() public {
        _mintAndActivate(1, user, 1); // Solar (not premium)
        _bindWallet(1, user);

        uint256 nonce = 999;
        bytes memory sig = _signPay(1, merchant, 0.1 ether, "", nonce);

        vm.prank(user);
        vm.expectRevert("Helios: premium only");
        sunCoin.tapToPay(1, merchant, 0.1 ether, "", nonce, sig);
    }

    function test_TapToPay_CannotIfFrozen() public {
        _mintAndActivatePremium(1, user, 0);
        _bindWallet(1, user);

        vm.prank(founder);
        sunCoin.freeze(1, "Hold");

        uint256 nonce = 999;
        bytes memory sig = _signPay(1, merchant, 0.1 ether, "", nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.tapToPay(1, merchant, 0.1 ether, "", nonce, sig);
    }

    function test_TapToPay_CannotIfNotBound() public {
        _mintAndActivatePremium(1, user, 0);
        // Not bound

        uint256 nonce = 999;
        bytes memory sig = _signPay(1, merchant, 0.1 ether, "", nonce);

        vm.prank(user);
        vm.expectRevert("Helios: not bound wallet");
        sunCoin.tapToPay(1, merchant, 0.1 ether, "", nonce, sig);
    }

    function test_TapToPayBatch() public {
        _mintAndActivatePremium(1, user, 0);
        _bindWallet(1, user);

        address tba = sunCoin.getTBA(1);

        vm.deal(user, 1 ether);
        vm.prank(user);
        sunCoin.depositToTBA{value: 0.5 ether}(1);

        address[] memory targets = new address[](2);
        targets[0] = merchant;
        targets[1] = buyer;
        uint256[] memory values = new uint256[](2);
        values[0] = 0.05 ether;
        values[1] = 0.05 ether;
        bytes[] memory datas = new bytes[](2);
        datas[0] = "";
        datas[1] = "";

        uint256 nonce = 1000;
        bytes memory sig = _signPayBatch(1, targets, values, datas, nonce);

        vm.prank(user);
        sunCoin.tapToPayBatch(1, targets, values, datas, nonce, sig);

        assertEq(address(tba).balance, 0.4 ether);
    }

    // ============================================================
    // TRANSFER CLEARS BINDING (ALL TIERS)
    // ============================================================

    function test_TransferPremium_ClearsBindingAndTBAStays() public {
        _mintAndActivatePremium(1, user, 0);
        _bindWallet(1, user);

        address tba = sunCoin.getTBA(1);

        uint256 nonce = 400;
        bytes memory sig = _signTransfer(1, buyer, nonce);

        vm.prank(user);
        sunCoin.transferWithProof(1, buyer, nonce, sig);

        assertEq(sunCoin.ownerOf(1), buyer);
        assertEq(sunCoin.getBoundWallet(1), address(0));
        assertEq(sunCoin.getTBA(1), tba); // TBA stays with token
    }

    // ============================================================
    // KEY VALIDITY (PREMIUM VS NON-PREMIUM)
    // ============================================================

    function test_KeyValid_Premium() public {
        _mintAndActivatePremium(1, user, 0);
        _bindWallet(1, user);

        (bool valid, uint256 tokenId) = sunCoin.isKeyValid(user);
        assertTrue(valid);
        assertEq(tokenId, 1);
    }

    function test_KeyValid_NonPremium() public {
        _mintAndActivate(1, user, 1);
        _bindWallet(1, user);

        (bool valid, uint256 tokenId) = sunCoin.isKeyValid(user);
        assertTrue(valid); // Non-premium still works as key
        assertEq(tokenId, 1);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _mintToken(uint256 tokenId, address to, uint8 tier) internal {
        _mintToken(tokenId, to, tier, chipPublicKey);
    }

    function _mintToken(uint256 tokenId, address to, uint8 tier, address chipKey) internal {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        sunCoin.mint{value: 0.25 ether}(to, tokenId, keccak256(abi.encodePacked(chipKey)), tier);
    }

    function _mintAndActivate(uint256 tokenId, address to, uint8 tier) internal {
        _mintAndActivate(tokenId, to, tier, chipPublicKey);
    }

    function _mintAndActivate(uint256 tokenId, address to, uint8 tier, address chipKey) internal {
        _mintToken(tokenId, to, tier, chipKey);
        vm.prank(founder);
        sunCoin.activate(tokenId);
    }

    function _mintAndActivatePremium(uint256 tokenId, address to, uint8 tier) internal {
        _mintAndActivatePremium(tokenId, to, tier, chipPublicKey);
    }

    function _mintAndActivatePremium(uint256 tokenId, address to, uint8 tier, address chipKey) internal {
        _mintAndActivate(tokenId, to, tier, chipKey);
    }

    function _bindWallet(uint256 tokenId, address wallet) internal {
        uint256 nonce = 100 + tokenId;
        bytes memory sig = _signBind(tokenId, wallet, nonce);
        vm.prank(wallet);
        sunCoin.bindWallet(tokenId, wallet, nonce, sig);
    }

    function _signBind(uint256 tokenId, address wallet, uint256 nonce) internal view returns (bytes memory) {
        bytes32 hash = keccak256(abi.encodePacked("BIND", tokenId, wallet, nonce, block.chainid));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        return abi.encodePacked(r, s, v);
    }

    function _signTransfer(uint256 tokenId, address to, uint256 nonce) internal view returns (bytes memory) {
        bytes32 hash = keccak256(abi.encodePacked("TRANSFER", tokenId, to, nonce, block.chainid));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        return abi.encodePacked(r, s, v);
    }

    function _signPay(uint256 tokenId, address to, uint256 value, bytes memory data, uint256 nonce)
        internal view returns (bytes memory) {
        bytes32 dataHash = keccak256(data);
        bytes32 hash = keccak256(abi.encodePacked("PAY", tokenId, to, value, dataHash, nonce, block.chainid));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        return abi.encodePacked(r, s, v);
    }

    function _signPayBatch(uint256 tokenId, address[] memory targets, uint256[] memory values,
        bytes[] memory datas, uint256 nonce) internal view returns (bytes memory) {
        bytes32[] memory dataHashes = new bytes32[](datas.length);
        for (uint256 i = 0; i < datas.length; i++) {
            dataHashes[i] = keccak256(datas[i]);
        }
        bytes32 combinedHash = keccak256(abi.encodePacked(targets, values, dataHashes));
        bytes32 hash = keccak256(abi.encodePacked("PAY_BATCH", tokenId, combinedHash, nonce, block.chainid));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        return abi.encodePacked(r, s, v);
    }
}
