"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransferTransaction = createTransferTransaction;
exports.sendTransaction = sendTransaction;
exports.faucetRequest = faucetRequest;
const astro_wallet_1 = require("../wallet/astro-wallet");
function createTransferTransaction(wallet, request) {
    const message = new Uint8Array(32);
    const { classicalSig, arcSigma, nonce } = (0, astro_wallet_1.signAstroTransaction)(wallet, message);
    return {
        read_keys: ['balance'],
        write_dict: {
            from: wallet.astroKeypair.address,
            to: request.to,
            amount: request.amount.toString(),
        },
        astroProof: {
            version: 1,
            phase: 0,
            classicalSig: Buffer.from(classicalSig).toString('hex'),
            classicalPub: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
            arcSigma: Buffer.from(arcSigma).toString('hex'),
            arcPubKey: Buffer.from(wallet.astroKeypair.arcPublicKey).toString('hex'),
            algorithmId: 0x04,
            ephemeralPubKey: Buffer.from(new Uint8Array(32)).toString('hex'),
            nonce,
        },
    };
}
function sendTransaction(pool, wallet, request) {
    const tx = createTransferTransaction(wallet, request);
    const fee = request.fee || 1000n;
    const sender = wallet.astroKeypair.address;
    const accepted = pool.addTransaction(tx, sender, fee);
    if (!accepted.accepted) {
        return {
            hash: '',
            sender,
            recipient: request.to,
            amount: request.amount.toString(),
            fee: fee.toString(),
            status: 'rejected',
            reason: accepted.reason,
        };
    }
    const hash = Buffer.from(JSON.stringify(tx)).toString('hex').slice(0, 64);
    return {
        hash,
        sender,
        recipient: request.to,
        amount: request.amount.toString(),
        fee: fee.toString(),
        status: 'pending',
    };
}
function faucetRequest(pool, address, amount = 1000000000000000000n) {
    const tx = {
        read_keys: ['balance'],
        write_dict: {
            from: '0x0000000000000000000000000000000000000000',
            to: address,
            amount: amount.toString(),
        },
        type: 'faucet',
    };
    const accepted = pool.addTransaction(tx, '0x'.padEnd(40, '0'), 0n);
    if (!accepted.accepted) {
        return {
            hash: '',
            sender: '0x'.padEnd(40, '0'),
            recipient: address,
            amount: amount.toString(),
            fee: '0',
            status: 'rejected',
            reason: accepted.reason,
        };
    }
    const hash = Buffer.from(JSON.stringify(tx)).toString('hex').slice(0, 64);
    return {
        hash,
        sender: '0x'.padEnd(40, '0'),
        recipient: address,
        amount: amount.toString(),
        fee: '0',
        status: 'pending',
    };
}
