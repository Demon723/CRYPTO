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

  constructor(engine: MonadBFTEngine) {
    this.engine = engine;
  }

  /**
   * Record a validator's local tip when a view times out.
   * The local tip is the highest view proposal the validator has voted for.
   */
  recordLocalTip(validatorId: string, tip: ViewTip): void {
    this.localTips.set(validatorId, tip);
  }

  /**
   * When a view fails, each validator includes its local tip in its
   * signed timeout message. The recovery leader aggregates these.
   */
  aggregateTimeoutMessages(messages: TimeoutMessage[]): ViewTip | null {
    if (messages.length === 0) {
      return null;
    }

    // Sort by view number descending to find the highest tip
    const sorted = [...messages].sort(
      (a, b) => b.localTip.viewNumber - a.localTip.viewNumber,
    );

    return sorted[0].localTip;
  }

  /**
   * Verify that a new proposal is not a tail-fork attack.
   * A tail-fork occurs when a malicious leader proposes a different block
   * at the same height as a previously proposed valid block.
   */
  detectTailFork(
    newBlockHash: string,
    newView: number,
    previousBlockHash: string,
    previousView: number,
  ): { isTailFork: boolean; action: string } {
    // If a block was already proposed at a lower view with the same height,
    // and the new leader tries to propose a different block, that's tail-forking
    if (previousView < newView && previousBlockHash !== newBlockHash) {
      // Check if the previous block had a valid QC
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

  /**
   * Get the recovery leader's recovery proposal using the high-tip protocol.
   */
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
      failedLeader: 'unknown',
      recoveredTip: highTip,
      timestamp: Date.now(),
    });

    return { highTip, recoveryProposal };
  }

  /**
   * Get the view recovery log for audit purposes.
   */
  getRecoveryLog() {
    return [...this.viewRecoveryLog];
  }
}
