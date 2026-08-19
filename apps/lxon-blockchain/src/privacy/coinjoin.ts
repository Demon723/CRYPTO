import { sha256, hash160 } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface CoinJoinInput {
  txid: Uint8Array;
  vout: number;
  value: bigint;
  scriptPubKey: Uint8Array;
  signature?: Buffer;
  publicKey?: Uint8Array;
}

export interface CoinJoinOutput {
  value: bigint;
  scriptPubKey: Uint8Array;
  address: string;
}

export interface CoinJoinTransaction {
  inputs: CoinJoinInput[];
  outputs: CoinJoinOutput[];
  fee: bigint;
  coordinatorPublicKey?: Uint8Array;
}

export interface CoinJoinRound {
  id: Uint8Array;
  participants: string[];
  inputs: Map<string, CoinJoinInput>;
  outputs: Map<string, CoinJoinOutput>;
  feeRate: bigint;
  status: 'pending' | 'signed' | 'broadcast';
}

export class CoinJoinProtocol {
  static createRound(participants: string[], feeRate: bigint): CoinJoinRound {
    const id = sha256(Buffer.from(participants.join(',') + Date.now()));
    return {
      id,
      participants,
      inputs: new Map(),
      outputs: new Map(),
      feeRate,
      status: 'pending',
    };
  }

  static addParticipantInput(round: CoinJoinRound, participant: string, input: CoinJoinInput): void {
    if (!round.participants.includes(participant)) {
      throw new Error('Participant not in round');
    }
    round.inputs.set(participant, input);
  }

  static addParticipantOutput(round: CoinJoinRound, participant: string, output: CoinJoinOutput): void {
    if (!round.participants.includes(participant)) {
      throw new Error('Participant not in round');
    }
    round.outputs.set(participant, output);
  }

  static buildTransaction(round: CoinJoinRound): CoinJoinTransaction {
    const inputs: CoinJoinInput[] = [];
    const outputs: CoinJoinOutput[] = [];
    let totalInput = 0n;
    let totalOutput = 0n;

    for (const participant of round.participants) {
      const input = round.inputs.get(participant);
      if (input) {
        inputs.push(input);
        totalInput += input.value;
      }

      const output = round.outputs.get(participant);
      if (output) {
        outputs.push(output);
        totalOutput += output.value;
      }
    }

    const fee = totalInput - totalOutput;
    if (fee < 0n) {
      throw new Error('Insufficient input value');
    }

    const coordinatorFee = (fee * BigInt(round.participants.length)) / 100n;
    const remainingFee = fee - coordinatorFee;

    return {
      inputs,
      outputs,
      fee: remainingFee,
      coordinatorPublicKey: undefined,
    };
  }

  static signInput(tx: CoinJoinTransaction, inputIndex: number, privateKey: Uint8Array): Buffer {
    const input = tx.inputs[inputIndex];
    if (!input) throw new Error('Invalid input index');

    const txDigest = this.computeTxDigest(tx, inputIndex);
    const signature = secp256k1.sign(txDigest, privateKey);
    return Buffer.from(signature.toCompactRawBytes());
  }

  static verifyInputSignature(tx: CoinJoinTransaction, inputIndex: number, signature: Buffer, publicKey: Uint8Array): boolean {
    const input = tx.inputs[inputIndex];
    if (!input || !input.publicKey) return false;

    const txDigest = this.computeTxDigest(tx, inputIndex);
    try {
      return secp256k1.verify(signature.subarray(0, 64), txDigest, publicKey);
    } catch {
      return false;
    }
  }

  private static computeTxDigest(tx: CoinJoinTransaction, inputIndex: number): Buffer {
    const input = tx.inputs[inputIndex];
    const hashPrevouts = sha256(
      Buffer.concat(tx.inputs.map(i => Buffer.concat([i.txid, Buffer.from([i.vout])])))
    );
    const hashSequence = sha256(Buffer.alloc(32));
    const hashOutputs = sha256(
      Buffer.concat(tx.outputs.map(o => Buffer.concat([Buffer.from(o.value.toString(16).padStart(16, '0')), o.scriptPubKey])))
    );
    return sha256(Buffer.concat([hashPrevouts, hashSequence, hashOutputs]));
  }
}
