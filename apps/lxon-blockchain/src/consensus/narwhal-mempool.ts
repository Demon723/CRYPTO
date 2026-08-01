/**
 * Narwhal DAG Mempool for LXON Blockchain
 *
 * Separates transaction dissemination from ordering using a DAG-based
 * mempool protocol. Achieves high-throughput reliable dissemination
 * and storage of causal histories of transactions.
 *
 * Based on: Narwhal and Tusk (arXiv:2105.11827)
 */

export interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  value: bigint;
  gasPrice: bigint;
  gasLimit: bigint;
  nonce: number;
  data: Buffer;
  signature: Buffer;
  timestamp: number;
}

export interface DAGVertex {
  hash: string;
  transaction: Transaction;
  parents: string[];
  round: number;
  author: string;
  timestamp: number;
}

export interface BatchCertificate {
  batchHash: string;
  round: number;
  origin: string;
  parentCertificates: string[];
  signatures: Array<{
    validatorId: string;
    signature: Buffer;
  }>;
}

export interface ValidatorSet {
  validators: Map<string, bigint>;
  byzantineThreshold: number;
}

export class NarwhalMempool {
  private dag: Map<string, DAGVertex> = new Map();
  private pendingTransactions: Transaction[] = [];
  private batchCertificates: Map<string, BatchCertificate> = new Map();
  private validators: ValidatorSet;
  private currentRound: number = 0;

  constructor(validatorAddresses: string[], totalStake: bigint) {
    const validatorCount = validatorAddresses.length;
    const byzantineThreshold = Math.floor((validatorCount - 1) / 3);

    this.validators = {
      validators: new Map(validatorAddresses.map((addr) => [addr, totalStake / BigInt(validatorCount)])),
      byzantineThreshold,
    };
  }

  submitTransaction(tx: Transaction): void {
    this.pendingTransactions.push(tx);
  }

  formBatch(round: number, author: string): { batchHash: string; transactions: Transaction[] } {
    const batchTxs = this.pendingTransactions.splice(0, 100);
    if (batchTxs.length === 0) {
      return { batchHash: '', transactions: [] };
    }

    const batchHash = this.computeBatchHash(batchTxs, round, author);
    const vertex: DAGVertex = {
      hash: batchHash,
      transaction: batchTxs[0],
      parents: this.getActiveParentHashes(),
      round,
      author,
      timestamp: Date.now(),
    };

    this.dag.set(batchHash, vertex);

    return { batchHash, transactions: batchTxs };
  }

  verifyBatchCertificate(cert: BatchCertificate): boolean {
    const requiredQuorum = 2 * this.validators.byzantineThreshold + 1;

    if (cert.signatures.length < requiredQuorum) {
      return false;
    }

    const uniqueSigners = new Set(cert.signatures.map((s) => s.validatorId));
    if (uniqueSigners.size < requiredQuorum) {
      return false;
    }

    for (const signer of uniqueSigners) {
      if (!this.validators.validators.has(signer)) {
        return false;
      }
    }

    return true;
  }

  private getActiveParentHashes(): string[] {
    const recentHashes = Array.from(this.dag.keys()).slice(-10);
    return recentHashes.length > 0 ? recentHashes : [];
  }

  private computeBatchHash(
    transactions: Transaction[],
    round: number,
    author: string,
  ): string {
    const data = transactions
      .map((tx) => `${tx.id}${tx.sender}${tx.recipient}${tx.value}${tx.nonce}`)
      .join('');
    const input = `${data}${round}${author}${Date.now()}`;

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  getDAGState() {
    return {
      vertices: Array.from(this.dag.values()),
      pendingCount: this.pendingTransactions.length,
      currentRound: this.currentRound,
      validatorCount: this.validators.validators.size,
    };
  }

  advanceRound(author: string): { batchHash: string; transactions: Transaction[] } {
    this.currentRound++;
    return this.formBatch(this.currentRound, author);
  }
}
