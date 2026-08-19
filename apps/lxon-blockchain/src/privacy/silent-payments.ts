import { sha256, taggedHash, hash160 } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface SilentPaymentKeys {
  scanPublicKey: Uint8Array;
  spendPublicKey: Uint8Array;
}

export interface SilentPaymentAddress {
  address: string;
  paymentCode: Uint8Array;
  tweakedPublicKey: Uint8Array;
}

export interface SilentPaymentInput {
  txid: Uint8Array;
  vout: number;
  value: bigint;
  scriptPubKey: Uint8Array;
  isSilentPayment: boolean;
  spendingKey?: Uint8Array;
}

export class SilentPaymentsProtocol {
  static generateKeys(): { scanPrivateKey: Uint8Array; spendPrivateKey: Uint8Array } {
    const scanPrivate = sha256(Buffer.concat([Buffer.from('SILENT_SCAN'), Buffer.from([Math.floor(Math.random() * 256)])])).subarray(0, 32);
    const spendPrivate = sha256(Buffer.concat([Buffer.from('SILENT_SPEND'), scanPrivate])).subarray(0, 32);
    return { scanPrivateKey: scanPrivate, spendPrivateKey: spendPrivate };
  }

  static generatePaymentCode(scanPublicKey: Uint8Array, spendPublicKey: Uint8Array): Uint8Array {
    return sha256(Buffer.concat([scanPublicKey, spendPublicKey])).subarray(0, 32);
  }

  static createSilentPaymentAddress(
    senderScanPublic: Uint8Array,
    receiverScanPublic: Uint8Array,
    receiverSpendPublic: Uint8Array,
    label?: Uint8Array
  ): SilentPaymentAddress {
    const sharedSecret = this.computeSharedSecret(senderScanPublic, receiverScanPublic);
    const tweakedSpend = this.tweakPublicKey(receiverSpendPublic, sharedSecret, label);
    const paymentCode = this.generatePaymentCode(receiverScanPublic, receiverSpendPublic);
    const address = this.publicKeyToAddress(tweakedSpend);

    return {
      address,
      paymentCode,
      tweakedPublicKey: tweakedSpend,
    };
  }

  static computeSharedSecret(senderScanPublic: Uint8Array, receiverScanPublic: Uint8Array): Uint8Array {
    const sharedPoint = secp256k1.ProjectivePoint.fromHex(receiverScanPublic);
    const scalar = BigInt('0x' + Buffer.from(sha256(senderScanPublic)).toString('hex')) % secp256k1.CURVE.n;
    const shared = sharedPoint.multiply(Number(scalar));
    return sha256(Buffer.from(shared.toRawBytes(false))).subarray(0, 32);
  }

  static tweakPublicKey(publicKey: Uint8Array, tweak: Uint8Array, label?: Uint8Array): Uint8Array {
    const point = secp256k1.ProjectivePoint.fromHex(publicKey);
    const labelData = label || Buffer.alloc(0);
    const tweakHash = sha256(Buffer.concat([publicKey, tweak, labelData]));
    const tweakNum = BigInt('0x' + Buffer.from(tweakHash).toString('hex')) % secp256k1.CURVE.n;
    const tweaked = point.add(secp256k1.ProjectivePoint.BASE.multiply(Number(tweakNum)));
    return Buffer.from(tweaked.toRawBytes(false)).subarray(0, 32);
  }

  static verifySilentPayment(
    input: SilentPaymentInput,
    receiverScanPrivate: Uint8Array,
    receiverSpendPrivate: Uint8Array
  ): boolean {
    if (!input.isSilentPayment || !input.spendingKey) return false;
    const expected = this.computeSpendingKey(receiverScanPrivate, receiverSpendPrivate, input.txid);
    return Buffer.from(input.spendingKey).equals(Buffer.from(expected));
  }

  static computeSpendingKey(scanPrivate: Uint8Array, spendPrivate: Uint8Array, txid: Uint8Array): Uint8Array {
    const scanPublic = secp256k1.getPublicKey(scanPrivate);
    const sharedSecret = this.computeSharedSecret(scanPublic, scanPublic);
    const tweaked = this.tweakPublicKey(secp256k1.getPublicKey(spendPrivate), sharedSecret, txid);
    const tweakHash = sha256(Buffer.concat([tweaked, txid]));
    const tweakNum = BigInt('0x' + Buffer.from(tweakHash).toString('hex')) % secp256k1.CURVE.n;
    const spendPrivNum = BigInt('0x' + Buffer.from(spendPrivate).toString('hex')) % secp256k1.CURVE.n;
    const finalPriv = (spendPrivNum + tweakNum) % secp256k1.CURVE.n;
    return Buffer.from(finalPriv.toString(16).padStart(64, '0'), 'hex');
  }

  static detectSilentPaymentOutput(outputScript: Uint8Array): boolean {
    const prefix = outputScript.subarray(0, 1);
    return prefix[0] === 0x51;
  }

  static extractOutputPublicKey(outputScript: Uint8Array): Uint8Array | null {
    if (outputScript.length < 33) return null;
    return outputScript.subarray(1, 34);
  }

  private static publicKeyToAddress(publicKey: Uint8Array): string {
    const hash = hash160(publicKey);
    const payload = Buffer.concat([Buffer.from([0x6f]), hash]);
    return this.base58Check(payload);
  }

  private static base58Check(payload: Buffer): string {
    const checksum = sha256(sha256(payload)).subarray(0, 4);
    const address = Buffer.concat([payload, checksum]);
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt('0x' + address.toString('hex'));
    let result = '';
    while (num > 0n) {
      const mod = num % 58n;
      result = alphabet[Number(mod)] + result;
      num = num / 58n;
    }
    for (let i = 0; i < address.length && address[i] === 0; i++) {
      result = '1' + result;
    }
    return result;
  }
}
