import { sha256, taggedHash, hash256 } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface MASTNode {
  hash: Uint8Array;
  left?: MASTNode;
  right?: MASTNode;
  script?: Uint8Array;
}

export interface TaprootOutput {
  outputKey: Uint8Array;
  scriptPath?: Uint8Array;
  merkleRoot?: Uint8Array;
}

export class MASTBuilder {
  private scripts: Uint8Array[] = [];

  addScript(script: Uint8Array): void {
    this.scripts.push(script);
  }

  build(): Uint8Array {
    if (this.scripts.length === 0) {
      return sha256(Buffer.from([]));
    }

    let nodes: Uint8Array[] = this.scripts.map(script => {
      const tagHash = taggedHash('TapScript', script);
      return sha256(Buffer.concat([Buffer.from([0x00]), tagHash, script]));
    });

    while (nodes.length > 1) {
      const next: Uint8Array[] = [];
      for (let i = 0; i < nodes.length; i += 2) {
        if (i + 1 < nodes.length) {
          const left = nodes[i];
          const right = nodes[i + 1];
          const pair = left[0] < right[0] ? Buffer.concat([left, right]) : Buffer.concat([right, left]);
          next.push(sha256(pair));
        } else {
          next.push(nodes[i]);
        }
      }
      nodes = next;
    }

    return nodes[0];
  }

  getScriptCount(): number {
    return this.scripts.length;
  }
}

export class TaprootEngine {
  static createKeyPathOutput(internalPubKey: Uint8Array, merkleRoot?: Uint8Array): TaprootOutput {
    const tweaked = TaprootEngine.tweakPublicKey(internalPubKey, merkleRoot);
    return {
      outputKey: Buffer.from(tweaked),
      scriptPath: undefined,
      merkleRoot,
    };
  }

  static createScriptPathOutput(internalPubKey: Uint8Array, script: Uint8Array): TaprootOutput {
    const mast = new MASTBuilder();
    mast.addScript(script);
    const merkleRoot = mast.build();
    return TaprootEngine.createKeyPathOutput(internalPubKey, merkleRoot);
  }

  static tweakPublicKey(internalPubKey: Uint8Array, merkleRoot?: Uint8Array): Uint8Array {
    const point = secp256k1.ProjectivePoint.fromHex(internalPubKey);
    const tweak = merkleRoot
      ? taggedHash('TapTweak', Buffer.concat([internalPubKey, merkleRoot]))
      : taggedHash('TapTweak', internalPubKey);
    const tweakNum = Number(BigInt('0x' + Buffer.from(tweak).toString('hex')) % secp256k1.CURVE.n);
    const tweaked = point.add(secp256k1.ProjectivePoint.BASE.multiply(tweakNum));
    return Buffer.from(tweaked.toHex(), 'hex');
  }

  static verifyTaprootSignature(
    outputKey: Uint8Array,
    signature: Uint8Array,
    message: Uint8Array
  ): boolean {
    try {
      return secp256k1.verify(signature.subarray(0, 64), message, outputKey);
    } catch {
      return false;
    }
  }

  static createSchnorrSignature(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
    const sig = secp256k1.sign(message, privateKey);
    return Buffer.concat([sig.toCompactRawBytes(), Buffer.from([0])]);
  }

  static verifySchnorrSignature(publicKey: Uint8Array, signature: Uint8Array, message: Uint8Array): boolean {
    try {
      return secp256k1.verify(signature.subarray(0, 64), message, publicKey);
    } catch {
      return false;
    }
  }

  static hashScript(script: Uint8Array): Uint8Array {
    const tagHash = taggedHash('TapScript', script);
    return sha256(Buffer.concat([Buffer.from([0x00]), tagHash, script]));
  }

  static verifyMerkleProof(leafHash: Uint8Array, root: Uint8Array, proof: Uint8Array[]): boolean {
    let current = leafHash;
    for (const sibling of proof) {
      const pair = current[0] < sibling[0] ? Buffer.concat([current, sibling]) : Buffer.concat([sibling, current]);
      current = sha256(pair);
    }
    return Buffer.from(current).equals(Buffer.from(root));
  }
}

export interface TapLeaf {
  version: number;
  script: Uint8Array;
}

export function createTapLeaf(script: Uint8Array, version: number = 0xc0): Uint8Array {
  return Buffer.concat([Buffer.from([version]), script]);
}

export function computeTapLeafHash(leaf: Uint8Array): Uint8Array {
  return TaprootEngine.hashScript(leaf);
}
