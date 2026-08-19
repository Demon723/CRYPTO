// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title HeliosRenderer
 * @notice Fully on-chain generative SVG renderer.
 *         The sun evolves based on tapCount, lastTapTime, and tier.
 *         No external API. No IPFS. The art lives forever on Base.
 */
library HeliosRenderer {

    struct TokenData {
        uint256 tokenId;
        uint256 tapCount;
        uint256 lastTapTime;
        uint8 tier;        // 0=Genesis, 1=Solar, 2=MainSequence, 3=RedGiant, 4=Supernova
        string name;
    }

    function tokenURI(TokenData memory data) external pure returns (string memory) {
        string memory svg = generateSVG(data);
        string memory json = string(abi.encodePacked(
            '{"name":"', data.name, '",',
            '"description":"A living sun forged in acrylic and code. Tap to evolve.",',
            '"image":"data:image/svg+xml;base64,', b64Encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Tier","value":"', tierName(data.tier), '"},',
                '{"trait_type":"Tap Count","display_type":"number","value":', _toString(data.tapCount), '},',
                '{"trait_type":"Last Tap","display_type":"date","value":', _toString(data.lastTapTime), '},',
                '{"trait_type":"Luminosity","value":', _toString(luminosity(data.tapCount)), '}',
            ']}'
        ));
        return string(abi.encodePacked(
            "data:application/json;base64,",
            b64Encode(bytes(json))
        ));
    }

    function generateSVG(TokenData memory data) public pure returns (string memory) {
        uint256 lum = luminosity(data.tapCount);
        uint256 rays = 8 + (data.tapCount % 24); // 8 to 32 rays
        string memory coreColor = coreColorForTier(data.tier, lum);
        string memory haloColor = haloColorForTier(data.tier, lum);
        string memory bgGradient = backgroundGradient(data.tier, lum);

        // Build rays dynamically
        string memory raysSVG = "";
        for (uint256 i = 0; i < rays; i++) {
            uint256 angle = (360 * i) / rays;
            uint256 rayLen = 60 + (lum * 40) / 100 + ((data.tokenId + i) % 20);
            uint256 width = 2 + (lum / 25);
            // Calculate endpoint using rotation transform instead of trig
            raysSVG = string(abi.encodePacked(
                raysSVG,
                '<line x1="200" y1="200" x2="', _toString(200 + rayLen), '" y2="200" ',
                'stroke="', haloColor, '" stroke-width="', _toString(width), '" ',
                'stroke-linecap="round" opacity="0.6">',
                '<animateTransform attributeName="transform" type="rotate" from="', _toString(angle), ' 200 200" ',
                'to="', _toString(angle + 360), ' 200 200" dur="', _toString(20 + (data.tokenId % 10)), 's" repeatCount="indefinite"/>',
                '</line>'
            ));
        }

        // Pulsing core radius based on tapCount
        uint256 coreRadius = 30 + (lum * 20) / 100;

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">',
            '<defs>',
                '<radialGradient id="bg" cx="50%" cy="50%" r="70%">',
                    bgGradient,
                '</radialGradient>',
                '<radialGradient id="core" cx="50%" cy="50%" r="50%">',
                    '<stop offset="0%" stop-color="', coreColor, '"/>',
                    '<stop offset="100%" stop-color="', haloColor, '" stop-opacity="0"/>',
                '</radialGradient>',
                '<filter id="glow">',
                    '<feGaussianBlur stdDeviation="4" result="coloredBlur"/>',
                    '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
                '</filter>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<g>',
            raysSVG,
            '</g>',
            '<circle cx="200" cy="200" r="', _toString(coreRadius), '" fill="url(#core)" filter="url(#glow)">',
                '<animate attributeName="r" values="', _toString(coreRadius), ';', _toString(coreRadius + 5), ';', _toString(coreRadius), '" ',
                'dur="3s" repeatCount="indefinite"/>',
            '</circle>',
            '<text x="200" y="380" text-anchor="middle" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.5)">',
                '#', _toString(data.tokenId), ' . ', _toString(data.tapCount), ' TAPS',
            '</text>',
            '</svg>'
        ));
    }

    // --- Helpers ---

    function luminosity(uint256 tapCount) internal pure returns (uint256) {
        // Diminishing returns: sqrt(tapCount) * 10, capped at 100
        uint256 raw = sqrt(tapCount) * 10;
        return raw > 100 ? 100 : raw;
    }

    function tierName(uint8 tier) internal pure returns (string memory) {
        if (tier == 0) return "Genesis";
        if (tier == 1) return "Solar";
        if (tier == 2) return "Main Sequence";
        if (tier == 3) return "Red Giant";
        if (tier == 4) return "Supernova";
        return "Unknown";
    }

    function coreColorForTier(uint8 tier, uint256 lum) internal pure returns (string memory) {
        // Genesis = white-gold, Solar = gold, Main Sequence = amber, Red Giant = crimson, Supernova = violet
        if (tier == 0) return "#FFF8E7"; // Cosmic latte
        if (tier == 1) return "#FFD700"; // Gold
        if (tier == 2) return "#FFAA33"; // Amber
        if (tier == 3) return "#FF4444"; // Crimson
        if (tier == 4) return "#9D4EDD"; // Violet
        return "#FFFFFF";
    }

    function haloColorForTier(uint8 tier, uint256 lum) internal pure returns (string memory) {
        if (tier == 0) return "#FFE4B5";
        if (tier == 1) return "#FFA500";
        if (tier == 2) return "#FF6347";
        if (tier == 3) return "#DC143C";
        if (tier == 4) return "#7B2CBF";
        return "#FFFFFF";
    }

    function backgroundGradient(uint8 tier, uint256 lum) internal pure returns (string memory) {
        string memory c1;
        string memory c2;
        if (tier == 0) { c1 = "#0B0D17"; c2 = "#1A1D3A"; }      // Deep space
        else if (tier == 1) { c1 = "#0D1B2A"; c2 = "#1B263B"; } // Solar wind
        else if (tier == 2) { c1 = "#1B0A0A"; c2 = "#3D1F1F"; } // Main sequence
        else if (tier == 3) { c1 = "#1A0505"; c2 = "#4A0E0E"; } // Red giant
        else { c1 = "#0F0518"; c2 = "#2E1065"; }                // Supernova

        return string(abi.encodePacked(
            '<stop offset="0%" stop-color="', c1, '"/>',
            '<stop offset="100%" stop-color="', c2, '"/>'
        ));
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }

    // --- Base64 ---

    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function b64Encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen + 32);
        bytes memory table = bytes(TABLE);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            for { let i := 0 } lt(i, len) {} {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }
            switch mod(len, 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            mstore(result, encodedLen)
        }
        return string(result);
    }
}
