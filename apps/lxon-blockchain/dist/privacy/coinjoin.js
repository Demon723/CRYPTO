"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinJoinProtocol = void 0;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = secp256k1_1.secp256k1.secp256k1;
class CoinJoinProtocol {
    static createRound(participants, feeRate) {
        const id = (0, hash_1.sha256)(Buffer.from(participants.join(',') + Date.now()));
        return {
            id,
            participants,
            inputs: new Map(),
            outputs: new Map(),
            feeRate,
            status: 'pending',
        };
    }
    static addParticipantInput(round, participant, input) {
        if (!round.participants.includes(participant)) {
            throw new Error('Participant not in round');
        }
        round.inputs.set(participant, input);
    }
    static addParticipantOutput(round, participant, output) {
        if (!round.participants.includes(participant)) {
            throw new Error('Participant not in round');
        }
        round.outputs.set(participant, output);
    }
    static buildTransaction(round) {
        const inputs = [];
        const outputs = [];
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
    static signInput(tx, inputIndex, privateKey) {
        const input = tx.inputs[inputIndex];
        if (!input)
            throw new Error('Invalid input index');
        const txDigest = this.computeTxDigest(tx, inputIndex);
        const signature = secp256k1.sign(txDigest, privateKey);
        return Buffer.from(signature.toCompactRawBytes());
    }
    static verifyInputSignature(tx, inputIndex, signature, publicKey) {
        const input = tx.inputs[inputIndex];
        if (!input || !input.publicKey)
            return false;
        const txDigest = this.computeTxDigest(tx, inputIndex);
        try {
            return secp256k1.verify(signature.subarray(0, 64), txDigest, publicKey);
        }
        catch {
            return false;
        }
    }
    static computeTxDigest(tx, inputIndex) {
        const input = tx.inputs[inputIndex];
        const hashPrevouts = (0, hash_1.sha256)(Buffer.concat(tx.inputs.map(i => Buffer.concat([i.txid, Buffer.from([i.vout])]))));
        const hashSequence = (0, hash_1.sha256)(Buffer.alloc(32));
        const hashOutputs = (0, hash_1.sha256)(Buffer.concat(tx.outputs.map(o => Buffer.concat([Buffer.from(o.value.toString(16).padStart(16, '0')), o.scriptPubKey]))));
        return (0, hash_1.sha256)(Buffer.concat([hashPrevouts, hashSequence, hashOutputs]));
    }
}
exports.CoinJoinProtocol = CoinJoinProtocol;
