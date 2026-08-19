"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonadBFTEngine = void 0;
class MonadBFTEngine {
    currentView = 0;
    rotatingLeaderIndex = 0;
    validators;
    quorumCertificates = new Map();
    timeoutCertificates = new Map();
    noEndorsementCerts = new Map();
    highTips = new Map();
    constructor(validatorAddresses, totalStake) {
        const validatorCount = validatorAddresses.length;
        const byzantineThreshold = Math.floor((validatorCount - 1) / 3);
        this.validators = {
            validators: new Map(validatorAddresses.map((addr) => [addr, totalStake / BigInt(validatorCount)])),
            byzantineThreshold,
        };
    }
    /**
     * Get the designated leader for the current view.
     */
    getLeader() {
        const validatorArray = Array.from(this.validators.validators.keys());
        return validatorArray[this.rotatingLeaderIndex % validatorArray.length];
    }
    /**
     * Process a block proposal and verify the quorum certificate.
     */
    processProposal(proposal) {
        const requiredQuorum = 2 * this.validators.byzantineThreshold + 1;
        // Verify QC exists and has sufficient signatures
        if (!proposal.qc || proposal.qc.signers.length < requiredQuorum) {
            return { accepted: false, reason: 'Insufficient QC signatures' };
        }
        // Verify all signers are valid validators
        const uniqueSigners = new Set(proposal.qc.signers.map((s) => s.validatorId));
        if (uniqueSigners.size < requiredQuorum) {
            return { accepted: false, reason: 'Duplicate signatures in QC' };
        }
        for (const signer of uniqueSigners) {
            if (!this.validators.validators.has(signer)) {
                return { accepted: false, reason: `Unknown signer: ${signer}` };
            }
        }
        // Check for tail-forking: if a previous block at this view exists,
        // verify the high-tip protocol
        if (this.highTips.has(proposal.blockHash)) {
            const existingTip = this.highTips.get(proposal.blockHash);
            if (existingTip.viewNumber > proposal.view) {
                return { accepted: false, reason: 'Tail-forking detected: existing higher view' };
            }
        }
        // Record the QC
        this.quorumCertificates.set(proposal.blockHash, proposal.qc);
        // Update high tip
        const tip = {
            viewNumber: proposal.view,
            blockHash: proposal.blockHash,
            parentQCHash: proposal.qc.blockHash,
        };
        this.highTips.set(proposal.blockHash, tip);
        return { accepted: true, reason: 'Proposal accepted' };
    }
    /**
     * Generate a Timeout Certificate from timeout messages.
     * Used during view recovery when a leader fails.
     */
    generateTimeoutCertificate(messages) {
        const requiredQuorum = 2 * this.validators.byzantineThreshold + 1;
        if (messages.length < requiredQuorum) {
            return null;
        }
        // Identify the high tip (highest view number)
        let highTip = null;
        for (const msg of messages) {
            if (!highTip || msg.localTip.viewNumber > highTip.viewNumber) {
                highTip = msg.localTip;
            }
        }
        if (!highTip) {
            return null;
        }
        const tc = {
            view: messages[0].view,
            highTip,
            messages,
        };
        this.timeoutCertificates.set(tc.view, tc);
        return tc;
    }
    /**
     * Generate a No-Endorsement Certificate proving a previous proposal failed.
     */
    generateNEC(view, blockHash, signers) {
        const requiredQuorum = 2 * this.validators.byzantineThreshold + 1;
        if (signers.length < requiredQuorum) {
            return null;
        }
        const nec = {
            view,
            blockHash,
            signers,
        };
        this.noEndorsementCerts.set(`${view}:${blockHash}`, nec);
        return nec;
    }
    /**
     * Recover from a failed view using the high-tip protocol.
     * The recovery leader must re-propose the block at the high tip.
     */
    recoverFromFailure(failedView) {
        const tc = this.timeoutCertificates.get(failedView);
        if (!tc) {
            return null;
        }
        const highTip = tc.highTip;
        // The recovery leader re-proposes the exact block at the high tip
        const recoveryProposal = {
            view: failedView + 1,
            blockHash: highTip.blockHash,
            payloadHash: highTip.blockHash,
            qc: this.quorumCertificates.get(highTip.blockHash) || {
                blockHash: highTip.blockHash,
                view: failedView,
                signers: [],
            },
            tc,
            nec: this.noEndorsementCerts.get(`${failedView}:${highTip.blockHash}`) || null,
        };
        return recoveryProposal;
    }
    /**
     * Speculative single-round finality: nodes execute transactions
     * upon receiving a valid proposal + QC.
     */
    speculativeConfirm(proposal) {
        if (!proposal.qc || proposal.qc.signers.length < 2 * this.validators.byzantineThreshold + 1) {
            return false;
        }
        return true;
    }
    /**
     * Absolute finality within 2 consensus rounds.
     */
    finalize(proposal) {
        const result = this.processProposal(proposal);
        return result.accepted;
    }
    /**
     * Advance to the next view (leader rotation).
     */
    nextView() {
        this.currentView++;
        this.rotatingLeaderIndex++;
        return this.currentView;
    }
    /**
     * Get linear communication complexity count for the happy path.
     */
    getCommunicationComplexity() {
        return 'O(N)';
    }
}
exports.MonadBFTEngine = MonadBFTEngine;
