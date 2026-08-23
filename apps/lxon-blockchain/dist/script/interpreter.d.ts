export interface ScriptContext {
    txDigest: Uint8Array;
    inputIndex: number;
    inputSequence: number;
    lockTime: number;
    prevOutScript: Uint8Array;
    prevOutValue: bigint;
}
export interface ScriptResult {
    success: boolean;
    error?: string;
    stack: Buffer[];
    altStack: Buffer[];
}
export declare class ScriptInterpreter {
    private stack;
    private altStack;
    private pc;
    private script;
    private context;
    private conditionalDepth;
    private opcount;
    private maxOps;
    private maxScriptLength;
    private maxStackSize;
    private maxAltStackSize;
    constructor(script: Uint8Array, context: ScriptContext);
    setStack(stack: Buffer[]): void;
    execute(): ScriptResult;
    private getStack;
    private getAltStack;
    private pushData;
    private pushData1;
    private pushData2;
    private pushData4;
    private executeOp;
    private skipUnless;
    private skipOp;
    private isTruthy;
    private decodeNumber;
    private encodeNumber;
    private verifySignature;
    private fail;
}
export declare function evaluateScript(scriptPubKey: Uint8Array, scriptSig: Uint8Array, context: ScriptContext): ScriptResult;
