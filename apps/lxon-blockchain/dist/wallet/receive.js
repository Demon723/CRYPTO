"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceiveAddress = generateReceiveAddress;
exports.generateNewAddress = generateNewAddress;
exports.hashMessage = hashMessage;
const astro_wallet_1 = require("../wallet/astro-wallet");
const address_1 = require("../address");
const address_2 = require("../address");
const crypto_1 = require("crypto");
function generateReceiveAddress(wallet, type = 'astro') {
    if (type === 'astro') {
        const astroAddress = (0, address_1.encodeP2AS)(wallet.astroKeypair.classicalPublicKey, wallet.astroKeypair.arcPublicKey);
        return {
            address: astroAddress,
            type: 'astro',
            publicKey: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
            path: wallet.astroPath,
        };
    }
    const address = (0, address_2.encodeP2PKH)(wallet.astroKeypair.classicalPublicKey);
    return {
        address,
        type: 'classical',
        publicKey: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
        path: "m/44'/0'/0'/0/0",
    };
}
function generateNewAddress() {
    const wallet = (0, astro_wallet_1.generateAstroWallet)();
    return generateReceiveAddress(wallet, 'astro');
}
function hashMessage(message) {
    return (0, crypto_1.createHash)('sha256').update(message).digest('hex');
}
