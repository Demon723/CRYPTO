export declare enum CovenantType {
    TIME_LOCK = "time_lock",
    ADDRESS_RESTRICT = "address_restrict",
    AMOUNT_RESTRICT = "amount_restrict",
    RECURSIVE = "recursive",
    THRESHOLD = "threshold"
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
export declare class CovenantEngine {
    static createTimeLock(unlockBlock: bigint, unlockTimestamp: bigint): Covenant;
    static createAddressRestrict(allowedAddresses: Uint8Array[]): Covenant;
    static createAmountRestrict(minAmount: bigint, maxAmount: bigint): Covenant;
    static createRecursive(nextCovenantHash: Uint8Array, maxDepth: number): Covenant;
    static createThreshold(requiredSigs: number, pubkeys: Uint8Array[]): Covenant;
    static verifyCovenant(covenant: Covenant, txContext: {
        blockHeight: bigint;
        timestamp: bigint;
        toAddress?: Uint8Array;
        amount: bigint;
        signatures?: Buffer[];
    }): boolean;
    static hashCovenant(covenant: Covenant): Uint8Array;
    private static verifyTimeLock;
    private static verifyAddressRestrict;
    private static verifyAmountRestrict;
    private static verifyRecursive;
    private static verifyThreshold;
}
