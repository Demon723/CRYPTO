import { sha256, sha256x2, hash160, hmacSha512 } from './hash';
import { secp256k1 } from '@noble/curves/secp256k1';

export interface CryptoUser {
  address: string;
  publicKey: string;
  balance?: string;
  nonce?: number;
  metadata?: Record<string, any>;
}

export interface CryptoTx {
  txIndex: number;
  readKeys: string[];
  writeDict?: Record<string, any>;
  logic?: string;
  sender: string;
  signature?: string;
}

export function encodeUser(user: CryptoUser): Uint8Array {
  const parts = [
    Buffer.from(user.address),
    Buffer.from(user.publicKey),
    Buffer.from(user.balance ?? '0'),
    Buffer.from((user.nonce ?? 0).toString()),
  ];

  if (user.metadata) {
    parts.push(Buffer.from(JSON.stringify(user.metadata)));
  }

  const combined = Buffer.concat(parts);
  return new Uint8Array(combined);
}

export function hashUser(user: CryptoUser): string {
  const encoded = encodeUser(user);
  return hash160(encoded).toString('hex');
}

export function encodeTransaction(tx: CryptoTx): Uint8Array {
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

export function hashTransaction(tx: CryptoTx): string {
  const encoded = encodeTransaction(tx);
  return sha256x2(encoded).toString('hex');
}

export function signTransaction(tx: CryptoTx, privateKeyHex: string): string {
  const messageHash = new Uint8Array(sha256x2(encodeTransaction(tx)));
  const signature = secp256k1.sign(messageHash, privateKeyHex);
  return signature.toCompactHex();
}

export function verifyTransactionSignature(
  tx: CryptoTx,
  signatureHex: string,
  publicKeyHex: string
): boolean {
  const messageHash = sha256x2(encodeTransaction(tx));
  try {
    const valid = (secp256k1.verify as any)(
      signatureHex,
      new Uint8Array(messageHash),
      new Uint8Array(Buffer.from(publicKeyHex, 'hex'))
    );
    return valid;
  } catch {
    return false;
  }
}

export function generateUserStateRoot(users: CryptoUser[]): string {
  if (users.length === 0) {
    return sha256(Buffer.alloc(0)).toString('hex');
  }

  const leaves = users.map((u) => {
    const encoded = encodeUser(u);
    return sha256x2(encoded);
  });

  let level = leaves;
  while (level.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(sha256x2(Buffer.concat([left, right])));
    }
    level = next;
  }

  return level[0].toString('hex');
}

export function generateTxMerkleRoot(txs: CryptoTx[]): string {
  if (txs.length === 0) {
    return sha256(Buffer.alloc(0)).toString('hex');
  }

  const leaves = txs.map((tx) => {
    const encoded = encodeTransaction(tx);
    return sha256x2(encoded);
  });

  let level = leaves;
  while (level.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(sha256x2(Buffer.concat([left, right])));
    }
    level = next;
  }

  return level[0].toString('hex');
}

export function deriveAddressFromPublicKey(publicKeyHex: string): string {
  const pubKeyBuffer = Buffer.from(publicKeyHex, 'hex');
  const h160 = hash160(pubKeyBuffer);
  return h160.toString('hex');
}

export const ASTRO_ALGORITHM = {
  ECDSA: 0x01,
  SLS44: 0x02,
  SLS65: 0x03,
  NFS512: 0x04,
  NFS1024: 0x05,
  CHS128S: 0x06,
  CHS128F: 0x07,
} as const;

export type AstroAlgorithmId = typeof ASTRO_ALGORITHM[keyof typeof ASTRO_ALGORITHM];

export interface AstroSignature {
  version: number;
  classicalSig: Uint8Array;
  classicalPub: Uint8Array;
  arcSigma: Uint8Array;
  arcPubKey: Uint8Array;
  algorithmId: AstroAlgorithmId;
  ephemeralPubKey: Uint8Array;
  nonce: bigint;
}

export interface AstroKeypair {
  privateKeyHex: string;
  publicKeyHex: string;
  arcPublicKey: Uint8Array;
  arcPrivateKey: Uint8Array;
  address: string;
}

export function encodeAstroSignature(sig: AstroSignature): Uint8Array {
  const buf = Buffer.concat([
    Buffer.from([sig.version]),
    Buffer.from([ASTRO_ALGORITHM.ECDSA]),
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

export function hashAstroSignature(sig: AstroSignature): string {
  const encoded = encodeAstroSignature(sig);
  return sha256x2(encoded).toString('hex');
}

export function generateAstroAddress(classicalPub: Uint8Array, arcPub: Uint8Array): string {
  const combined = Buffer.concat([Buffer.from(classicalPub), Buffer.from(arcPub)]);
  return hash160(combined).toString('hex');
}

export function getAstroPhase(genesisTime: number, blockTime: number): number {
  const age = blockTime - genesisTime;
  const hybridEnd = 10 * 365 * 24 * 60 * 60;
  const transitionEnd = 20 * 365 * 24 * 60 * 60;
  const arv2Start = 50 * 365 * 24 * 60 * 60;
  if (age < hybridEnd) return 0;
  if (age < transitionEnd) return 1;
  if (age < arv2Start) return 2;
  return 3;
}
