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

import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';

// ============================================================================
// NETWORK ADDRESS MANAGEMENT
// ============================================================================

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

export class AddressManager {
  private addresses: Map<string, NetworkAddress> = new Map();
  private triedAddresses: Set<string> = new Set();
  private newAddresses: Set<string> = new Set();
  private maxAddresses: number = 10000;

  /**
   * Add network address
   */
  addAddress(address: NetworkAddress, source?: string): void {
    const key = this.addressKey(address);
    
    // Update timestamp if already exists
    if (this.addresses.has(key)) {
      const existing = this.addresses.get(key)!;
      existing.timestamp = Math.max(existing.timestamp, address.timestamp);
      return;
    }

    // Check capacity
    if (this.addresses.size >= this.maxAddresses) {
      this.evictOldAddresses();
    }

    this.addresses.set(key, address);
    this.newAddresses.add(key);
  }

  /**
   * Mark address as tried
   */
  markTried(address: NetworkAddress): void {
    const key = this.addressKey(address);
    this.triedAddresses.add(key);
    this.newAddresses.delete(key);
  }

  /**
   * Get random address for connection
   */
  getRandomAddress(): NetworkAddress | null {
    const available = Array.from(this.addresses.values())
      .filter(addr => !this.triedAddresses.has(this.addressKey(addr)));

    if (available.length === 0) {
      return null;
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  /**
   * Get addresses to share with peers
   */
  getAddressesToSend(count: number): NetworkAddress[] {
    const addresses = Array.from(this.addresses.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);

    return addresses;
  }

  /**
   * Evict old addresses when capacity is reached
   */
  private evictOldAddresses(): void {
    const sorted = Array.from(this.addresses.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toRemove = sorted.slice(0, Math.floor(sorted.length * 0.1));
    for (const [key] of toRemove) {
      this.addresses.delete(key);
      this.triedAddresses.delete(key);
      this.newAddresses.delete(key);
    }
  }

  /**
   * Generate address key for map lookup
   */
  private addressKey(address: NetworkAddress): string {
    return `${address.ip}:${address.port}`;
  }

  /**
   * Remove address
   */
  removeAddress(address: NetworkAddress): void {
    const key = this.addressKey(address);
    this.addresses.delete(key);
    this.triedAddresses.delete(key);
    this.newAddresses.delete(key);
  }

  /**
   * Get address statistics
   */
  getStatistics(): {
    totalAddresses: number;
    triedAddresses: number;
    newAddresses: number;
  } {
    return {
      totalAddresses: this.addresses.size,
      triedAddresses: this.triedAddresses.size,
      newAddresses: this.newAddresses.size,
    };
  }
}

// ============================================================================
// PEER SCORING SYSTEM
// ============================================================================

export interface PeerScoreConfig {
  score: number;
  punishment: number;
  reward: number;
}

export class PeerScorer {
  private scores: Map<string, number> = new Map();
  private behaviors: Map<string, PeerBehavior[]> = new Map();
  private config: PeerScoreConfig = {
    score: 100,
    punishment: 10,
    reward: 5,
  };

  /**
   * Get peer score
   */
  getScore(peerId: string): number {
    return this.scores.get(peerId) || this.config.score;
  }

  /**
   * Update peer score based on behavior
   */
  updateScore(peerId: string, behavior: PeerBehavior): void {
    const currentScore = this.getScore(peerId);
    const behaviorScore = this.calculateBehaviorScore(behavior);
    
    const newScore = Math.max(0, Math.min(1000, currentScore + behaviorScore));
    this.scores.set(peerId, newScore);

    // Record behavior
    if (!this.behaviors.has(peerId)) {
      this.behaviors.set(peerId, []);
    }
    this.behaviors.get(peerId)!.push({
      ...behavior,
      timestamp: Date.now(),
    });

    // Keep only recent behaviors
    const behaviors = this.behaviors.get(peerId)!;
    if (behaviors.length > 100) {
      this.behaviors.set(peerId, behaviors.slice(-100));
    }
  }

  /**
   * Calculate score change based on behavior
   */
  private calculateBehaviorScore(behavior: PeerBehavior): number {
    switch (behavior.type) {
      case 'valid_block':
        return this.config.reward;
      case 'valid_transaction':
        return this.config.reward;
      case 'invalid_block':
        return -this.config.punishment * 5;
      case 'invalid_transaction':
        return -this.config.punishment * 2;
      case 'connection_timeout':
        return -this.config.punishment;
      case 'protocol_violation':
        return -this.config.punishment * 10;
      case 'slow_response':
        return -this.config.punishment / 2;
      case 'helpful_peer':
        return this.config.reward * 2;
      default:
        return 0;
    }
  }

  /**
   * Get peer behavior history
   */
  getBehaviorHistory(peerId: string): PeerBehavior[] {
    return this.behaviors.get(peerId) || [];
  }

  /**
   * Decay scores over time (prevents score accumulation)
   */
  decayScores(): void {
    for (const [peerId, score] of this.scores) {
      const decayedScore = Math.max(this.config.score, score * 0.99);
      this.scores.set(peerId, decayedScore);
    }
  }

  /**
   * Get top scoring peers
   */
  getTopPeers(count: number): string[] {
    return Array.from(this.scores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([peerId]) => peerId);
  }
}

export interface PeerBehavior {
  type: 'valid_block' | 'valid_transaction' | 'invalid_block' | 'invalid_transaction' | 
        'connection_timeout' | 'protocol_violation' | 'slow_response' | 'helpful_peer';
  description?: string;
  timestamp?: number;
}

// ============================================================================
// BAN MANAGEMENT
// ============================================================================

export interface BanEntry {
  peerId: string;
  address: NetworkAddress;
  reason: string;
  banTime: number;
  banUntil: number;
}

export class BanManager {
  private bannedPeers: Map<string, BanEntry> = new Map();
  private bannedAddresses: Map<string, BanEntry> = new Map();
  private defaultBanDuration: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Ban peer
   */
  banPeer(peerId: string, address: NetworkAddress, reason: string, duration?: number): void {
    const banTime = Date.now();
    const banUntil = banTime + (duration || this.defaultBanDuration);

    const banEntry: BanEntry = {
      peerId,
      address,
      reason,
      banTime,
      banUntil,
    };

    this.bannedPeers.set(peerId, banEntry);
    this.bannedAddresses.set(this.addressKey(address), banEntry);
  }

  /**
   * Unban peer
   */
  unbanPeer(peerId: string): void {
    const banEntry = this.bannedPeers.get(peerId);
    if (banEntry) {
      this.bannedPeers.delete(peerId);
      this.bannedAddresses.delete(this.addressKey(banEntry.address));
    }
  }

  /**
   * Check if peer is banned
   */
  isPeerBanned(peerId: string): boolean {
    const banEntry = this.bannedPeers.get(peerId);
    if (!banEntry) {
      return false;
    }

    // Check if ban has expired
    if (Date.now() > banEntry.banUntil) {
      this.bannedPeers.delete(peerId);
      return false;
    }

    return true;
  }

  /**
   * Check if address is banned
   */
  isAddressBanned(address: NetworkAddress): boolean {
    const banEntry = this.bannedAddresses.get(this.addressKey(address));
    if (!banEntry) {
      return false;
    }

    // Check if ban has expired
    if (Date.now() > banEntry.banUntil) {
      this.bannedAddresses.delete(this.addressKey(address));
      return false;
    }

    return true;
  }

  /**
   * Clear expired bans
   */
  clearExpiredBans(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [peerId, banEntry] of this.bannedPeers.entries()) {
      if (now > banEntry.banUntil) {
        this.bannedPeers.delete(peerId);
        this.bannedAddresses.delete(this.addressKey(banEntry.address));
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get ban information
   */
  getBanInfo(peerId: string): BanEntry | undefined {
    return this.bannedPeers.get(peerId);
  }

  /**
   * Get all active bans
   */
  getActiveBans(): BanEntry[] {
    const now = Date.now();
    return Array.from(this.bannedPeers.values())
      .filter(ban => ban.banUntil > now);
  }

  /**
   * Generate address key
   */
  private addressKey(address: NetworkAddress): string {
    return `${address.ip}:${address.port}`;
  }
}

// ============================================================================
// PEER CONNECTION MANAGEMENT
// ============================================================================

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

export class PeerManager extends EventEmitter {
  private peers: Map<string, PeerConnection> = new Map();
  private addressManager: AddressManager;
  private peerScorer: PeerScorer;
  private banManager: BanManager;
  private maxConnections: number = 50;
  private maxOutboundConnections: number = 30;
  private outboundConnections: number = 0;

  constructor() {
    super();
    this.addressManager = new AddressManager();
    this.peerScorer = new PeerScorer();
    this.banManager = new BanManager();
  }

  /**
   * Connect to peer
   */
  async connectToPeer(address: NetworkAddress): Promise<boolean> {
    const peerId = this.generatePeerId(address);

    // Check if already connected
    if (this.peers.has(peerId)) {
      return true;
    }

    // Check if peer is banned
    if (this.banManager.isAddressBanned(address)) {
      return false;
    }

    // Check connection limits
    if (this.outboundConnections >= this.maxOutboundConnections) {
      return false;
    }

    try {
      // Create connection (simplified - would use actual socket)
      const connection: PeerConnection = {
        peerId,
        address,
        socket: null, // Would be actual socket connection
        isConnected: false,
        inbound: false,
        version: 0,
        userAgent: '',
        services: 0n,
        lastMessageTime: Date.now(),
        lastPingTime: 0,
        lastPongTime: 0,
      };

      // Simulate connection
      connection.isConnected = true;
      connection.version = 1;
      connection.userAgent = 'lxon:1.0.0';
      connection.services = 1n;

      this.peers.set(peerId, connection);
      this.outboundConnections++;
      this.addressManager.markTried(address);

      this.emit('peerConnected', peerId);
      this.peerScorer.updateScore(peerId, { type: 'helpful_peer', description: 'Successful connection' });

      return true;
    } catch (error) {
      this.banManager.banPeer(peerId, address, 'Connection failed');
      this.peerScorer.updateScore(peerId, { type: 'connection_timeout', description: 'Connection failed' });
      return false;
    }
  }

  /**
   * Accept inbound connection
   */
  acceptInboundConnection(address: NetworkAddress): boolean {
    const peerId = this.generatePeerId(address);

    // Check if peer is banned
    if (this.banManager.isAddressBanned(address)) {
      return false;
    }

    // Check connection limits
    if (this.peers.size >= this.maxConnections) {
      return false;
    }

    const connection: PeerConnection = {
      peerId,
      address,
      socket: null,
      isConnected: true,
      inbound: true,
      version: 0,
      userAgent: '',
      services: 0n,
      lastMessageTime: Date.now(),
      lastPingTime: 0,
      lastPongTime: 0,
    };

    this.peers.set(peerId, connection);
    this.addressManager.addAddress(address);

    this.emit('peerConnected', peerId);

    return true;
  }

  /**
   * Disconnect from peer
   */
  disconnectPeer(peerId: string, reason?: string): void {
    const connection = this.peers.get(peerId);
    if (!connection) {
      return;
    }

    // Close socket if exists
    if (connection.socket) {
      connection.socket.destroy();
    }

    if (!connection.inbound) {
      this.outboundConnections--;
    }

    this.peers.delete(peerId);
    this.emit('peerDisconnected', peerId, reason);

    // Penalize if disconnection was due to misbehavior
    if (reason && reason.includes('misbehavior')) {
      this.peerScorer.updateScore(peerId, { type: 'protocol_violation', description: reason });
    }
  }

  /**
   * Send message to peer
   */
  sendMessage(peerId: string, message: P2PMessage): boolean {
    const connection = this.peers.get(peerId);
    if (!connection || !connection.isConnected) {
      return false;
    }

    // Update last message time
    connection.lastMessageTime = Date.now();

    // Send message (simplified)
    this.emit('messageSent', peerId, message);

    return true;
  }

  /**
   * Handle received message from peer
   */
  handleMessage(peerId: string, message: P2PMessage): void {
    const connection = this.peers.get(peerId);
    if (!connection) {
      return;
    }

    connection.lastMessageTime = Date.now();

    // Score based on message type
    switch (message.type) {
      case 'block':
        this.peerScorer.updateScore(peerId, { type: 'valid_block', description: 'Received valid block' });
        break;
      case 'transaction':
        this.peerScorer.updateScore(peerId, { type: 'valid_transaction', description: 'Received valid transaction' });
        break;
      case 'ping':
        this.handlePing(peerId, message);
        break;
      case 'pong':
        this.handlePong(peerId, message);
        break;
      case 'addr':
        this.handleAddressMessage(peerId, message);
        break;
    }

    this.emit('messageReceived', peerId, message);
  }

  /**
   * Handle ping message
   */
  private handlePing(peerId: string, message: P2PMessage): void {
    const connection = this.peers.get(peerId);
    if (!connection) return;

    connection.lastPingTime = Date.now();

    // Send pong response
    this.sendMessage(peerId, {
      type: 'pong',
      nonce: message.nonce,
    });
  }

  /**
   * Handle pong message
   */
  private handlePong(peerId: string, message: P2PMessage): void {
    const connection = this.peers.get(peerId);
    if (!connection) return;

    connection.lastPongTime = Date.now();

    // Calculate latency
    const latency = connection.lastPongTime - connection.lastPingTime;
    if (latency > 5000) {
      this.peerScorer.updateScore(peerId, { type: 'slow_response', description: `High latency: ${latency}ms` });
    }
  }

  /**
   * Handle address message
   */
  private handleAddressMessage(peerId: string, message: P2PMessage): void {
    if (message.addresses) {
      for (const address of message.addresses) {
        this.addressManager.addAddress(address, peerId);
      }
    }
  }

  /**
   * Get peer information
   */
  getPeerInfo(peerId: string): PeerInfo | undefined {
    const connection = this.peers.get(peerId);
    if (!connection) {
      return undefined;
    }

    return {
      id: peerId,
      address: connection.address,
      userAgent: connection.userAgent,
      version: connection.version,
      services: connection.services,
      connectionTime: Date.now(), // Would track actual connection time
      lastSeen: connection.lastMessageTime,
      score: this.peerScorer.getScore(peerId),
      isBanned: this.banManager.isPeerBanned(peerId),
    };
  }

  /**
   * Get all connected peers
   */
  getConnectedPeers(): PeerInfo[] {
    return Array.from(this.peers.keys())
      .map(peerId => this.getPeerInfo(peerId))
      .filter((info): info is PeerInfo => info !== undefined);
  }

  /**
   * Discover new peers
   */
  async discoverPeers(): Promise<void> {
    // Try to connect to random addresses
    for (let i = 0; i < 10; i++) {
      const address = this.addressManager.getRandomAddress();
      if (address) {
        await this.connectToPeer(address);
      }
    }
  }

  /**
   * Broadcast message to all peers
   */
  broadcastMessage(message: P2PMessage): void {
    for (const peerId of this.peers.keys()) {
      this.sendMessage(peerId, message);
    }
  }

  /**
   * Maintain connections (periodic maintenance)
   */
  maintainConnections(): void {
    const now = Date.now();

    // Disconnect idle peers
    for (const [peerId, connection] of this.peers.entries()) {
      if (now - connection.lastMessageTime > 30 * 60 * 1000) { // 30 minutes
        this.disconnectPeer(peerId, 'Idle timeout');
      }
    }

    // Clear expired bans
    this.banManager.clearExpiredBans();

    // Decay scores
    this.peerScorer.decayScores();

    // Discover new peers if needed
    if (this.peers.size < this.maxConnections / 2) {
      this.discoverPeers();
    }
  }

  /**
   * Generate peer ID
   */
  private generatePeerId(address: NetworkAddress): string {
    return createHash('sha256')
      .update(`${address.ip}:${address.port}`)
      .digest('hex');
  }

  /**
   * Get network statistics
   */
  getNetworkStatistics(): {
    totalPeers: number;
    outboundConnections: number;
    inboundConnections: number;
    bannedPeers: number;
    knownAddresses: number;
  } {
    const peers = Array.from(this.peers.values());
    const outbound = peers.filter(p => !p.inbound).length;
    const inbound = peers.filter(p => p.inbound).length;

    return {
      totalPeers: peers.length,
      outboundConnections: outbound,
      inboundConnections: inbound,
      bannedPeers: this.banManager.getActiveBans().length,
      knownAddresses: this.addressManager.getStatistics().totalAddresses,
    };
  }
}

// ============================================================================
// P2P MESSAGE TYPES
// ============================================================================

export type P2PMessageType = 
  | 'version'
  | 'verack'
  | 'addr'
  | 'inv'
  | 'getdata'
  | 'block'
  | 'transaction'
  | 'ping'
  | 'pong'
  | 'getaddr'
  | 'reject';

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

// ============================================================================
// NETWORK MANAGER (COORDINATOR)
// ============================================================================

export class NetworkManager {
  private peerManager: PeerManager;
  private addressManager: AddressManager;
  private peerScorer: PeerScorer;
  private banManager: BanManager;
  private maintenanceInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.peerManager = new PeerManager();
    this.addressManager = this.peerManager['addressManager'];
    this.peerScorer = this.peerManager['peerScorer'];
    this.banManager = this.peerManager['banManager'];
  }

  /**
   * Start network manager
   */
  start(): void {
    // Start periodic maintenance
    this.maintenanceInterval = setInterval(() => {
      this.peerManager.maintainConnections();
    }, 60000); // Every minute

    // Initial peer discovery
    this.peerManager.discoverPeers();
  }

  /**
   * Stop network manager
   */
  stop(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }

    // Disconnect all peers
    for (const peerId of this.peerManager['peers'].keys()) {
      this.peerManager.disconnectPeer(peerId, 'Shutdown');
    }
  }

  /**
   * Add seed addresses for initial peer discovery
   */
  addSeedAddresses(addresses: NetworkAddress[]): void {
    for (const address of addresses) {
      this.addressManager.addAddress(address);
    }
  }

  /**
   * Connect to specific peer
   */
  async connectToPeer(address: NetworkAddress): Promise<boolean> {
    return await this.peerManager.connectToPeer(address);
  }

  /**
   * Broadcast transaction to network
   */
  broadcastTransaction(transaction: any): void {
    this.peerManager.broadcastMessage({
      type: 'transaction',
      transaction,
    });
  }

  /**
   * Broadcast block to network
   */
  broadcastBlock(block: any): void {
    this.peerManager.broadcastMessage({
      type: 'block',
      block,
    });
  }

  /**
   * Get network status
   */
  getNetworkStatus(): {
    peers: PeerInfo[];
    statistics: ReturnType<PeerManager['getNetworkStatistics']>;
    addressStats: ReturnType<AddressManager['getStatistics']>;
  } {
    return {
      peers: this.peerManager.getConnectedPeers(),
      statistics: this.peerManager.getNetworkStatistics(),
      addressStats: this.addressManager.getStatistics(),
    };
  }

  /**
   * Ban peer
   */
  banPeer(peerId: string, reason: string, duration?: number): void {
    const peerInfo = this.peerManager.getPeerInfo(peerId);
    if (peerInfo) {
      this.banManager.banPeer(peerId, peerInfo.address, reason, duration);
      this.peerManager.disconnectPeer(peerId, reason);
    }
  }

  /**
   * Unban peer
   */
  unbanPeer(peerId: string): void {
    this.banManager.unbanPeer(peerId);
  }

  /**
   * Get peer scoring information
   */
  getPeerScores(): Map<string, number> {
    const scores = new Map<string, number>();
    for (const peerId of this.peerManager['peers'].keys()) {
      scores.set(peerId, this.peerScorer.getScore(peerId));
    }
    return scores;
  }
}