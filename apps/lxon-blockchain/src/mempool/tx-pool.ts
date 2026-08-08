import { Transaction } from '../block-stm';

export interface PendingTransaction {
  hash: string;
  transaction: Transaction;
  sender: string;
  fee: bigint;
  nonce: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
  priority: number;
}

export interface TransactionPoolConfig {
  maxPending: number;
  maxPerSender: number;
  minFee: bigint;
  expiryMs: number;
}

export class TransactionPool {
  private pending: Map<string, PendingTransaction> = new Map();
  private bySender: Map<string, Set<string>> = new Map();
  private config: TransactionPoolConfig;
  private nonces: Map<string, number> = new Map();

  constructor(config: Partial<TransactionPoolConfig> = {}) {
    this.config = {
      maxPending: 10000,
      maxPerSender: 100,
      minFee: 1000n,
      expiryMs: 24 * 60 * 60 * 1000,
      ...config,
    };
  }

  addTransaction(tx: Transaction, sender: string, fee: bigint): { accepted: boolean; reason?: string } {
    if (this.pending.size >= this.config.maxPending) {
      return { accepted: false, reason: 'Pool full' };
    }

    if (fee < this.config.minFee) {
      return { accepted: false, reason: 'Fee too low' };
    }

    const senderCount = this.bySender.get(sender)?.size || 0;
    if (senderCount >= this.config.maxPerSender) {
      return { accepted: false, reason: 'Too many txs from sender' };
    }

    const nonce = this.nonces.get(sender) || 0;
    const txNonce = (tx as any).nonce ?? nonce;
    if (txNonce < nonce) {
      return { accepted: false, reason: 'Nonce too low' };
    }

    const hash = this.computeHash(tx);
    if (this.pending.has(hash)) {
      return { accepted: false, reason: 'Duplicate transaction' };
    }

    const pendingTx: PendingTransaction = {
      hash,
      transaction: tx,
      sender,
      fee,
      nonce: (tx as any).nonce ?? nonce,
      timestamp: Date.now(),
      status: 'pending',
      priority: Number(fee),
    };

    this.pending.set(hash, pendingTx);
    if (!this.bySender.has(sender)) {
      this.bySender.set(sender, new Set());
    }
    this.bySender.get(sender)!.add(hash);
    this.nonces.set(sender, nonce + 1);

    return { accepted: true };
  }

  removeTransaction(hash: string): boolean {
    const tx = this.pending.get(hash);
    if (!tx) return false;

    this.pending.delete(hash);
    this.bySender.get(tx.sender)?.delete(hash);
    return true;
  }

  getPendingTransactions(limit: number = 100): PendingTransaction[] {
    const sorted = Array.from(this.pending.values())
      .filter(tx => tx.status === 'pending')
      .sort((a, b) => b.priority - a.priority);
    return sorted.slice(0, limit);
  }

  getTransactionsBySender(sender: string): PendingTransaction[] {
    const hashes = this.bySender.get(sender) || new Set();
    return Array.from(hashes)
      .map(hash => this.pending.get(hash)!)
      .filter(tx => tx && tx.status === 'pending');
  }

  confirmTransaction(hash: string): boolean {
    const tx = this.pending.get(hash);
    if (!tx) return false;
    tx.status = 'confirmed';
    this.pending.delete(hash);
    this.bySender.get(tx.sender)?.delete(hash);
    return true;
  }

  rejectTransaction(hash: string, reason: string): boolean {
    const tx = this.pending.get(hash);
    if (!tx) return false;
    tx.status = 'rejected';
    this.pending.delete(hash);
    this.bySender.get(tx.sender)?.delete(hash);
    return true;
  }

  cleanupExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [hash, tx] of this.pending.entries()) {
      if (now - tx.timestamp > this.config.expiryMs) {
        this.removeTransaction(hash);
        removed++;
      }
    }
    return removed;
  }

  getStats(): { pending: number; confirmed: number; rejected: number } {
    let pending = 0, confirmed = 0, rejected = 0;
    for (const tx of this.pending.values()) {
      if (tx.status === 'pending') pending++;
      else if (tx.status === 'confirmed') confirmed++;
      else rejected++;
    }
    return { pending, confirmed, rejected };
  }

  private computeHash(tx: Transaction): string {
    const data = JSON.stringify(tx);
    return Buffer.from(data).toString('hex').slice(0, 64);
  }
}
