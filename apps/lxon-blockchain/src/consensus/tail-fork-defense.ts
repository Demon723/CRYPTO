/**
 * Tail-Forking Defense and High-Tip Tracking for LXON
 *
 * Prevents malicious leaders from discarding valid blocks proposed
 * by preceding leaders. Implements the high-tip tracking protocol
 * and No-Endorsement Certificates (NEC) from MonadBFT.
 */

import { ViewTip, TimeoutMessage, MonadBFTEngine } from './monad-bft';

export class TailForkDefense {
  private engine: MonadBFTEngine;
  private localTips: Map<string, ViewTip> = new Map();
  private viewRecoveryLog: Array<{
    view: number;
    failedLeader: string;
    recoveredTip: ViewTip;
    timestamp: number;
  }> = [];
  private leaderHistory: Map<number, string> = new Map();
  private viewTimestamps: Map<number, number> = new Map();

  constructor(engine: MonadBFTEngine) {
    this.engine = engine;
  }

  recordLocalTip(validatorId: string, tip: ViewTip): void {
    this.localTips.set(validatorId, tip);
  }

  recordLeader(view: number, leaderId: string): void {
    this.leaderHistory.set(view, leaderId);
    this.viewTimestamps.set(view, Date.now());
  }

  aggregateTimeoutMessages(messages: TimeoutMessage[]): ViewTip | null {
    if (messages.length === 0) {
      return null;
    }

    const sorted = [...messages].sort(
      (a, b) => b.localTip.viewNumber - a.localTip.viewNumber,
    );

    return sorted[0].localTip;
  }

  detectTailFork(
    newBlockHash: string,
    newView: number,
    previousBlockHash: string,
    previousView: number,
  ): { isTailFork: boolean; action: string } {
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

  detectLeaderEquivocation(view: number, leaderId: string, proposedHash: string): { isEquivocation: boolean; action: string } {
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

  detectSlowLeader(view: number, leaderId: string, timeoutMs: number = 5000): { isSlow: boolean; action: string } {
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

  getRecoveryProposal(failedView: number): {
    highTip: ViewTip | null;
    recoveryProposal: any;
  } {
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

  getLeaderHistory(): Map<number, string> {
    return new Map(this.leaderHistory);
  }

  isViewValid(view: number): boolean {
    const timestamp = this.viewTimestamps.get(view);
    if (timestamp === undefined) return true;

    const elapsed = Date.now() - timestamp;
    return elapsed < 30000;
  }
}
