export interface WasmModule {
    name: string;
    version: string;
    hash: string;
    wasmBinary: Buffer;
    exports: Record<string, Function>;
    metadata: {
        description: string;
        author: string;
        license: string;
        homepage: string;
        dependencies: Record<string, string>;
        gasLimit: bigint;
        memoryPages: number;
    };
}
export interface ModuleManifest {
    name: string;
    version: string;
    checksum: string;
    wasmPath: string;
    dependencies: string[];
    gasLimit: bigint;
    memoryPages: number;
    governanceProposalId?: string;
    signature?: Buffer;
}
export interface HotSwapResult {
    success: boolean;
    oldModule: string | null;
    newModule: string;
    reason: string;
    rollbackAvailable: boolean;
    executionTrace?: string[];
}
export interface UpgradeProposal {
    proposalId: string;
    moduleName: string;
    newVersion: string;
    newManifest: ModuleManifest;
    proposer: string;
    timestamp: number;
    votesFor: number;
    votesAgainst: number;
    quorum: number;
    status: 'pending' | 'approved' | 'rejected' | 'executed';
}
export declare class WasmRuntime {
    private loadedModules;
    private moduleHistory;
    private upgradeProposals;
    private previousModules;
    private governanceThreshold;
    private quarantineEnabled;
    private quarantineZone;
    private compatibilityMatrix;
    loadModule(manifest: ModuleManifest): Promise<WasmModule>;
    hotSwapModule(name: string, newManifest: ModuleManifest): Promise<HotSwapResult>;
    rollbackModule(name: string): Promise<HotSwapResult>;
    proposeUpgrade(proposal: UpgradeProposal): {
        accepted: boolean;
        reason: string;
    };
    voteOnUpgrade(proposalId: string, approve: boolean): {
        accepted: boolean;
        reason: string;
    };
    executeUpgrade(proposalId: string): Promise<HotSwapResult>;
    getModule(name: string): WasmModule | undefined;
    getModuleHistory(): Array<{
        name: string;
        version: string;
        timestamp: number;
        action: string;
    }>;
    listModules(): WasmModule[];
    getUpgradeProposals(): UpgradeProposal[];
    getQuarantinedModules(): WasmModule[];
    setCompatibility(baseVersion: string, compatibleVersions: string[]): void;
    private _isCompatible;
    private _verifySignature;
    private _computeHash;
}
