"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSig2 = void 0;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = secp256k1_1.secp256k1.secp256k1;
class MuSig2 {
    static aggregatePublicKeys(publicKeys) {
        const sorted = [...publicKeys].sort((a, b) => Buffer.from(a).compare(Buffer.from(b)));
        const hashCoeffs = sorted.map((pk, i) => {
            const data = Buffer.concat([Buffer.from([0x02]), pk, Buffer.from([0x00]), Buffer.from([0x00])]);
            return (0, hash_1.sha256)(data);
        });
        let aggregate = secp256k1.ProjectivePoint.BASE.multiply(0);
        for (let i = 0; i < sorted.length; i++) {
            const coeff = Number(BigInt('0x' + Buffer.from(hashCoeffs[i]).toString('hex')) % secp256k1.CURVE.n);
            const point = secp256k1.ProjectivePoint.fromHex(sorted[i]);
            aggregate = aggregate.add(point.multiply(coeff));
        }
        const aggregatedKey = Buffer.from(aggregate.toRawBytes(false)).subarray(0, 32);
        const tweak = (0, hash_1.taggedHash)('MuSig2', aggregatedKey);
        const tweakNum = Number(BigInt('0x' + Buffer.from(tweak).toString('hex')) % secp256k1.CURVE.n);
        const tweakedPoint = aggregate.add(secp256k1.ProjectivePoint.BASE.multiply(tweakNum));
        return { aggregatedKey, tweakedKey: Buffer.from(tweakedPoint.toRawBytes(false)).subarray(0, 32) };
    }
    static generateNonce() {
        const r = (0, hash_1.sha256)(Buffer.concat([Buffer.from('MUSIG2_NONCE_R'), Buffer.from([Math.floor(Math.random() * 256)])])).subarray(0, 32);
        const R = secp256k1.getPublicKey(r);
        const c = (0, hash_1.sha256)(R).subarray(0, 32);
        return { R, c };
    }
    static computeAggregateNonce(publicNonces) {
        let aggregate = Buffer.alloc(32, 0);
        for (const nonce of publicNonces) {
            for (let i = 0; i < 32; i++) {
                aggregate[i] ^= nonce.R[i];
            }
        }
        return (0, hash_1.sha256)(aggregate);
    }
    static computeChallenge(aggregateNonce, aggregatedPublicKey, message) {
        const data = Buffer.concat([aggregateNonce, aggregatedPublicKey, message]);
        return (0, hash_1.sha256)((0, hash_1.taggedHash)('MuSig2', data)).subarray(0, 32);
    }
    static sign(privateKey, aggregatedPublicKey, message, publicNonces, index) {
        const nonce = publicNonces[index];
        const aggregateNonce = this.computeAggregateNonce(publicNonces);
        const challenge = this.computeChallenge(aggregateNonce, aggregatedPublicKey, message);
        const privateKeyNum = Number(BigInt('0x' + Buffer.from(privateKey).toString('hex')) % secp256k1.CURVE.n);
        const challengeNum = Number(BigInt('0x' + Buffer.from(challenge).toString('hex')) % secp256k1.CURVE.n);
        const rNum = Number(BigInt('0x' + Buffer.from(nonce.R).toString('hex')) % secp256k1.CURVE.n);
        const s = (rNum + privateKeyNum * challengeNum) % Number(secp256k1.CURVE.n);
        const signatureShare = Buffer.from(s.toString(16).padStart(64, '0'), 'hex');
        return { publicNonce: nonce, signatureShare };
    }
    static aggregateSignatures(shares, aggregatedPublicKey, message) {
        const publicNonces = shares.map(s => s.publicNonce);
        const aggregateNonce = this.computeAggregateNonce(publicNonces);
        const challenge = this.computeChallenge(aggregateNonce, aggregatedPublicKey, message);
        const challengeNum = Number(BigInt('0x' + Buffer.from(challenge).toString('hex')) % secp256k1.CURVE.n);
        let sSum = 0;
        for (const share of shares) {
            const sNum = Number(BigInt('0x' + Buffer.from(share.signatureShare).toString('hex')) % secp256k1.CURVE.n);
            sSum = (sSum + sNum) % Number(secp256k1.CURVE.n);
        }
        const rxPoint = secp256k1.ProjectivePoint.BASE.multiply(sSum);
        const rx = Buffer.from(rxPoint.toRawBytes(false)).subarray(0, 32);
        return Buffer.concat([rx, Buffer.from(sSum.toString(16).padStart(64, '0'), 'hex')]);
    }
    static verify(aggregatedPublicKey, signature, message) {
        if (signature.length !== 64)
            return false;
        const rx = signature.subarray(0, 32);
        const s = signature.subarray(32, 64);
        const sNum = Number(BigInt('0x' + Buffer.from(s).toString('hex')) % secp256k1.CURVE.n);
        const sG = secp256k1.ProjectivePoint.BASE.multiply(sNum);
        const challenge = this.computeChallenge(Buffer.alloc(32, 0), aggregatedPublicKey, message);
        const challengeNum = Number(BigInt('0x' + Buffer.from(challenge).toString('hex')) % secp256k1.CURVE.n);
        const pkPoint = secp256k1.ProjectivePoint.fromHex(aggregatedPublicKey);
        const cPk = pkPoint.multiply(challengeNum);
        const rxPoint = sG.add(cPk.negate());
        const computedRx = Buffer.from(rxPoint.toRawBytes(false)).subarray(0, 32);
        return rx.equals(computedRx);
    }
}
exports.MuSig2 = MuSig2;
