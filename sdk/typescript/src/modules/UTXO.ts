/**
 * UTXO Module
 * 
 * Bitcoin-style UTXO management with hybrid state model support
 */

export class HybridStateManager {
  private utxos: Map<string, any>;
  private checkpoints: any[];

  constructor() {
    this.utxos = new Map();
    this.checkpoints = [];
  }

  createUTXO(txId: string, outputIndex: number, amount: bigint, owner: string): any {
    const utxo = {
      txId,
      outputIndex,
      amount,
      owner,
      spent: false
    };
    this.utxos.set(`${txId}:${outputIndex}`, utxo);
    return utxo;
  }

  spendUTXO(txId: string, outputIndex: number): void {
    const key = `${txId}:${outputIndex}`;
    const utxo = this.utxos.get(key);
    if (utxo) {
      utxo.spent = true;
    }
  }

  getUTXO(txId: string, outputIndex: number): any {
    return this.utxos.get(`${txId}:${outputIndex}`);
  }

  getAccountBalance(address: string): bigint {
    let balance = 0n;
    for (const utxo of this.utxos.values()) {
      if (utxo.owner === address && !utxo.spent) {
        balance += utxo.amount;
      }
    }
    return balance;
  }

  createCheckpoint(): any {
    const utxoCopy = new Map(
      Array.from(this.utxos.entries()).map(([key, utxo]) => [
        key,
        { ...utxo }
      ])
    );
    const checkpoint = {
      timestamp: Date.now(),
      utxos: utxoCopy
    };
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }

  revertToCheckpoint(checkpoint: any): void {
    this.utxos = new Map(checkpoint.utxos);
  }

  getUTXOCount(): number {
    return this.utxos.size;
  }
}