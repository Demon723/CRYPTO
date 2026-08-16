// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/HeliosChipRegistry.sol";
import "../src/HeliosPBTv2.sol";

contract HeliosPBTv2Test is Test {
    HeliosChipRegistry registry;
    HeliosPBTv2 sunCoin;

    address deployer = address(1);
    address founder = address(2);
    address user = address(3);
    address buyer = address(4);
    address treasury = address(5);
    address gateContract = address(6);

    uint256 chipPrivateKey = 0xabc123;
    address chipPublicKey;

    function setUp() public {
        vm.startPrank(deployer);
        chipPublicKey = vm.addr(chipPrivateKey);

        registry = new HeliosChipRegistry();
        sunCoin = new HeliosPBTv2(
            "Helios Sun Coin",
            "HELIOS",
            address(registry),
            100,
            0.25 ether,
            treasury,
            1500
        );

        registry.setMinter(address(sunCoin), true);
        sunCoin.setFounder(founder, true);

        vm.stopPrank();
    }

    // ============================================================
    // MINTING & LIFECYCLE
    // ============================================================

    function test_Mint_IsInactive() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        bytes32 chipHash = keccak256(abi.encodePacked(chipPublicKey));
        sunCoin.mint{value: 0.25 ether}(user, 1, chipHash, 0);

        assertEq(sunCoin.ownerOf(1), user);
        assertEq(uint256(sunCoin.getTokenStatus(1)), uint256(HeliosPBTv2.TokenStatus.INACTIVE));
        assertEq(sunCoin.getBoundWallet(1), address(0));
    }

    function test_FounderCanActivate() public {
        // Mint
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        sunCoin.mint{value: 0.25 ether}(user, 1, keccak256(abi.encodePacked(chipPublicKey)), 0);

        // Non-founder cannot activate
        vm.prank(user);
        vm.expectRevert("Helios: not founder");
        sunCoin.activate(1);

        // Founder activates
        vm.prank(founder);
        sunCoin.activate(1);

        assertEq(uint256(sunCoin.getTokenStatus(1)), uint256(HeliosPBTv2.TokenStatus.ACTIVE));
    }

    function test_FounderCanFreezeAndUnfreeze() public {
        _mintAndActivate(1, user);

        vm.prank(founder);
        sunCoin.freeze(1, "Dispute investigation");

        assertEq(uint256(sunCoin.getTokenStatus(1)), uint256(HeliosPBTv2.TokenStatus.FROZEN));

        vm.prank(founder);
        sunCoin.unfreeze(1);

        assertEq(uint256(sunCoin.getTokenStatus(1)), uint256(HeliosPBTv2.TokenStatus.ACTIVE));
    }

    function test_FounderCanDeactivate() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        vm.prank(founder);
        sunCoin.deactivate(1, "Confirmed counterfeit");

        assertEq(uint256(sunCoin.getTokenStatus(1)), uint256(HeliosPBTv2.TokenStatus.DEACTIVATED));
        assertEq(sunCoin.getBoundWallet(1), address(0));
        assertEq(sunCoin.getTokenByWallet(user), 0);
    }

    function test_NonFounderCannotChangeStatus() public {
        _mintAndActivate(1, user);

        vm.prank(user);
        vm.expectRevert("Helios: not founder");
        sunCoin.freeze(1, "I want to");
    }

    // ============================================================
    // WALLET BINDING
    // ============================================================

    function test_BindWallet() public {
        _mintAndActivate(1, user);

        uint256 nonce = 100;
        bytes memory sig = _signBind(1, user, nonce);

        vm.prank(user);
        sunCoin.bindWallet(1, user, nonce, sig);

        assertEq(sunCoin.getBoundWallet(1), user);
        assertEq(sunCoin.getTokenByWallet(user), 1);
    }

    function test_CannotBindInactiveToken() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        sunCoin.mint{value: 0.25 ether}(user, 1, keccak256(abi.encodePacked(chipPublicKey)), 0);

        uint256 nonce = 100;
        bytes memory sig = _signBind(1, user, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.bindWallet(1, user, nonce, sig);
    }

    function test_CannotBindFrozenToken() public {
        _mintAndActivate(1, user);

        vm.prank(founder);
        sunCoin.freeze(1, "Hold");

        uint256 nonce = 100;
        bytes memory sig = _signBind(1, user, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.bindWallet(1, user, nonce, sig);
    }

    function test_RebindToNewWallet() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        // User wants to rebind to buyer (e.g., sold the coin)
        uint256 nonce = 200;
        bytes memory sig = _signBind(1, buyer, nonce);

        vm.prank(buyer);
        sunCoin.bindWallet(1, buyer, nonce, sig);

        assertEq(sunCoin.getBoundWallet(1), buyer);
        assertEq(sunCoin.getTokenByWallet(buyer), 1);
        assertEq(sunCoin.getTokenByWallet(user), 0);
    }

    function test_UnbindWallet() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        uint256 nonce = 300;
        bytes memory sig = _signUnbind(1, user, nonce);

        vm.prank(user);
        sunCoin.unbindWallet(1, nonce, sig);

        assertEq(sunCoin.getBoundWallet(1), address(0));
        assertEq(sunCoin.getTokenByWallet(user), 0);
    }

    // ============================================================
    // NFT-AS-KEY
    // ============================================================

    function test_IsKeyValid() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        (bool valid, uint256 tokenId) = sunCoin.isKeyValid(user);
        assertTrue(valid);
        assertEq(tokenId, 1);
    }

    function test_KeyInvalidIfNotBound() public {
        _mintAndActivate(1, user);
        // Not bound

        (bool valid, uint256 tokenId) = sunCoin.isKeyValid(user);
        assertFalse(valid);
        assertEq(tokenId, 0);
    }

    function test_KeyInvalidIfFrozen() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        vm.prank(founder);
        sunCoin.freeze(1, "Hold");

        (bool valid, ) = sunCoin.isKeyValid(user);
        assertFalse(valid);
    }

    function test_KeyInvalidIfDeactivated() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        vm.prank(founder);
        sunCoin.deactivate(1, "Dead");

        (bool valid, ) = sunCoin.isKeyValid(user);
        assertFalse(valid);
    }

    function test_UseKey() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        bytes32 action = keccak256("ENTER_EVENT_2026_08_12");

        vm.prank(user);
        bool success = sunCoin.useKey(action);
        assertTrue(success);
    }

    function test_BatchIsKeyValid() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        _mintAndActivate(2, buyer, vm.addr(0xabc456));
        // buyer not bound

        address[] memory wallets = new address[](2);
        wallets[0] = user;
        wallets[1] = buyer;

        (bool[] memory valid, uint256[] memory tokenIds) = sunCoin.batchIsKeyValid(wallets);
        assertTrue(valid[0]);
        assertEq(tokenIds[0], 1);
        assertFalse(valid[1]);
        assertEq(tokenIds[1], 0);
    }

    // ============================================================
    // PBT TRANSFER WITH LIFECYCLE
    // ============================================================

    function test_TransferWithProof_ClearsBinding() public {
        _mintAndActivate(1, user);
        _bindWallet(1, user);

        uint256 nonce = 400;
        bytes memory sig = _signTransfer(1, buyer, nonce);

        vm.prank(user);
        sunCoin.transferWithProof(1, buyer, nonce, sig);

        assertEq(sunCoin.ownerOf(1), buyer);
        assertEq(sunCoin.getBoundWallet(1), address(0));
        assertEq(sunCoin.getTokenByWallet(user), 0);
    }

    function test_CannotTransferFrozenToken() public {
        _mintAndActivate(1, user);

        vm.prank(founder);
        sunCoin.freeze(1, "Hold");

        uint256 nonce = 400;
        bytes memory sig = _signTransfer(1, buyer, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.transferWithProof(1, buyer, nonce, sig);
    }

    function test_CannotTransferDeactivatedToken() public {
        _mintAndActivate(1, user);

        vm.prank(founder);
        sunCoin.deactivate(1, "Dead");

        uint256 nonce = 400;
        bytes memory sig = _signTransfer(1, buyer, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.transferWithProof(1, buyer, nonce, sig);
    }

    function test_CannotTransferInactiveToken() public {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        sunCoin.mint{value: 0.25 ether}(user, 1, keccak256(abi.encodePacked(chipPublicKey)), 0);

        uint256 nonce = 400;
        bytes memory sig = _signTransfer(1, buyer, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token not active");
        sunCoin.transferWithProof(1, buyer, nonce, sig);
    }

    // ============================================================
    // TAP
    // ============================================================

    function test_Tap() public {
        _mintAndActivate(1, user);

        uint256 nonce = 500;
        bytes memory sig = _signTap(1, nonce);

        vm.prank(user);
        sunCoin.tap(1, nonce, sig);

        HeliosPBTv2.TokenState memory sv = sunCoin.getTokenState(1);
        assertEq(sv.tapCount, 1);
    }

    function test_CannotTapDeactivated() public {
        _mintAndActivate(1, user);
        vm.prank(founder);
        sunCoin.deactivate(1, "Dead");

        uint256 nonce = 500;
        bytes memory sig = _signTap(1, nonce);

        vm.prank(user);
        vm.expectRevert("Helios: token deactivated");
        sunCoin.tap(1, nonce, sig);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _mintAndActivate(uint256 tokenId, address to) internal {
        _mintAndActivate(tokenId, to, chipPublicKey);
    }

    function _mintAndActivate(uint256 tokenId, address to, address chipKey) internal {
        vm.deal(deployer, 1 ether);
        vm.prank(deployer);
        sunCoin.mint{value: 0.25 ether}(to, tokenId, keccak256(abi.encodePacked(chipKey)), 0);

        vm.prank(founder);
        sunCoin.activate(tokenId);
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

    function _signUnbind(uint256 tokenId, address wallet, uint256 nonce) internal view returns (bytes memory) {
        bytes32 hash = keccak256(abi.encodePacked("UNBIND", tokenId, wallet, nonce, block.chainid));
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

    function _signTap(uint256 tokenId, uint256 nonce) internal view returns (bytes memory) {
        bytes32 hash = keccak256(abi.encodePacked("TAP", tokenId, nonce, block.timestamp / 300));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(chipPrivateKey, ethHash);
        return abi.encodePacked(r, s, v);
    }
}
