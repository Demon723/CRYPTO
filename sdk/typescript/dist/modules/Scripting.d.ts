/**
 * Scripting Module
 *
 * Enhanced scripting with Miniscript, Simplicity, and Taproot support
 */
export declare class EnhancedScripting {
    compileMiniscript(miniscript: string): string;
    validateMiniscript(miniscript: string): boolean;
    analyzeSpendingConditions(miniscript: string): any;
    generateWitness(miniscript: string, data: any): string[];
    validateSimplicity(program: string): any;
    analyzeResources(program: string): any;
    checkResourceLimits(program: string, maxMemory: number, maxComputation: number): boolean;
    createTaprootKey(internalKey: string, scriptTree: string[]): string;
    createTaprootAddress(taprootKey: string): string;
    spendTaprootKeyPath(taprootKey: string, signature: string): string[];
    spendTaprootScriptPath(taprootKey: string, script: string, signature: string): string[];
    validateScript(script: string): boolean;
    executeScript(script: string): number[];
    composeMiniscript(fragments: string[]): string;
    decomposeScript(script: string): string[];
}
//# sourceMappingURL=Scripting.d.ts.map