import { TransactionsService } from '../services/transactions.service';
import { TransactionFilter } from '../entities/transaction.entity';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getUserTransactions(userId: string, filters: TransactionFilter): Promise<{
        data: import("../entities/transaction.entity").TransactionEntity[];
        total: number;
    }>;
    getStats(userId: string, query: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalTransactions: number;
        totalVolumeUsd: string;
        totalFeesUsd: string;
        byType: Record<import("../entities/transaction.entity").TransactionType, number>;
        byChain: Record<string, number>;
    }>;
    getTransaction(userId: string, hash: string): Promise<import("../entities/transaction.entity").TransactionEntity>;
    indexTransactions(userId: string, walletAddress: string, chain: string): Promise<import("../entities/transaction.entity").TransactionEntity[]>;
}
