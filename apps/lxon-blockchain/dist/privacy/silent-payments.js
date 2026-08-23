"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SilentPaymentsProtocol = void 0;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = secp256k1_1.secp256k1.secp256k1;
class SilentPaymentsProtocol {
    static generateKeys() {
        const scanPrivate = (0, hash_1.sha256)(Buffer.concat([Buffer.from('SILENT_SCAN'), Buffer.from([Math.floor(Math.random() * 256)])])).subarray(0, 32);
        const spendPrivate = (0, hash_1.sha256)(Buffer.concat([Buffer.from('SILENT_SPEND'), scanPrivate])).subarray(0, 32);
        return { scanPrivateKey: scanPrivate, spendPrivateKey: spendPrivate };
    }
    static generatePaymentCode(scanPublicKey, spendPublicKey) {
        return (0, hash_1.sha256)(Buffer.concat([scanPublicKey, spendPublicKey])).subarray(0, 32);
    }
    static createSilentPaymentAddress(senderScanPublic, receiverScanPublic, receiverSpendPublic, label) {
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
    static computeSharedSecret(senderScanPublic, receiverScanPublic) {
        const sharedPoint = secp256k1.ProjectivePoint.fromHex(receiverScanPublic);
        const scalar = BigInt('0x' + Buffer.from((0, hash_1.sha256)(senderScanPublic)).toString('hex')) % secp256k1.CURVE.n;
        const shared = sharedPoint.multiply(Number(scalar));
        return (0, hash_1.sha256)(Buffer.from(shared.toRawBytes(false))).subarray(0, 32);
    }
    static tweakPublicKey(publicKey, tweak, label) {
        const point = secp256k1.ProjectivePoint.fromHex(publicKey);
        const labelData = label || Buffer.alloc(0);
        const tweakHash = (0, hash_1.sha256)(Buffer.concat([publicKey, tweak, labelData]));
        const tweakNum = BigInt('0x' + Buffer.from(tweakHash).toString('hex')) % secp256k1.CURVE.n;
        const tweaked = point.add(secp256k1.ProjectivePoint.BASE.multiply(Number(tweakNum)));
        return Buffer.from(tweaked.toRawBytes(false)).subarray(0, 32);
    }
    static verifySilentPayment(input, receiverScanPrivate, receiverSpendPrivate) {
        if (!input.isSilentPayment || !input.spendingKey)
            return false;
        const expected = this.computeSpendingKey(receiverScanPrivate, receiverSpendPrivate, input.txid);
        return Buffer.from(input.spendingKey).equals(Buffer.from(expected));
    }
    static computeSpendingKey(scanPrivate, spendPrivate, txid) {
        const scanPublic = secp256k1.getPublicKey(scanPrivate);
        const sharedSecret = this.computeSharedSecret(scanPublic, scanPublic);
        const tweaked = this.tweakPublicKey(secp256k1.getPublicKey(spendPrivate), sharedSecret, txid);
        const tweakHash = (0, hash_1.sha256)(Buffer.concat([tweaked, txid]));
        const tweakNum = BigInt('0x' + Buffer.from(tweakHash).toString('hex')) % secp256k1.CURVE.n;
        const spendPrivNum = BigInt('0x' + Buffer.from(spendPrivate).toString('hex')) % secp256k1.CURVE.n;
        const finalPriv = (spendPrivNum + tweakNum) % secp256k1.CURVE.n;
        return Buffer.from(finalPriv.toString(16).padStart(64, '0'), 'hex');
    }
    static detectSilentPaymentOutput(outputScript) {
        const prefix = outputScript.subarray(0, 1);
        return prefix[0] === 0x51;
    }
    static extractOutputPublicKey(outputScript) {
        if (outputScript.length < 33)
            return null;
        return outputScript.subarray(1, 34);
    }
    static publicKeyToAddress(publicKey) {
        const hash = (0, hash_1.hash160)(publicKey);
        const payload = Buffer.concat([Buffer.from([0x6f]), hash]);
        return this.base58Check(payload);
    }
    static base58Check(payload) {
        const checksum = (0, hash_1.sha256)((0, hash_1.sha256)(payload)).subarray(0, 4);
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
exports.SilentPaymentsProtocol = SilentPaymentsProtocol;
