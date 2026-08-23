/**
 * Enhanced Scripting System for LXON Blockchain
 *
 * Integrates Bitcoin's advanced scripting capabilities:
 * - Miniscript: Composable, analyzable spending policies
 * - Simplicity: Formally verified, functional programming language
 * - Taproot: Key-path and script-path spending
 * - Bitcoin Script compatibility for ecosystem integration
 *
 * This provides:
 * - Composability: Complex spending policies from simple primitives
 * - Safety: Formal verification and static analysis
 * - Privacy: Taproot's key-path spending hides script complexity
 * - Interoperability: Compatibility with Bitcoin tooling
 */
export type MiniscriptFragment = {
    type: 'pk';
    key: Buffer;
} | {
    type: 'pk_h';
    keyHash: Buffer;
} | {
    type: 'after';
    locktime: number;
} | {
    type: 'older';
    sequence: number;
} | {
    type: 'sha256';
    hash: Buffer;
} | {
    type: 'hash256';
    hash: Buffer;
} | {
    type: 'ripemd160';
    hash: Buffer;
} | {
    type: 'hash160';
    hash: Buffer;
} | {
    type: 'thresh';
    threshold: number;
    fragments: MiniscriptFragment[];
} | {
    type: 'multi';
    threshold: number;
    keys: Buffer[];
} | {
    type: 'and';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'or';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'or_d';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'or_c';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'or_i';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'and_v';
    left: MiniscriptFragment;
    right: MiniscriptFragment;
} | {
    type: 'and_or';
    a: MiniscriptFragment;
    b: MiniscriptFragment;
    c: MiniscriptFragment;
} | {
    type: 'thresh';
    k: number;
    n: number;
    fragments: MiniscriptFragment[];
};
export interface MiniscriptPolicy {
    miniscript: MiniscriptFragment;
    satisfactionConditions: string[];
    maxWitnessSize: number;
    maxSatWeight: number;
}
export declare class MiniscriptCompiler {
    /**
     * Compile a Miniscript fragment to Bitcoin Script
     */
    compileMiniscript(fragment: MiniscriptFragment): Buffer;
    private compilePK;
    private compilePKH;
    private compileAfter;
    private compileOlder;
    private compileSHA256;
    private compileHash256;
    private compileRipemd160;
    private compileHash160;
    private compileMulti;
    private compileThresh;
    private compileAnd;
    private compileOr;
    private compileOrD;
    private compileOrC;
    private compileOrI;
    private compileAndV;
    private compileAndOr;
    private encodeNumber;
    /**
     * Analyze Miniscript for safety properties
     */
    analyzeMiniscript(fragment: MiniscriptFragment): {
        isSafe: boolean;
        isNonMalleable: boolean;
        maxSatisfactionWeight: number;
        needsSignature: boolean;
    };
}
export type SimplicityTerm = {
    type: 'iden';
} | {
    type: 'unit';
} | {
    type: 'injl';
    term: SimplicityTerm;
} | {
    type: 'injr';
    term: SimplicityTerm;
} | {
    type: 'take';
    term: SimplicityTerm;
} | {
    type: 'drop';
    term: SimplicityTerm;
} | {
    type: 'comp';
    left: SimplicityTerm;
    right: SimplicityTerm;
} | {
    type: 'case';
    left: SimplicityTerm;
    right: SimplicityTerm;
} | {
    type: 'pair';
    left: SimplicityTerm;
    right: SimplicityTerm;
} | {
    type: 'disconnect';
    left: SimplicityTerm;
    right: SimplicityTerm;
} | {
    type: 'loop';
    left: SimplicityTerm;
    right: SimplicityTerm;
} | {
    type: 'jet';
    jetType: string;
} | {
    type: 'word';
    value: bigint;
    bitSize: number;
};
export interface SimplicityType {
    typeName: string;
    isBit: boolean;
    isWord: boolean;
    wordSize?: number;
}
export declare class SimplicityInterpreter {
    /**
     * Evaluate a Simplicity term with given input
     */
    evaluate(term: SimplicityTerm, input: Buffer): Buffer;
    private evaluateInjl;
    private evaluateInjr;
    private evaluateTake;
    private evaluateDrop;
    private evaluateComp;
    private evaluateCase;
    private evaluatePair;
    private evaluateDisconnect;
    private evaluateLoop;
    private evaluateJet;
    private evaluateWord;
    /**
     * Type-check a Simplicity term
     */
    typeCheck(term: SimplicityTerm): SimplicityType;
    /**
     * Formal verification of Simplicity term properties
     */
    verifyProperties(term: SimplicityTerm): {
        isTerminating: boolean;
        isTypeSafe: boolean;
        isMemoryBound: boolean;
    };
    private checkTermination;
}
export interface TaprootOutputKey {
    internalKey: Buffer;
    merkleRoot?: Buffer;
    outputKey: Buffer;
}
export interface TaprootSpendPath {
    isKeyPath: boolean;
    scriptPath?: {
        script: Buffer;
        controlBlock: Buffer;
    };
    keyPath?: {
        signature: Buffer;
    };
}
export declare class TaprootBuilder {
    /**
     * Build Taproot output key from internal key and script tree
     */
    buildTaprootOutputKey(internalKey: Buffer, scriptTree?: MiniscriptFragment): TaprootOutputKey;
    /**
     * Tweak public key with merkle root (Taproot tweak)
     */
    private tweakPublicKey;
    /**
     * Calculate Merkle root of scripts
     */
    private calculateMerkleRoot;
    /**
     * Create Taproot control block for script path spending
     */
    createControlBlock(internalKey: Buffer, scriptPath: MiniscriptFragment, leafIndex: number): Buffer;
    private encodeMerklePath;
    /**
     * Validate Taproot spend path
     */
    validateTaprootSpend(outputKey: TaprootOutputKey, spendPath: TaprootSpendPath): boolean;
    private verifySchnorrSignature;
    private validateScriptPath;
}
export declare class LXONScriptEngine {
    private miniscriptCompiler;
    private simplicityInterpreter;
    private taprootBuilder;
    constructor();
    /**
     * Compile a spending policy to executable script
     */
    compilePolicy(policy: MiniscriptFragment): Buffer;
    /**
     * Create Taproot address from spending policy
     */
    createTaprootAddress(internalKey: Buffer, policy?: MiniscriptFragment): string;
    /**
     * Encode Taproot output key to bech32m address
     */
    private encodeTaprootAddress;
    /**
     * Execute Simplicity program
     */
    executeSimplicity(term: SimplicityTerm, input: Buffer): Buffer;
    /**
     * Analyze script for safety and correctness
     */
    analyzeScript(fragment: MiniscriptFragment): {
        isSafe: boolean;
        maxCost: number;
        memoryUsage: number;
    };
    /**
     * Verify script properties formally
     */
    verifyScriptProperties(term: SimplicityTerm): {
        isCorrect: boolean;
        terminationGuaranteed: boolean;
        memoryBound: number;
    };
}
