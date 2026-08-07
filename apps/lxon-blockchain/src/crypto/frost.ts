import { sha256, taggedHash } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface FrostKeyPackage {
  publicKey: Uint8Array;
  publicShares: Map<number, Uint8Array>;
  secretShare: Uint8Array;
  identifier: number;
}

export interface FrostSignatureShare {
  identifier: number;
  zi: Uint8Array;
  wi: Uint8Array;
}

export interface FrostThresholdConfig {
  threshold: number;
  total: number;
}

export class FrostThreshold {
  private config: FrostThresholdConfig;
  private identifiers: number[] = [];
  private publicKey: Uint8Array | null = null;
  private secretShares: Map<number, Uint8Array> = new Map();
  private publicShares: Map<number, Uint8Array> = new Map();
  private groupPublicKey: Uint8Array | null = null;

  constructor(config: FrostThresholdConfig) {
    this.config = config;
    for (let i = 1; i <= config.total; i++) {
      this.identifiers.push(i);
    }
  }

  generateKeyPackages(): FrostKeyPackage[] {
    const packages: FrostKeyPackage[] = [];
    for (const id of this.identifiers) {
      const secretShare = this.generateSecretShare(id);
      const publicShare = this.computePublicShare(secretShare);
      this.secretShares.set(id, secretShare);
      this.publicShares.set(id, publicShare);
      packages.push({
        publicKey: publicShare,
        publicShares: this.publicShares,
        secretShare,
        identifier: id,
      });
    }
    this.groupPublicKey = this.aggregatePublicShares();
    return packages;
  }

  sign(secretShare: Uint8Array, identifier: number, message: Uint8Array): FrostSignatureShare {
    const nonce = this.generateNonce();
    const commitment = this.computeCommitment(nonce, identifier);
    const groupPublicKey = this.groupPublicKey || this.aggregatePublicShares();
    const bindingFactor = this.computeBindingFactor(commitment, identifier, message, groupPublicKey);
    const bindingNonce = this.applyBindingFactor(nonce, bindingFactor);
    const challenge = this.computeChallenge(bindingNonce, identifier, message, groupPublicKey);
    const zi = this.computeZI(bindingNonce, secretShare, challenge);
    const wi = this.computeWI(bindingNonce, challenge);
    return { identifier, zi, wi };
  }

  aggregateSignature(shares: FrostSignatureShare[], message: Uint8Array): Buffer {
    let zSum = Buffer.alloc(32, 0);
    let wSum = Buffer.alloc(32, 0);
    const groupPublicKey = this.groupPublicKey || this.aggregatePublicShares();

    for (const share of shares) {
      const zAdd = this.addMod(zSum, share.zi);
      const wAdd = this.addMod(wSum, share.wi);
      zSum = Buffer.from(zAdd);
      wSum = Buffer.from(wAdd);
    }

    const challenge = this.computeChallenge(null, 0, message, groupPublicKey);
    const challengeNeg = this.modNegate(challenge);
    const rx = this.computeRX(wSum, challengeNeg);
    return Buffer.concat([rx, zSum]);
  }

  verifySignature(publicKey: Uint8Array, signature: Buffer, message: Uint8Array): boolean {
    if (signature.length !== 64) return false;
    const rx = signature.subarray(0, 32);
    const s = signature.subarray(32, 64);
    const challenge = this.computeChallenge(null, 0, message, publicKey);
    const sG = secp256k1.ProjectivePoint.BASE.multiply(this.toNumber(s));
    const challengeNeg = this.modNegate(challenge);
    const pkPoint = secp256k1.ProjectivePoint.fromHex(publicKey);
    const cPk = pkPoint.multiply(this.toNumber(challengeNeg));
    const rxPoint = sG.add(cPk.negate());
    const computedRx = Buffer.from(rxPoint.toRawBytes(false)).subarray(0, 32);
    return rx.equals(computedRx);
  }

  getGroupPublicKey(): Uint8Array {
    if (!this.groupPublicKey) {
      this.groupPublicKey = this.aggregatePublicShares();
    }
    return this.groupPublicKey;
  }

  private generateSecretShare(identifier: number): Uint8Array {
    const entropy = taggedHash('FROST', Buffer.concat([Buffer.from([identifier & 0xFF]), Buffer.from([(identifier >> 8) & 0xFF])]));
    return entropy.subarray(0, 32);
  }

  private computePublicShare(secretShare: Uint8Array): Uint8Array {
    return secp256k1.getPublicKey(secretShare);
  }

  private aggregatePublicShares(): Uint8Array {
    let aggregate = secp256k1.ProjectivePoint.BASE.multiply(0);
    for (const share of this.publicShares.values()) {
      const point = secp256k1.ProjectivePoint.fromHex(share);
      aggregate = aggregate.add(point);
    }
    return Buffer.from(aggregate.toRawBytes(false)).subarray(0, 32);
  }

  private generateNonce(): { di: Uint8Array; ei: Uint8Array } {
    const d = sha256(Buffer.concat([Buffer.from('FROST_NONCE_D'), Buffer.from([Math.floor(Math.random() * 256)])])).subarray(0, 32);
    const e = sha256(Buffer.concat([Buffer.from('FROST_NONCE_E'), d])).subarray(0, 32);
    return { di: d, ei: e };
  }

  private computeCommitment(nonce: { di: Uint8Array; ei: Uint8Array }, identifier: number): Uint8Array {
    const Di = secp256k1.getPublicKey(nonce.di);
    const Ei = secp256k1.getPublicKey(nonce.ei);
    return sha256(Buffer.concat([Di, Ei, Buffer.from([identifier & 0xFF])]));
  }

  private computeBindingFactor(commitment: Uint8Array, identifier: number, message: Uint8Array, groupPublicKey: Uint8Array): Uint8Array {
    const data = Buffer.concat([commitment, Buffer.from([identifier & 0xFF]), message, groupPublicKey]);
    return sha256(taggedHash('FROST', data)).subarray(0, 32);
  }

  private applyBindingFactor(nonce: { di: Uint8Array; ei: Uint8Array }, bindingFactor: Uint8Array): { di: Uint8Array; ei: Uint8Array } {
    const dBytes = this.addMod(nonce.di, bindingFactor);
    const eBytes = this.addMod(nonce.ei, bindingFactor);
    return { di: dBytes, ei: eBytes };
  }

  private computeChallenge(bindingNonce: { di: Uint8Array; ei: Uint8Array } | null, identifier: number, message: Uint8Array, groupPublicKey: Uint8Array): Uint8Array {
    const r = bindingNonce ? sha256(Buffer.concat([bindingNonce.di, bindingNonce.ei])) : Buffer.alloc(32, 0);
    const data = Buffer.concat([r, Buffer.from([identifier & 0xFF]), message, groupPublicKey]);
    return sha256(taggedHash('FROST', data)).subarray(0, 32);
  }

  private computeZI(bindingNonce: { di: Uint8Array; ei: Uint8Array }, secretShare: Uint8Array, challenge: Uint8Array): Uint8Array {
    const e = BigInt('0x' + Buffer.from(bindingNonce.ei).toString('hex')) % secp256k1.CURVE.n;
    const r = BigInt('0x' + Buffer.from(secretShare).toString('hex')) % secp256k1.CURVE.n;
    const c = BigInt('0x' + Buffer.from(challenge).toString('hex')) % secp256k1.CURVE.n;
    const z = (e + r * c) % secp256k1.CURVE.n;
    const hex = z.toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
  }

  private computeWI(bindingNonce: { di: Uint8Array; ei: Uint8Array }, challenge: Uint8Array): Uint8Array {
    const d = BigInt('0x' + Buffer.from(bindingNonce.di).toString('hex')) % secp256k1.CURVE.n;
    const c = BigInt('0x' + Buffer.from(challenge).toString('hex')) % secp256k1.CURVE.n;
    const w = (d - c * 0n) % secp256k1.CURVE.n;
    const positive = w < 0n ? w + secp256k1.CURVE.n : w;
    const hex = positive.toString(16).padStart(64, '0');
    return Buffer.from(hex, 'hex');
  }

  private computeRX(wi: Uint8Array, challengeNeg: Uint8Array): Uint8Array {
    const w = BigInt('0x' + Buffer.from(wi).toString('hex')) % secp256k1.CURVE.n;
    const c = BigInt('0x' + Buffer.from(challengeNeg).toString('hex')) % secp256k1.CURVE.n;
    const rxPoint = secp256k1.ProjectivePoint.BASE.multiply(Number(w)).add(secp256k1.ProjectivePoint.BASE.multiply(Number(c)));
    return Buffer.from(rxPoint.toRawBytes(false)).subarray(0, 32);
  }

  private scalarMult(scalar: Uint8Array, point: any): any {
    const n = BigInt('0x' + Buffer.from(scalar).toString('hex')) % secp256k1.CURVE.n;
    return point.multiply(Number(n));
  }

  private addMod(a: Uint8Array, b: Uint8Array): Buffer {
    const sum = (BigInt('0x' + Buffer.from(a).toString('hex')) + BigInt('0x' + Buffer.from(b).toString('hex'))) % secp256k1.CURVE.n;
    return Buffer.from(sum.toString(16).padStart(64, '0'), 'hex') as Buffer;
  }

  private modNegate(a: Uint8Array): Uint8Array {
    const n = Number(secp256k1.CURVE.n);
    const val = Number(BigInt('0x' + Buffer.from(a).toString('hex')) % BigInt(n));
    const neg = (n - val) % n;
    return Buffer.from(neg.toString(16).padStart(64, '0'), 'hex');
  }

  private toNumber(data: Uint8Array): number {
    return Number(BigInt('0x' + Buffer.from(data).toString('hex')) % secp256k1.CURVE.n);
  }
}
