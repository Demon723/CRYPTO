/**
 * Tail-Forking Defense and High-Tip Tracking for LXON
 *
 * Prevents malicious leaders from discarding valid blocks proposed
 * by preceding leaders. Implements the high-tip tracking protocol
 * and No-Endorsement Certificates (NEC) from MonadBFT.
 */
import { ViewTip, TimeoutMessage, MonadBFTEngine } from './monad-bft';
export declare class TailForkDefense {
    private engine;
    private localTips;
    private viewRecoveryLog;
    private leaderHistory;
    private viewTimestamps;
    constructor(engine: MonadBFTEngine);
    recordLocalTip(validatorId: string, tip: ViewTip): void;
    recordLeader(view: number, leaderId: string): void;
    aggregateTimeoutMessages(messages: TimeoutMessage[]): ViewTip | null;
    detectTailFork(newBlockHash: string, newView: number, previousBlockHash: string, previousView: number): {
        isTailFork: boolean;
        action: string;
    };
    detectLeaderEquivocation(view: number, leaderId: string, proposedHash: string): {
        isEquivocation: boolean;
        action: string;
    };
    detectSlowLeader(view: number, leaderId: string, timeoutMs?: number): {
        isSlow: boolean;
        action: string;
    };
    getRecoveryProposal(failedView: number): {
        highTip: ViewTip | null;
        recoveryProposal: any;
    };
    getRecoveryLog(): {
        view: number;
        failedLeader: string;
        recoveredTip: ViewTip;
        timestamp: number;
    }[];
    getLeaderHistory(): Map<number, string>;
    isViewValid(view: number): boolean;
}
