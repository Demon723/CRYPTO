import { TransactionPool } from '../mempool/tx-pool';
export interface FaucetConfig {
    amount: bigint;
    cooldownMs: number;
    maxPerDay: number;
}
export declare class FaucetService {
    private pool;
    private config;
    private claims;
    constructor(pool: TransactionPool, config?: Partial<FaucetConfig>);
    request(address: string): {
        success: boolean;
        reason?: string;
        txHash?: string;
    };
    getClaimHistory(address: string): Array<{
        timestamp: number;
        txHash: string;
    }>;
}
