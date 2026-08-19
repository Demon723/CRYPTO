import { sha256, taggedHash } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface MuSig2KeyAggregation {
  aggregatedPublicKey: Uint8Array;
  tweakedAggregatedKey: Uint8Array;
  keyAggregationCoefficient: (publicKey: Uint8Array, index: number) => Uint8Array;
}

export interface MuSig2SignatureShare {
  publicNonce: { R: Uint8Array; c: Uint8Array };
  signatureShare: Uint8Array;
}

export interface MuSig2AggregatedNonce {
  nonce: Uint8Array;
  participants: Uint8Array[];
}

export class MuSig2 {
  static aggregatePublicKeys(publicKeys: Uint8Array[]): { aggregatedKey: Uint8Array; tweakedKey: Uint8Array } {
    const sorted = [...publicKeys].sort((a, b) => Buffer.from(a).compare(Buffer.from(b)));
    const hashCoeffs = sorted.map((pk, i) => {
      const data = Buffer.concat([Buffer.from([0x02]), pk, Buffer.from([0x00]), Buffer.from([0x00])]);
      return sha256(data);
    });
    let aggregate = secp256k1.ProjectivePoint.BASE.multiply(0);
    for (let i = 0; i < sorted.length; i++) {
      const coeff = Number(BigInt('0x' + Buffer.from(hashCoeffs[i]).toString('hex')) % secp256k1.CURVE.n);
      const point = secp256k1.ProjectivePoint.fromHex(sorted[i]);
      aggregate = aggregate.add(point.multiply(coeff));
    }
    const aggregatedKey = Buffer.from(aggregate.toRawBytes(false)).subarray(0, 32);
    const tweak = taggedHash('MuSig2', aggregatedKey);
    const tweakNum = Number(BigInt('0x' + Buffer.from(tweak).toString('hex')) % secp256k1.CURVE.n);
    const tweakedPoint = aggregate.add(secp256k1.ProjectivePoint.BASE.multiply(tweakNum));
    return { aggregatedKey, tweakedKey: Buffer.from(tweakedPoint.toRawBytes(false)).subarray(0, 32) };
  }

  static generateNonce(): { R: Uint8Array; c: Uint8Array } {
    const r = sha256(Buffer.concat([Buffer.from('MUSIG2_NONCE_R'), Buffer.from([Math.floor(Math.random() * 256)])])).subarray(0, 32);
    const R = secp256k1.getPublicKey(r);
    const c = sha256(R).subarray(0, 32);
    return { R, c };
  }

  static computeAggregateNonce(publicNonces: { R: Uint8Array; c: Uint8Array }[]): Uint8Array {
    let aggregate = Buffer.alloc(32, 0);
    for (const nonce of publicNonces) {
      for (let i = 0; i < 32; i++) {
        aggregate[i] ^= nonce.R[i];
      }
    }
    return sha256(aggregate);
  }

  static computeChallenge(aggregateNonce: Uint8Array, aggregatedPublicKey: Uint8Array, message: Uint8Array): Uint8Array {
    const data = Buffer.concat([aggregateNonce, aggregatedPublicKey, message]);
    return sha256(taggedHash('MuSig2', data)).subarray(0, 32);
  }

  static sign(privateKey: Uint8Array, aggregatedPublicKey: Uint8Array, message: Uint8Array, publicNonces: { R: Uint8Array; c: Uint8Array }[], index: number): MuSig2SignatureShare {
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

  static aggregateSignatures(shares: MuSig2SignatureShare[], aggregatedPublicKey: Uint8Array, message: Uint8Array): Buffer {
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

  static verify(aggregatedPublicKey: Uint8Array, signature: Buffer, message: Uint8Array): boolean {
    if (signature.length !== 64) return false;
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
