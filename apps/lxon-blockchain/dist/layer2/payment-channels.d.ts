/**
 * Lightning-Style Payment Channels for LXON Blockchain
 *
 * Implements Bitcoin Lightning Network-inspired payment channels for:
 * - Instant off-chain transactions
 * - Privacy through transaction batching
 * - Reduced on-chain load
 * - Micropayment support
 *
 * Features:
 * - Bidirectional payment channels
 * - HTLC (Hashed Timelock Contracts) for routing
 * - Channel management (open, update, close)
 * - Watchtower integration for security
 * - Multi-hop routing capabilities
 */
import { HybridTransaction, UTXO } from '../utxo/hybrid-state-manager';
export interface ChannelParameters {
    capacity: bigint;
    pushAmount: bigint;
    locktime: number;
    dustLimit: bigint;
    maxHTLCs: number;
    channelReserve: bigint;
    feeRate: bigint;
}
export interface ChannelState {
    channelId: string;
    participants: [string, string];
    balances: [bigint, bigint];
    fundingTxid: string;
    fundingOutputIndex: number;
    localCommitment: CommitmentTransaction;
    remoteCommitment: CommitmentTransaction;
    localNextCommitmentNumber: number;
    remoteNextCommitmentNumber: number;
    htlcs: HTLC[];
    isClosed: boolean;
    closeTx?: string | CommitmentTransaction;
}
export interface CommitmentTransaction {
    txid: string;
    commitmentNumber: number;
    fee: bigint;
    outputs: ChannelOutput[];
    htlcs: HTLC[];
    signature: Buffer;
}
export interface ChannelOutput {
    address: string;
    amount: bigint;
    isToSelf: boolean;
    delayBlocks: number;
}
export interface HTLC {
    htlcId: string;
    paymentHash: Buffer;
    amount: bigint;
    expiry: number;
    direction: 'incoming' | 'outgoing';
    state: 'pending' | 'fulfilled' | 'failed' | 'timedout';
    preimage?: Buffer;
}
export interface PaymentChannel {
    channelId: string;
    parameters: ChannelParameters;
    state: ChannelState;
    localNode: string;
    remoteNode: string;
}
export interface ChannelUpdate {
    channelId: string;
    newBalances: [bigint, bigint];
    newHTLCs: HTLC[];
    commitmentNumber: number;
    signature: Buffer;
}
export declare class PaymentChannelManager {
    private channels;
    private pendingChannels;
    private watchtowers;
    /**
     * Open a new payment channel
     */
    openChannel(localNode: string, remoteNode: string, parameters: ChannelParameters, fundingUTXO: UTXO): Promise<{
        channelId: string;
        fundingTx: HybridTransaction;
    }>;
    /**
     * Confirm channel opening (after funding transaction confirms)
     */
    confirmChannelOpening(channelId: string, fundingTxid: string): boolean;
    /**
     * Update channel state (send payment)
     */
    updateChannel(channelId: string, amount: bigint, paymentHash?: Buffer): Promise<{
        success: boolean;
        error?: string;
        signature?: Buffer;
    }>;
    /**
     * Receive channel update from remote party
     */
    receiveChannelUpdate(update: ChannelUpdate): {
        success: boolean;
        error?: string;
    };
    /**
     * Fulfill HTLC (provide preimage to claim payment)
     */
    fulfillHTLC(channelId: string, htlcId: string, preimage: Buffer): {
        success: boolean;
        error?: string;
    };
    /**
     * Close channel cooperatively
     */
    closeChannel(channelId: string, finalBalances?: [bigint, bigint]): {
        success: boolean;
        closeTx?: HybridTransaction;
        error?: string;
    };
    /**
     * Force close channel (uncooperative close)
     */
    forceCloseChannel(channelId: string): {
        success: boolean;
        closeTx?: string;
        error?: string;
    };
    /**
     * Add watchtower for channel monitoring
     */
    addWatchtower(watchtower: Watchtower): void;
    /**
     * Send channel data to watchtowers
     */
    syncWatchtowers(channelId: string): void;
    /**
     * Generate unique channel ID
     */
    private generateChannelId;
    /**
     * Generate funding transaction ID
     */
    private generateFundingTxid;
    /**
     * Generate unique HTLC ID
     */
    private generateHTLCId;
    /**
     * Calculate HTLC expiry (blocks from now)
     */
    private calculateHTLCExpiry;
    /**
     * Create funding transaction
     */
    private createFundingTransaction;
    /**
     * Create 2-of-2 multisig funding script
     */
    private createFundingScript;
    /**
     * Encode script to address
     */
    private encodeScriptAddress;
    /**
     * Create commitment transaction
     */
    private createCommitmentTransaction;
    /**
     * Calculate commitment transaction fee
     */
    private calculateCommitmentFee;
    /**
     * Generate commitment transaction ID
     */
    private generateCommitmentTxid;
    /**
     * Create closing transaction
     */
    private createClosingTransaction;
    /**
     * Create P2WPKH locking script
     */
    private createP2WPKHScript;
    /**
     * Encode HTLC address
     */
    private encodeHTLCAddress;
    /**
     * Sign commitment transaction
     */
    private signCommitment;
    /**
     * Verify commitment signature
     */
    private verifyCommitmentSignature;
    /**
     * Get channel information
     */
    getChannelInfo(channelId: string): PaymentChannel | undefined;
    /**
     * Get all channels for a node
     */
    getChannelsForNode(node: string): PaymentChannel[];
    /**
     * Get channel statistics
     */
    getChannelStatistics(): {
        totalChannels: number;
        totalCapacity: bigint;
        activeChannels: number;
        closedChannels: number;
    };
}
export interface Watchtower {
    id: string;
    endpoint: string;
    fee: bigint;
    monitorChannel(channel: PaymentChannel): void;
    checkBreaches(channelId: string): Promise<BreachReport[]>;
}
export interface BreachReport {
    channelId: string;
    breachType: 'old_commitment' | ' revoked_htlc' | 'channel_close';
    detectedAt: number;
    penaltyTx?: string;
}
export declare class WatchtowerService {
    private watchtowers;
    private monitoredChannels;
    /**
     * Register a watchtower
     */
    registerWatchtower(watchtower: Watchtower): void;
    /**
     * Monitor channel with watchtower
     */
    monitorChannel(channelId: string, watchtowerId: string): boolean;
    /**
     * Check for channel breaches
     */
    checkBreaches(channelId: string): Promise<BreachReport[]>;
}
export interface RouteHop {
    channelID: string;
    nextNode: string;
    fee: bigint;
    cltvExpiry: number;
}
export interface PaymentRoute {
    hops: RouteHop[];
    totalFee: bigint;
    totalAmount: bigint;
    totalLocktime: number;
}
export declare class PaymentRouter {
    private networkGraph;
    /**
     * Add channel to network graph
     */
    addChannel(channel: PaymentChannel): void;
    /**
     * Find route for payment
     */
    findRoute(sourceNode: string, targetNode: string, amount: bigint): PaymentRoute | null;
    /**
     * Get network statistics
     */
    getNetworkStatistics(): {
        nodes: number;
        channels: number;
        avgCapacity: bigint;
    };
}
