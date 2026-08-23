"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTRO_ALGORITHM = void 0;
exports.encodeUser = encodeUser;
exports.hashUser = hashUser;
exports.encodeTransaction = encodeTransaction;
exports.hashTransaction = hashTransaction;
exports.signTransaction = signTransaction;
exports.verifyTransactionSignature = verifyTransactionSignature;
exports.generateUserStateRoot = generateUserStateRoot;
exports.generateTxMerkleRoot = generateTxMerkleRoot;
exports.deriveAddressFromPublicKey = deriveAddressFromPublicKey;
exports.encodeAstroSignature = encodeAstroSignature;
exports.hashAstroSignature = hashAstroSignature;
exports.generateAstroAddress = generateAstroAddress;
exports.getAstroPhase = getAstroPhase;
const hash_1 = require("./hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
function encodeUser(user) {
    const parts = [
        Buffer.from(user.address),
        Buffer.from(user.publicKey),
        Buffer.from(user.balance || '0'),
        Buffer.from((user.nonce || 0).toString()),
    ];
    if (user.metadata) {
        parts.push(Buffer.from(JSON.stringify(user.metadata)));
    }
    const combined = Buffer.concat(parts);
    return new Uint8Array(combined);
}
function hashUser(user) {
    const encoded = encodeUser(user);
    return (0, hash_1.hash160)(encoded).toString('hex');
}
function encodeTransaction(tx) {
    const parts = [
        Buffer.from(tx.txIndex.toString()),
        Buffer.from(tx.sender),
        Buffer.from(tx.readKeys.join(',')),
    ];
    if (tx.writeDict) {
        parts.push(Buffer.from(JSON.stringify(tx.writeDict)));
    }
    if (tx.logic) {
        parts.push(Buffer.from(tx.logic));
    }
    const combined = Buffer.concat(parts);
    return new Uint8Array(combined);
}
function hashTransaction(tx) {
    const encoded = encodeTransaction(tx);
    return (0, hash_1.sha256x2)(encoded).toString('hex');
}
function signTransaction(tx, privateKeyHex) {
    const messageHash = new Uint8Array((0, hash_1.sha256x2)(encodeTransaction(tx)));
    const signature = secp256k1_1.secp256k1.sign(messageHash, privateKeyHex);
    return signature.toCompactHex();
}
function verifyTransactionSignature(tx, signatureHex, publicKeyHex) {
    const messageHash = (0, hash_1.sha256x2)(encodeTransaction(tx));
    try {
        const valid = secp256k1_1.secp256k1.verify(signatureHex, new Uint8Array(messageHash), new Uint8Array(Buffer.from(publicKeyHex, 'hex')));
        return valid;
    }
    catch {
        return false;
    }
}
function generateUserStateRoot(users) {
    if (users.length === 0) {
        return (0, hash_1.sha256)(Buffer.alloc(0)).toString('hex');
    }
    const leaves = users.map((u) => {
        const encoded = encodeUser(u);
        return (0, hash_1.sha256x2)(encoded);
    });
    let level = leaves;
    while (level.length > 1) {
        const next = [];
        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] || left;
            next.push((0, hash_1.sha256x2)(Buffer.concat([left, right])));
        }
        level = next;
    }
    return level[0].toString('hex');
}
function generateTxMerkleRoot(txs) {
    if (txs.length === 0) {
        return (0, hash_1.sha256)(Buffer.alloc(0)).toString('hex');
    }
    const leaves = txs.map((tx) => {
        const encoded = encodeTransaction(tx);
        return (0, hash_1.sha256x2)(encoded);
    });
    let level = leaves;
    while (level.length > 1) {
        const next = [];
        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] || left;
            next.push((0, hash_1.sha256x2)(Buffer.concat([left, right])));
        }
        level = next;
    }
    return level[0].toString('hex');
}
function deriveAddressFromPublicKey(publicKeyHex) {
    const pubKeyBuffer = Buffer.from(publicKeyHex, 'hex');
    const h160 = (0, hash_1.hash160)(pubKeyBuffer);
    return h160.toString('hex');
}
exports.ASTRO_ALGORITHM = {
    ECDSA: 0x01,
    SLS44: 0x02,
    SLS65: 0x03,
    NFS512: 0x04,
    NFS1024: 0x05,
    CHS128S: 0x06,
    CHS128F: 0x07,
};
function encodeAstroSignature(sig) {
    const buf = Buffer.concat([
        Buffer.from([sig.version]),
        Buffer.from([exports.ASTRO_ALGORITHM.ECDSA]),
        Buffer.from([sig.algorithmId]),
        Buffer.from(sig.classicalSig),
        Buffer.from(sig.classicalPub),
        Buffer.alloc(2),
        Buffer.from(sig.arcSigma),
        Buffer.alloc(2),
        Buffer.from(sig.arcPubKey),
        Buffer.from(sig.ephemeralPubKey),
        Buffer.alloc(8),
    ]);
    buf.writeUInt16BE(sig.arcSigma.length, 1 + 1 + 1 + sig.classicalSig.length + sig.classicalPub.length);
    buf.writeUInt16BE(sig.arcPubKey.length, 1 + 1 + 1 + sig.classicalSig.length + sig.classicalPub.length + 2 + sig.arcSigma.length);
    buf.writeBigUInt64BE(sig.nonce, buf.length - 8);
    return new Uint8Array(buf);
}
function hashAstroSignature(sig) {
    const encoded = encodeAstroSignature(sig);
    return (0, hash_1.sha256x2)(encoded).toString('hex');
}
function generateAstroAddress(classicalPub, arcPub) {
    const combined = Buffer.concat([Buffer.from(classicalPub), Buffer.from(arcPub)]);
    return (0, hash_1.hash160)(combined).toString('hex');
}
function getAstroPhase(genesisTime, blockTime) {
    const age = blockTime - genesisTime;
    const hybridEnd = 10 * 365 * 24 * 60 * 60;
    const transitionEnd = 20 * 365 * 24 * 60 * 60;
    const arv2Start = 50 * 365 * 24 * 60 * 60;
    if (age < hybridEnd)
        return 0;
    if (age < transitionEnd)
        return 1;
    if (age < arv2Start)
        return 2;
    return 3;
}
