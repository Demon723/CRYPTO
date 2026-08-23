"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CovenantEngine = exports.CovenantType = void 0;
const hash_1 = require("../crypto/hash");
var CovenantType;
(function (CovenantType) {
    CovenantType["TIME_LOCK"] = "time_lock";
    CovenantType["ADDRESS_RESTRICT"] = "address_restrict";
    CovenantType["AMOUNT_RESTRICT"] = "amount_restrict";
    CovenantType["RECURSIVE"] = "recursive";
    CovenantType["THRESHOLD"] = "threshold";
})(CovenantType || (exports.CovenantType = CovenantType = {}));
class CovenantEngine {
    static createTimeLock(unlockBlock, unlockTimestamp) {
        const params = Buffer.alloc(32);
        params.writeBigUInt64LE(unlockBlock, 0);
        params.writeBigUInt64LE(unlockTimestamp, 8);
        return {
            type: CovenantType.TIME_LOCK,
            params,
        };
    }
    static createAddressRestrict(allowedAddresses) {
        const params = Buffer.concat(allowedAddresses);
        return {
            type: CovenantType.ADDRESS_RESTRICT,
            params,
        };
    }
    static createAmountRestrict(minAmount, maxAmount) {
        const params = Buffer.alloc(32);
        params.writeBigUInt64LE(minAmount, 0);
        params.writeBigUInt64LE(maxAmount, 16);
        return {
            type: CovenantType.AMOUNT_RESTRICT,
            params,
        };
    }
    static createRecursive(nextCovenantHash, maxDepth) {
        const params = Buffer.alloc(36);
        Buffer.from(nextCovenantHash.subarray(0, 32)).copy(params, 0);
        params.writeUInt32LE(maxDepth, 32);
        return {
            type: CovenantType.RECURSIVE,
            params,
            childCovenant: undefined,
        };
    }
    static createThreshold(requiredSigs, pubkeys) {
        const params = Buffer.alloc(4 + pubkeys.length * 32);
        params.writeUInt32LE(requiredSigs, 0);
        for (let i = 0; i < pubkeys.length; i++) {
            Buffer.from(pubkeys[i].subarray(0, 32)).copy(params, 4 + i * 32);
        }
        return {
            type: CovenantType.THRESHOLD,
            params,
        };
    }
    static verifyCovenant(covenant, txContext) {
        switch (covenant.type) {
            case CovenantType.TIME_LOCK:
                return this.verifyTimeLock(covenant.params, txContext);
            case CovenantType.ADDRESS_RESTRICT:
                return this.verifyAddressRestrict(covenant.params, txContext);
            case CovenantType.AMOUNT_RESTRICT:
                return this.verifyAmountRestrict(covenant.params, txContext);
            case CovenantType.RECURSIVE:
                return this.verifyRecursive(covenant, txContext);
            case CovenantType.THRESHOLD:
                return this.verifyThreshold(covenant.params, txContext);
            default:
                return false;
        }
    }
    static hashCovenant(covenant) {
        const json = JSON.stringify(covenant);
        return (0, hash_1.sha256)(Buffer.from(json));
    }
    static verifyTimeLock(params, ctx) {
        const unlockBlock = params.readBigUInt64LE(0);
        const unlockTimestamp = params.readBigUInt64LE(8);
        return ctx.blockHeight >= unlockBlock && ctx.timestamp >= unlockTimestamp;
    }
    static verifyAddressRestrict(params, ctx) {
        if (!ctx.toAddress)
            return false;
        const addressCount = params.length / 32;
        for (let i = 0; i < addressCount; i++) {
            const allowed = params.subarray(i * 32, (i + 1) * 32);
            if (allowed.equals(ctx.toAddress))
                return true;
        }
        return false;
    }
    static verifyAmountRestrict(params, ctx) {
        const minAmount = params.readBigUInt64LE(0);
        const maxAmount = params.readBigUInt64LE(16);
        return ctx.amount >= minAmount && ctx.amount <= maxAmount;
    }
    static verifyRecursive(covenant, ctx) {
        if (!covenant.childCovenant)
            return true;
        return this.verifyCovenant(covenant.childCovenant, ctx);
    }
    static verifyThreshold(params, ctx) {
        const requiredSigs = params.readUInt32LE(0);
        const provided = ctx.signatures?.length || 0;
        return provided >= requiredSigs;
    }
}
exports.CovenantEngine = CovenantEngine;
