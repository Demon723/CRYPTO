/**
 * UTXO Module
 *
 * Bitcoin-style UTXO management with hybrid state model support
 */
export declare class HybridStateManager {
    private utxos;
    private checkpoints;
    constructor();
    createUTXO(txId: string, outputIndex: number, amount: bigint, owner: string): any;
    spendUTXO(txId: string, outputIndex: number): void;
    getUTXO(txId: string, outputIndex: number): any;
    getAccountBalance(address: string): bigint;
    createCheckpoint(): any;
    revertToCheckpoint(checkpoint: any): void;
    getUTXOCount(): number;
}
//# sourceMappingURL=UTXO.d.ts.map