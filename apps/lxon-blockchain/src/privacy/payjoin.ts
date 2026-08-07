import { sha256, hash160 } from '../crypto/hash';
import { secp256k1 as curvesSecp256k1 } from '@noble/curves/secp256k1';

const secp256k1: any = (curvesSecp256k1 as any).secp256k1;

export interface PayJoinInput {
  txid: Uint8Array;
  vout: number;
  value: bigint;
  scriptPubKey: Uint8Array;
  signature?: Buffer;
  publicKey?: Uint8Array;
}

export interface PayJoinOutput {
  value: bigint;
  scriptPubKey: Uint8Array;
  address: string;
  isChange: boolean;
}

export interface PayJoinProposal {
  originalOutputValue: bigint;
  originalOutputScript: Uint8Array;
  senderInputs: PayJoinInput[];
  receiverInputs: PayJoinInput[];
  outputs: PayJoinOutput[];
  fee: bigint;
  receiverPublicKey: Uint8Array;
}

export interface PayJoinResponse {
  addedInputs: PayJoinInput[];
  adjustedOutputs: PayJoinOutput[];
  totalAdded: bigint;
}

export class PayJoinProtocol {
  static createProposal(
    originalOutputValue: bigint,
    originalOutputScript: Uint8Array,
    senderInputs: PayJoinInput[],
    receiverPublicKey: Uint8Array
  ): PayJoinProposal {
    const totalInput = senderInputs.reduce((sum, i) => sum + i.value, 0n);
    const outputs: PayJoinOutput[] = [
      {
        value: originalOutputValue,
        scriptPubKey: originalOutputScript,
        address: '',
        isChange: false,
      },
    ];

    if (totalInput > originalOutputValue) {
      outputs.push({
        value: totalInput - originalOutputValue,
        scriptPubKey: Buffer.alloc(0),
        address: '',
        isChange: true,
      });
    }

    return {
      originalOutputValue,
      originalOutputScript,
      senderInputs,
      receiverInputs: [],
      outputs,
      fee: 0n,
      receiverPublicKey,
    };
  }

  static receiverRespond(
    proposal: PayJoinProposal,
    receiverInputs: PayJoinInput[],
    receiverChangeAddress: string
  ): PayJoinResponse {
    const totalSenderInput = proposal.senderInputs.reduce((sum, i) => sum + i.value, 0n);
    const totalReceiverInput = receiverInputs.reduce((sum, i) => sum + i.value, 0n);
    const totalInput = totalSenderInput + totalReceiverInput;

    const adjustedOutputs: PayJoinOutput[] = [];
    let outputTotal = 0n;

    for (const output of proposal.outputs) {
      if (output.isChange) {
        outputTotal += output.value;
        adjustedOutputs.push(output);
      }
    }

    const receiverOutput: PayJoinOutput = {
      value: proposal.originalOutputValue,
      scriptPubKey: proposal.originalOutputScript,
      address: receiverChangeAddress,
      isChange: false,
    };
    adjustedOutputs.push(receiverOutput);
    outputTotal += proposal.originalOutputValue;

    const fee = totalInput - outputTotal;
    if (fee < 0n) {
      throw new Error('Insufficient input value for PayJoin');
    }

    return {
      addedInputs: receiverInputs,
      adjustedOutputs,
      totalAdded: totalReceiverInput,
    };
  }

  static signInput(tx: PayJoinProposal, inputIndex: number, privateKey: Uint8Array): Buffer {
    const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
    const input = allInputs[inputIndex];
    if (!input) throw new Error('Invalid input index');

    const txDigest = this.computeTxDigest(tx, inputIndex);
    const signature = secp256k1.sign(txDigest, privateKey);
    return Buffer.from(signature.toCompactRawBytes());
  }

  static verifyInputSignature(tx: PayJoinProposal, inputIndex: number, signature: Buffer, publicKey: Uint8Array): boolean {
    const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
    const input = allInputs[inputIndex];
    if (!input || !input.publicKey) return false;

    const txDigest = this.computeTxDigest(tx, inputIndex);
    try {
      return secp256k1.verify(signature.subarray(0, 64), txDigest, publicKey);
    } catch {
      return false;
    }
  }

  private static computeTxDigest(tx: PayJoinProposal, inputIndex: number): Buffer {
    const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
    const input = allInputs[inputIndex];
    const hashPrevouts = sha256(
      Buffer.concat(allInputs.map(i => Buffer.concat([i.txid, Buffer.from([i.vout])])))
    );
    const hashSequence = sha256(Buffer.alloc(32));
    const hashOutputs = sha256(
      Buffer.concat(tx.outputs.map(o => Buffer.concat([Buffer.from(o.value.toString(16).padStart(16, '0')), o.scriptPubKey])))
    );
    return sha256(Buffer.concat([hashPrevouts, hashSequence, hashOutputs]));
  }
}
