"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/curves/secp256k1");
const encode_1 = require("./crypto/encode");
const generateKeyPair = () => {
    const keyPair = secp256k1_1.secp256k1.keygen();
    const privateKeyHex = Buffer.from(keyPair.secretKey).toString('hex');
    const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
    const address = (0, encode_1.deriveAddressFromPublicKey)(publicKeyHex);
    return { privateKeyHex, publicKeyHex, address };
};
const alice = generateKeyPair();
const bob = generateKeyPair();
const users = [
    {
        address: alice.address,
        publicKey: alice.publicKeyHex,
        balance: '100000000000000000000',
        nonce: 1,
        metadata: { tier: 'STANDARD' },
    },
    {
        address: bob.address,
        publicKey: bob.publicKeyHex,
        balance: '50000000000000000000',
        nonce: 0,
        metadata: { tier: 'PREMIUM' },
    },
];
const txs = [
    {
        txIndex: 0,
        readKeys: ['balance'],
        writeDict: { to: bob.address, amount: '1000000000000000000' },
        sender: alice.address,
    },
    {
        txIndex: 1,
        readKeys: ['balance'],
        writeDict: { to: alice.address, amount: '500000000000000000' },
        sender: bob.address,
    },
];
for (const tx of txs) {
    tx.signature = (0, encode_1.signTransaction)(tx, alice.privateKeyHex);
}
console.log('===== USER CRYPTOGRAPHIC ENCODING =====');
for (const user of users) {
    const encoded = (0, encode_1.encodeUser)(user);
    const hashed = (0, encode_1.hashUser)(user);
    console.log(`Address: ${user.address}`);
    console.log(`  Encoded length: ${encoded.length} bytes`);
    console.log(`  Hash160: ${hashed}`);
    console.log('');
}
console.log('===== TRANSACTION CRYPTOGRAPHIC ENCODING =====');
for (const tx of txs) {
    const encoded = (0, encode_1.encodeTransaction)(tx);
    const hashed = (0, encode_1.hashTransaction)(tx);
    const valid = (0, encode_1.verifyTransactionSignature)(tx, tx.signature, alice.publicKeyHex);
    console.log(`TxIndex: ${tx.txIndex}`);
    console.log(`  Sender: ${tx.sender}`);
    console.log(`  Encoded length: ${encoded.length} bytes`);
    console.log(`  Double-SHA256: ${hashed}`);
    console.log(`  Signature valid: ${valid}`);
    console.log('');
}
const stateRoot = (0, encode_1.generateUserStateRoot)(users);
const txRoot = (0, encode_1.generateTxMerkleRoot)(txs);
console.log('===== STATE ROOTS =====');
console.log(`User State Root: ${stateRoot}`);
console.log(`Transaction Merkle Root: ${txRoot}`);
