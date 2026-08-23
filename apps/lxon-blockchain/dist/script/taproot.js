"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaprootEngine = exports.MASTBuilder = void 0;
exports.createTapLeaf = createTapLeaf;
exports.computeTapLeafHash = computeTapLeafHash;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = secp256k1_1.secp256k1.secp256k1;
class MASTBuilder {
    scripts = [];
    addScript(script) {
        this.scripts.push(script);
    }
    build() {
        if (this.scripts.length === 0) {
            return (0, hash_1.sha256)(Buffer.from([]));
        }
        let nodes = this.scripts.map(script => {
            const tagHash = (0, hash_1.taggedHash)('TapScript', script);
            return (0, hash_1.sha256)(Buffer.concat([Buffer.from([0x00]), tagHash, script]));
        });
        while (nodes.length > 1) {
            const next = [];
            for (let i = 0; i < nodes.length; i += 2) {
                if (i + 1 < nodes.length) {
                    const left = nodes[i];
                    const right = nodes[i + 1];
                    const pair = left[0] < right[0] ? Buffer.concat([left, right]) : Buffer.concat([right, left]);
                    next.push((0, hash_1.sha256)(pair));
                }
                else {
                    next.push(nodes[i]);
                }
            }
            nodes = next;
        }
        return nodes[0];
    }
    getScriptCount() {
        return this.scripts.length;
    }
}
exports.MASTBuilder = MASTBuilder;
class TaprootEngine {
    static createKeyPathOutput(internalPubKey, merkleRoot) {
        const tweaked = TaprootEngine.tweakPublicKey(internalPubKey, merkleRoot);
        return {
            outputKey: Buffer.from(tweaked),
            scriptPath: undefined,
            merkleRoot,
        };
    }
    static createScriptPathOutput(internalPubKey, script) {
        const mast = new MASTBuilder();
        mast.addScript(script);
        const merkleRoot = mast.build();
        return TaprootEngine.createKeyPathOutput(internalPubKey, merkleRoot);
    }
    static tweakPublicKey(internalPubKey, merkleRoot) {
        const point = secp256k1.ProjectivePoint.fromHex(internalPubKey);
        const tweak = merkleRoot
            ? (0, hash_1.taggedHash)('TapTweak', Buffer.concat([internalPubKey, merkleRoot]))
            : (0, hash_1.taggedHash)('TapTweak', internalPubKey);
        const tweakNum = Number(BigInt('0x' + Buffer.from(tweak).toString('hex')) % secp256k1.CURVE.n);
        const tweaked = point.add(secp256k1.ProjectivePoint.BASE.multiply(tweakNum));
        return Buffer.from(tweaked.toHex(), 'hex');
    }
    static verifyTaprootSignature(outputKey, signature, message) {
        try {
            return secp256k1.verify(signature.subarray(0, 64), message, outputKey);
        }
        catch {
            return false;
        }
    }
    static createSchnorrSignature(privateKey, message) {
        const sig = secp256k1.sign(message, privateKey);
        return Buffer.concat([sig.toCompactRawBytes(), Buffer.from([0])]);
    }
    static verifySchnorrSignature(publicKey, signature, message) {
        try {
            return secp256k1.verify(signature.subarray(0, 64), message, publicKey);
        }
        catch {
            return false;
        }
    }
    static hashScript(script) {
        const tagHash = (0, hash_1.taggedHash)('TapScript', script);
        return (0, hash_1.sha256)(Buffer.concat([Buffer.from([0x00]), tagHash, script]));
    }
    static verifyMerkleProof(leafHash, root, proof) {
        let current = leafHash;
        for (const sibling of proof) {
            const pair = current[0] < sibling[0] ? Buffer.concat([current, sibling]) : Buffer.concat([sibling, current]);
            current = (0, hash_1.sha256)(pair);
        }
        return Buffer.from(current).equals(Buffer.from(root));
    }
}
exports.TaprootEngine = TaprootEngine;
function createTapLeaf(script, version = 0xc0) {
    return Buffer.concat([Buffer.from([version]), script]);
}
function computeTapLeafHash(leaf) {
    return TaprootEngine.hashScript(leaf);
}
