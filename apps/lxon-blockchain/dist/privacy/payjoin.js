"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayJoinProtocol = void 0;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = secp256k1_1.secp256k1.secp256k1;
class PayJoinProtocol {
    static createProposal(originalOutputValue, originalOutputScript, senderInputs, receiverPublicKey) {
        const totalInput = senderInputs.reduce((sum, i) => sum + i.value, 0n);
        const outputs = [
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
    static receiverRespond(proposal, receiverInputs, receiverChangeAddress) {
        const totalSenderInput = proposal.senderInputs.reduce((sum, i) => sum + i.value, 0n);
        const totalReceiverInput = receiverInputs.reduce((sum, i) => sum + i.value, 0n);
        const totalInput = totalSenderInput + totalReceiverInput;
        const adjustedOutputs = [];
        let outputTotal = 0n;
        for (const output of proposal.outputs) {
            if (output.isChange) {
                outputTotal += output.value;
                adjustedOutputs.push(output);
            }
        }
        const receiverOutput = {
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
    static signInput(tx, inputIndex, privateKey) {
        const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
        const input = allInputs[inputIndex];
        if (!input)
            throw new Error('Invalid input index');
        const txDigest = this.computeTxDigest(tx, inputIndex);
        const signature = secp256k1.sign(txDigest, privateKey);
        return Buffer.from(signature.toCompactRawBytes());
    }
    static verifyInputSignature(tx, inputIndex, signature, publicKey) {
        const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
        const input = allInputs[inputIndex];
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
        const allInputs = [...tx.senderInputs, ...tx.receiverInputs];
        const input = allInputs[inputIndex];
        const hashPrevouts = (0, hash_1.sha256)(Buffer.concat(allInputs.map(i => Buffer.concat([i.txid, Buffer.from([i.vout])]))));
        const hashSequence = (0, hash_1.sha256)(Buffer.alloc(32));
        const hashOutputs = (0, hash_1.sha256)(Buffer.concat(tx.outputs.map(o => Buffer.concat([Buffer.from(o.value.toString(16).padStart(16, '0')), o.scriptPubKey]))));
        return (0, hash_1.sha256)(Buffer.concat([hashPrevouts, hashSequence, hashOutputs]));
    }
}
exports.PayJoinProtocol = PayJoinProtocol;
