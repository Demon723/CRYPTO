import { WasmRuntime } from '../wasm-hotswap';
export interface GovernanceVote {
    voterId: string;
    proposalId: string;
    approve: boolean;
    votingPower: bigint;
    timestamp: number;
}
export interface ValidatorInfo {
    address: string;
    stake: bigint;
    isActive: boolean;
    reputation: number;
}
export declare class WasmGovernanceEngine {
    private wasmRuntime;
    private validators;
    private votes;
    private minStake;
    private votingPeriodMs;
    private proposalThreshold;
    constructor(runtime: WasmRuntime, validatorAddresses?: string[]);
    addValidator(address: string, stake: bigint): void;
    removeValidator(address: string): void;
    createUpgradeProposal(moduleName: string, newVersion: string, newManifest: any, proposer: string): {
        accepted: boolean;
        reason: string;
        proposalId?: string;
    };
    castVote(proposalId: string, voterId: string, approve: boolean): {
        accepted: boolean;
        reason: string;
    };
    executeApprovedUpgrade(proposalId: string): Promise<any>;
    getValidatorStake(address: string): bigint;
    getTotalStake(): bigint;
    getActiveValidators(): ValidatorInfo[];
    private _calculateQuorum;
}
