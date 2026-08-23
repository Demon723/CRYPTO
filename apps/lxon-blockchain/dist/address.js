"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeP2PKH = encodeP2PKH;
exports.encodeP2AS = encodeP2AS;
exports.decodeAddress = decodeAddress;
const hash_1 = require("./crypto/hash");
const MAINNET_PREFIX = 0x00;
const TESTNET_PREFIX = 0x6f;
const ASTRO_HRP = 'as';
function encodeP2PKH(publicKey, testnet = false) {
    const prefix = testnet ? TESTNET_PREFIX : MAINNET_PREFIX;
    const payload = Buffer.concat([Buffer.from([prefix]), (0, hash_1.hash160)(publicKey)]);
    const checksum = (0, hash_1.sha256)((0, hash_1.sha256)(payload)).subarray(0, 4);
    const addressBytes = Buffer.concat([payload, checksum]);
    return bs58encode(addressBytes);
}
function encodeP2AS(classicalPub, arcPub) {
    const combined = Buffer.concat([Buffer.from(classicalPub), Buffer.from(arcPub)]);
    const witnessVersion = 0x02;
    const witnessProgram = (0, hash_1.hash160)(combined);
    const data = Buffer.concat([Buffer.from([witnessVersion]), witnessProgram]);
    return bech32mEncode(ASTRO_HRP, data);
}
function decodeAddress(address) {
    if (address.startsWith(ASTRO_HRP)) {
        return decodeP2AS(address);
    }
    try {
        const bytes = bs58decode(address);
        const version = bytes[0];
        const data = bytes.subarray(1, -4);
        return {
            address,
            type: version === TESTNET_PREFIX ? 'p2pkh' : 'p2pkh',
            version,
            data: new Uint8Array(data),
        };
    }
    catch {
        return null;
    }
}
function decodeP2AS(address) {
    const decoded = bech32mDecode(address);
    return {
        address,
        type: 'p2as',
        version: decoded[0],
        data: new Uint8Array(decoded.subarray(1)),
    };
}
function bs58encode(data) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const num = BigInt('0x' + data.toString('hex'));
    let result = '';
    let n = num;
    while (n > 0n) {
        const mod = n % 58n;
        result = alphabet[Number(mod)] + result;
        n = n / 58n;
    }
    for (let i = 0; i < data.length && data[i] === 0; i++) {
        result = '1' + result;
    }
    return result || '1';
}
function bs58decode(str) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = 0n;
    for (let i = 0; i < str.length; i++) {
        const idx = alphabet.indexOf(str[i]);
        if (idx < 0)
            throw new Error('Invalid base58 character');
        num = num * 58n + BigInt(idx);
    }
    const hex = num.toString(16).padStart(str.length * 2, '0');
    return Buffer.from(hex, 'hex');
}
function bech32mEncode(hrp, data) {
    const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const expanded = expandHrp(hrp);
    const combined = Buffer.concat([expanded, data]);
    const polymod = polymodChecksum(combined);
    const checksum = calculateChecksum(combined);
    const encoded = encodeBase32(Buffer.concat([data, checksum]));
    return `${hrp}${encoded}`;
}
function bech32mDecode(address) {
    const lastSeparator = address.lastIndexOf('1');
    if (lastSeparator < 0)
        throw new Error('Invalid bech32m address');
    const hrp = address.slice(0, lastSeparator);
    const dataStr = address.slice(lastSeparator + 1);
    const data = decodeBase32(dataStr);
    const expanded = expandHrp(hrp);
    const combined = Buffer.concat([expanded, data]);
    const checksum = data.subarray(data.length - 6);
    const payload = data.subarray(0, data.length - 6);
    if (!verifyChecksum(combined, payload, checksum)) {
        throw new Error('Invalid checksum');
    }
    return payload;
}
function expandHrp(hrp) {
    const result = Buffer.alloc(hrp.length * 2 + 1);
    for (let i = 0; i < hrp.length; i++) {
        result[i] = hrp.charCodeAt(i) >> 5;
        result[i + hrp.length + 1] = hrp.charCodeAt(i) & 31;
    }
    result[hrp.length] = 0;
    return result;
}
function polymod(values) {
    const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (let i = 0; i < values.length; i++) {
        const v = chk >> 25 ^ values[i];
        chk = (chk & 0x1ffffff) << 5 ^ generator[v];
    }
    return chk ^ 1;
}
function polymodChecksum(data) {
    const enc = Buffer.concat([data, Buffer.alloc(6, 0)]);
    const mod = polymod(enc);
    const checksum = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        checksum[i] = (mod >> (5 * (5 - i))) & 31;
    }
    return checksum;
}
function verifyChecksum(data, payload, checksum) {
    const enc = Buffer.concat([data.subarray(0, data.length - 6), payload, checksum]);
    const mod = polymod(enc);
    return mod === 1;
}
function calculateChecksum(data) {
    const mod = polymod(data);
    const checksum = Buffer.alloc(6);
    for (let i = 0; i < 6; i++) {
        checksum[i] = (mod >> (5 * (5 - i))) & 31;
    }
    return checksum;
}
function encodeBase32(data) {
    const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += alphabet[data[i]];
    }
    return result;
}
function decodeBase32(str) {
    const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const result = Buffer.alloc(str.length);
    for (let i = 0; i < str.length; i++) {
        const idx = alphabet.indexOf(str[i]);
        if (idx < 0)
            throw new Error('Invalid bech32 character');
        result[i] = idx;
    }
    return result;
}
