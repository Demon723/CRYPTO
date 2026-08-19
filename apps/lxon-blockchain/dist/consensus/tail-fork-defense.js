"use strict";
/**
 * Tail-Forking Defense and High-Tip Tracking for LXON
 *
 * Prevents malicious leaders from discarding valid blocks proposed
 * by preceding leaders. Implements the high-tip tracking protocol
 * and No-Endorsement Certificates (NEC) from MonadBFT.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailForkDefense = void 0;
class TailForkDefense {
    engine;
    localTips = new Map();
    viewRecoveryLog = [];
    leaderHistory = new Map();
    viewTimestamps = new Map();
    constructor(engine) {
        this.engine = engine;
    }
    recordLocalTip(validatorId, tip) {
        this.localTips.set(validatorId, tip);
    }
    recordLeader(view, leaderId) {
        this.leaderHistory.set(view, leaderId);
        this.viewTimestamps.set(view, Date.now());
    }
    aggregateTimeoutMessages(messages) {
        if (messages.length === 0) {
            return null;
        }
        const sorted = [...messages].sort((a, b) => b.localTip.viewNumber - a.localTip.viewNumber);
        return sorted[0].localTip;
    }
    detectTailFork(newBlockHash, newView, previousBlockHash, previousView) {
        if (previousView < newView && previousBlockHash !== newBlockHash) {
            const prevQC = this.engine.quorumCertificates.get(previousBlockHash);
            if (prevQC && prevQC.signers.length > 0) {
                return {
                    isTailFork: true,
                    action: 'REJECT: Previous block had valid QC. New proposal is a tail-fork.',
                };
            }
        }
        return { isTailFork: false, action: 'OK: No tail-fork detected' };
    }
    detectLeaderEquivocation(view, leaderId, proposedHash) {
        const prevLeader = this.leaderHistory.get(view);
        if (prevLeader && prevLeader !== leaderId) {
            return {
                isEquivocation: true,
                action: `REJECT: Leader equivocation detected. View ${view} already had leader ${prevLeader}, got ${leaderId}`,
            };
        }
        this.leaderHistory.set(view, leaderId);
        this.viewTimestamps.set(view, Date.now());
        return { isEquivocation: false, action: 'OK: Leader verified' };
    }
    detectSlowLeader(view, leaderId, timeoutMs = 5000) {
        const prevTimestamp = this.viewTimestamps.get(view - 1);
        if (prevTimestamp === undefined) {
            return { isSlow: false, action: 'OK: No previous view to compare' };
        }
        const elapsed = Date.now() - prevTimestamp;
        if (elapsed > timeoutMs) {
            return {
                isSlow: true,
                action: `WARNING: Leader ${leaderId} took ${elapsed}ms for view ${view}, exceeding ${timeoutMs}ms threshold`,
            };
        }
        return { isSlow: false, action: 'OK: Leader timing within bounds' };
    }
    getRecoveryProposal(failedView) {
        const highTip = this.engine.timeoutCertificates.get(failedView)?.highTip || null;
        if (!highTip) {
            return { highTip: null, recoveryProposal: null };
        }
        const recoveryProposal = this.engine.recoverFromFailure(failedView);
        this.viewRecoveryLog.push({
            view: failedView,
            failedLeader: this.leaderHistory.get(failedView) || 'unknown',
            recoveredTip: highTip,
            timestamp: Date.now(),
        });
        return { highTip, recoveryProposal };
    }
    getRecoveryLog() {
        return [...this.viewRecoveryLog];
    }
    getLeaderHistory() {
        return new Map(this.leaderHistory);
    }
    isViewValid(view) {
        const timestamp = this.viewTimestamps.get(view);
        if (timestamp === undefined)
            return true;
        const elapsed = Date.now() - timestamp;
        return elapsed < 30000;
    }
}
exports.TailForkDefense = TailForkDefense;
