/**
 * Enhanced P2P Network for LXON Blockchain
 *
 * Implements Bitcoin Core's battle-tested P2P networking architecture:
 * - Address management and peer discovery
 * - Peer scoring and reputation system
 * - Ban management for misbehaving peers
 * - Connection management and peer selection
 * - Message handling and protocol versioning
 * - Network-wide transaction and block propagation
 *
 * This provides:
 * - Robust network connectivity
 * - Efficient peer selection
 * - Protection against network attacks
 * - Scalable peer management
 */
import { EventEmitter } from 'events';
export interface NetworkAddress {
    ip: string;
    port: number;
    services: bigint;
    timestamp: number;
}
export interface PeerInfo {
    id: string;
    address: NetworkAddress;
    userAgent: string;
    version: number;
    services: bigint;
    connectionTime: number;
    lastSeen: number;
    score: number;
    isBanned: boolean;
    banReason?: string;
    banUntil?: number;
}
export declare class AddressManager {
    private addresses;
    private triedAddresses;
    private newAddresses;
    private maxAddresses;
    /**
     * Add network address
     */
    addAddress(address: NetworkAddress, source?: string): void;
    /**
     * Mark address as tried
     */
    markTried(address: NetworkAddress): void;
    /**
     * Get random address for connection
     */
    getRandomAddress(): NetworkAddress | null;
    /**
     * Get addresses to share with peers
     */
    getAddressesToSend(count: number): NetworkAddress[];
    /**
     * Evict old addresses when capacity is reached
     */
    private evictOldAddresses;
    /**
     * Generate address key for map lookup
     */
    private addressKey;
    /**
     * Remove address
     */
    removeAddress(address: NetworkAddress): void;
    /**
     * Get address statistics
     */
    getStatistics(): {
        totalAddresses: number;
        triedAddresses: number;
        newAddresses: number;
    };
}
export interface PeerScoreConfig {
    score: number;
    punishment: number;
    reward: number;
}
export declare class PeerScorer {
    private scores;
    private behaviors;
    private config;
    /**
     * Get peer score
     */
    getScore(peerId: string): number;
    /**
     * Update peer score based on behavior
     */
    updateScore(peerId: string, behavior: PeerBehavior): void;
    /**
     * Calculate score change based on behavior
     */
    private calculateBehaviorScore;
    /**
     * Get peer behavior history
     */
    getBehaviorHistory(peerId: string): PeerBehavior[];
    /**
     * Decay scores over time (prevents score accumulation)
     */
    decayScores(): void;
    /**
     * Get top scoring peers
     */
    getTopPeers(count: number): string[];
}
export interface PeerBehavior {
    type: 'valid_block' | 'valid_transaction' | 'invalid_block' | 'invalid_transaction' | 'connection_timeout' | 'protocol_violation' | 'slow_response' | 'helpful_peer';
    description?: string;
    timestamp?: number;
}
export interface BanEntry {
    peerId: string;
    address: NetworkAddress;
    reason: string;
    banTime: number;
    banUntil: number;
}
export declare class BanManager {
    private bannedPeers;
    private bannedAddresses;
    private defaultBanDuration;
    /**
     * Ban peer
     */
    banPeer(peerId: string, address: NetworkAddress, reason: string, duration?: number): void;
    /**
     * Unban peer
     */
    unbanPeer(peerId: string): void;
    /**
     * Check if peer is banned
     */
    isPeerBanned(peerId: string): boolean;
    /**
     * Check if address is banned
     */
    isAddressBanned(address: NetworkAddress): boolean;
    /**
     * Clear expired bans
     */
    clearExpiredBans(): number;
    /**
     * Get ban information
     */
    getBanInfo(peerId: string): BanEntry | undefined;
    /**
     * Get all active bans
     */
    getActiveBans(): BanEntry[];
    /**
     * Generate address key
     */
    private addressKey;
}
export interface PeerConnection {
    peerId: string;
    address: NetworkAddress;
    socket: any;
    isConnected: boolean;
    inbound: boolean;
    version: number;
    userAgent: string;
    services: bigint;
    lastMessageTime: number;
    lastPingTime: number;
    lastPongTime: number;
}
export declare class PeerManager extends EventEmitter {
    private peers;
    private addressManager;
    private peerScorer;
    private banManager;
    private maxConnections;
    private maxOutboundConnections;
    private outboundConnections;
    constructor();
    /**
     * Connect to peer
     */
    connectToPeer(address: NetworkAddress): Promise<boolean>;
    /**
     * Accept inbound connection
     */
    acceptInboundConnection(address: NetworkAddress): boolean;
    /**
     * Disconnect from peer
     */
    disconnectPeer(peerId: string, reason?: string): void;
    /**
     * Send message to peer
     */
    sendMessage(peerId: string, message: P2PMessage): boolean;
    /**
     * Handle received message from peer
     */
    handleMessage(peerId: string, message: P2PMessage): void;
    /**
     * Handle ping message
     */
    private handlePing;
    /**
     * Handle pong message
     */
    private handlePong;
    /**
     * Handle address message
     */
    private handleAddressMessage;
    /**
     * Get peer information
     */
    getPeerInfo(peerId: string): PeerInfo | undefined;
    /**
     * Get all connected peers
     */
    getConnectedPeers(): PeerInfo[];
    /**
     * Discover new peers
     */
    discoverPeers(): Promise<void>;
    /**
     * Broadcast message to all peers
     */
    broadcastMessage(message: P2PMessage): void;
    /**
     * Maintain connections (periodic maintenance)
     */
    maintainConnections(): void;
    /**
     * Generate peer ID
     */
    private generatePeerId;
    /**
     * Get network statistics
     */
    getNetworkStatistics(): {
        totalPeers: number;
        outboundConnections: number;
        inboundConnections: number;
        bannedPeers: number;
        knownAddresses: number;
    };
}
export type P2PMessageType = 'version' | 'verack' | 'addr' | 'inv' | 'getdata' | 'block' | 'transaction' | 'ping' | 'pong' | 'getaddr' | 'reject';
export interface P2PMessage {
    type: P2PMessageType;
    nonce?: bigint;
    addresses?: NetworkAddress[];
    inventory?: InventoryItem[];
    block?: any;
    transaction?: any;
    rejectReason?: string;
}
export interface InventoryItem {
    type: 'block' | 'transaction';
    hash: string;
}
export declare class NetworkManager {
    private peerManager;
    private addressManager;
    private peerScorer;
    private banManager;
    private maintenanceInterval;
    constructor();
    /**
     * Start network manager
     */
    start(): void;
    /**
     * Stop network manager
     */
    stop(): void;
    /**
     * Add seed addresses for initial peer discovery
     */
    addSeedAddresses(addresses: NetworkAddress[]): void;
    /**
     * Connect to specific peer
     */
    connectToPeer(address: NetworkAddress): Promise<boolean>;
    /**
     * Broadcast transaction to network
     */
    broadcastTransaction(transaction: any): void;
    /**
     * Broadcast block to network
     */
    broadcastBlock(block: any): void;
    /**
     * Get network status
     */
    getNetworkStatus(): {
        peers: PeerInfo[];
        statistics: ReturnType<PeerManager['getNetworkStatistics']>;
        addressStats: ReturnType<AddressManager['getStatistics']>;
    };
    /**
     * Ban peer
     */
    banPeer(peerId: string, reason: string, duration?: number): void;
    /**
     * Unban peer
     */
    unbanPeer(peerId: string): void;
    /**
     * Get peer scoring information
     */
    getPeerScores(): Map<string, number>;
}
