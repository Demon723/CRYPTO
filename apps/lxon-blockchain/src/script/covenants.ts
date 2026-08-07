import { sha256 } from '../crypto/hash';

export enum CovenantType {
  TIME_LOCK = 'time_lock',
  ADDRESS_RESTRICT = 'address_restrict',
  AMOUNT_RESTRICT = 'amount_restrict',
  RECURSIVE = 'recursive',
  THRESHOLD = 'threshold',
}

export interface Covenant {
  type: CovenantType;
  params: Buffer;
  childCovenant?: Covenant;
}

export interface TimeLockCovenant {
  unlockBlock: bigint;
  unlockTimestamp: bigint;
}

export interface AddressRestrictCovenant {
  allowedAddresses: Uint8Array[];
}

export interface AmountRestrictCovenant {
  minAmount: bigint;
  maxAmount: bigint;
}

export interface RecursiveCovenant {
  nextCovenantHash: Uint8Array;
  maxDepth: number;
}

export interface ThresholdCovenant {
  requiredSigs: number;
  totalKeys: number;
  pubkeys: Uint8Array[];
}

export class CovenantEngine {
  static createTimeLock(unlockBlock: bigint, unlockTimestamp: bigint): Covenant {
    const params = Buffer.alloc(32);
    params.writeBigUInt64LE(unlockBlock, 0);
    params.writeBigUInt64LE(unlockTimestamp, 8);
    return {
      type: CovenantType.TIME_LOCK,
      params,
    };
  }

  static createAddressRestrict(allowedAddresses: Uint8Array[]): Covenant {
    const params = Buffer.concat(allowedAddresses);
    return {
      type: CovenantType.ADDRESS_RESTRICT,
      params,
    };
  }

  static createAmountRestrict(minAmount: bigint, maxAmount: bigint): Covenant {
    const params = Buffer.alloc(32);
    params.writeBigUInt64LE(minAmount, 0);
    params.writeBigUInt64LE(maxAmount, 16);
    return {
      type: CovenantType.AMOUNT_RESTRICT,
      params,
    };
  }

  static createRecursive(nextCovenantHash: Uint8Array, maxDepth: number): Covenant {
    const params = Buffer.alloc(36);
    Buffer.from(nextCovenantHash.subarray(0, 32)).copy(params, 0);
    params.writeUInt32LE(maxDepth, 32);
    return {
      type: CovenantType.RECURSIVE,
      params,
      childCovenant: undefined,
    };
  }

  static createThreshold(requiredSigs: number, pubkeys: Uint8Array[]): Covenant {
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

  static verifyCovenant(covenant: Covenant, txContext: {
    blockHeight: bigint;
    timestamp: bigint;
    toAddress?: Uint8Array;
    amount: bigint;
    signatures?: Buffer[];
  }): boolean {
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

  static hashCovenant(covenant: Covenant): Uint8Array {
    const json = JSON.stringify(covenant);
    return sha256(Buffer.from(json));
  }

  private static verifyTimeLock(params: Buffer, ctx: { blockHeight: bigint; timestamp: bigint }): boolean {
    const unlockBlock = params.readBigUInt64LE(0);
    const unlockTimestamp = params.readBigUInt64LE(8);
    return ctx.blockHeight >= unlockBlock && ctx.timestamp >= unlockTimestamp;
  }

  private static verifyAddressRestrict(params: Buffer, ctx: { toAddress?: Uint8Array }): boolean {
    if (!ctx.toAddress) return false;
    const addressCount = params.length / 32;
    for (let i = 0; i < addressCount; i++) {
      const allowed = params.subarray(i * 32, (i + 1) * 32);
      if (allowed.equals(ctx.toAddress)) return true;
    }
    return false;
  }

  private static verifyAmountRestrict(params: Buffer, ctx: { amount: bigint }): boolean {
    const minAmount = params.readBigUInt64LE(0);
    const maxAmount = params.readBigUInt64LE(16);
    return ctx.amount >= minAmount && ctx.amount <= maxAmount;
  }

  private static verifyRecursive(covenant: Covenant, ctx: any): boolean {
    if (!covenant.childCovenant) return true;
    return this.verifyCovenant(covenant.childCovenant, ctx);
  }

  private static verifyThreshold(params: Buffer, ctx: { signatures?: Buffer[] }): boolean {
    const requiredSigs = params.readUInt32LE(0);
    const provided = ctx.signatures?.length || 0;
    return provided >= requiredSigs;
  }
}
