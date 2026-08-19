/**
 * MonadBFT Consensus Engine for LXON Blockchain
 *
 * Pipelined BFT consensus derived from HotStuff with:
 * - Tail-forking resistance via high-tip tracking
 * - Optimistic responsiveness (no upper-bound safety timeouts)
 * - Linear communication complexity in the happy path
 * - 2-round deterministic finality
 * - Speculative single-round confirmation
 *
 * Based on: MonadBFT (arXiv:2502.20692)
 */
export interface ViewTip {
    viewNumber: number;
    blockHash: string;
    parentQCHash: string;
}
export interface TimeoutMessage {
    senderId: string;
    view: number;
    localTip: ViewTip;
    signature: Buffer;
}
export interface QuorumCertificate {
    blockHash: string;
    view: number;
    signers: Array<{
        validatorId: string;
        signature: Buffer;
    }>;
}
export interface TimeoutCertificate {
    view: number;
    highTip: ViewTip;
    messages: TimeoutMessage[];
}
export interface NoEndorsementCertificate {
    view: number;
    blockHash: string;
    signers: Array<{
        validatorId: string;
        signature: Buffer;
    }>;
}
export interface BlockProposal {
    view: number;
    blockHash: string;
    payloadHash: string;
    qc: QuorumCertificate;
    tc: TimeoutCertificate | null;
    nec: NoEndorsementCertificate | null;
}
export interface ValidatorSet {
    validators: Map<string, bigint>;
    byzantineThreshold: number;
}
export declare class MonadBFTEngine {
    currentView: number;
    rotatingLeaderIndex: number;
    validators: ValidatorSet;
    quorumCertificates: Map<string, QuorumCertificate>;
    timeoutCertificates: Map<number, TimeoutCertificate>;
    noEndorsementCerts: Map<string, NoEndorsementCertificate>;
    highTips: Map<string, ViewTip>;
    constructor(validatorAddresses: string[], totalStake: bigint);
    /**
     * Get the designated leader for the current view.
     */
    getLeader(): string;
    /**
     * Process a block proposal and verify the quorum certificate.
     */
    processProposal(proposal: BlockProposal): {
        accepted: boolean;
        reason: string;
    };
    /**
     * Generate a Timeout Certificate from timeout messages.
     * Used during view recovery when a leader fails.
     */
    generateTimeoutCertificate(messages: TimeoutMessage[]): TimeoutCertificate | null;
    /**
     * Generate a No-Endorsement Certificate proving a previous proposal failed.
     */
    generateNEC(view: number, blockHash: string, signers: Array<{
        validatorId: string;
        signature: Buffer;
    }>): NoEndorsementCertificate | null;
    /**
     * Recover from a failed view using the high-tip protocol.
     * The recovery leader must re-propose the block at the high tip.
     */
    recoverFromFailure(failedView: number): BlockProposal | null;
    /**
     * Speculative single-round finality: nodes execute transactions
     * upon receiving a valid proposal + QC.
     */
    speculativeConfirm(proposal: BlockProposal): boolean;
    /**
     * Absolute finality within 2 consensus rounds.
     */
    finalize(proposal: BlockProposal): boolean;
    /**
     * Advance to the next view (leader rotation).
     */
    nextView(): number;
    /**
     * Get linear communication complexity count for the happy path.
     */
    getCommunicationComplexity(): string;
}
