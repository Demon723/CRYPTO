/**
 * NX Token State Transition Engine
 *
 * NON-PREDICTABLE PRICING MODEL
 *
 * Key innovations:
 * 1. Dynamic block rewards - no fixed halving, uses entropy + network state
 * 2. Chaotic fee adjustment - base fee varies with congestion, time, and entropy
 * 3. Variable staking APY - inversely proportional to stake ratio
 * 4. Supply-responsive emission - adjusts to maintain target velocity
 * 5. All values deterministic but non-predictable without full state
 */
import { TokenTx } from './protocol';
import { NativeTokenState, ExecutionResult } from './state';
export interface TokenExecutionResult extends ExecutionResult {
    success: boolean;
    error?: string;
    newStateRoot?: Buffer;
}
export declare class TokenEngine {
    private state;
    private blockNumber;
    private totalStaked;
    private treasury;
    private totalTransactions;
    private totalFeesBurned;
    private lastBlockTimestamp;
    private blockIntervals;
    private entropyWindow;
    constructor(state: NativeTokenState);
    newBlock(prevBlockHash?: Buffer): void;
    getBlockNumber(): bigint;
    executeTransaction(tx: TokenTx, txIndex: number): TokenExecutionResult;
    private calculateDynamicFee;
    private getEntropyFactor;
    private getCongestionFactor;
    private getTemporalFactor;
    private calculateDynamicPriorityCap;
    private calculateDynamicBlockReward;
    private calculateDynamicAPY;
    private captureEntropy;
    private distributeBlockRewards;
    private getNetworkMetrics;
    private updateNetworkMetrics;
    private calculateQuorum;
    private verifySignature;
    private decodeAmount;
    private decodeTimestamp;
    private extractProposalId;
    private accountKey;
    private stakeKey;
    private proposalKey;
    private timelockKey;
    private swapKey;
    private recoveryKey;
    private initializeGenesis;
    private executeTransfer;
    private executeStake;
    private executeUnstake;
    private executeBurn;
    private executeVote;
    private executeProposal;
    private executeTimeLock;
    private executeAtomicSwap;
    private executeRecovery;
    private estimateGas;
}
