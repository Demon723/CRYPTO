import { PrismaService } from '../../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { TransactionEntity, TransactionFilter, TransactionType } from '../entities/transaction.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
export declare class TransactionsService {
    private readonly prisma;
    private readonly httpService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService);
    getUserTransactions(filter: TransactionFilter): Promise<{
        data: TransactionEntity[];
        total: number;
    }>;
    getTransactionByHash(userId: string, hash: string): Promise<TransactionEntity | null>;
    indexTransactionsFromAddress(userId: string, address: string, chain: Chain): Promise<TransactionEntity[]>;
    getTransactionStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalTransactions: number;
        totalVolumeUsd: string;
        totalFeesUsd: string;
        byType: Record<TransactionType, number>;
        byChain: Record<string, number>;
    }>;
    private fetchTransactionsFromChain;
    private inferTransactionType;
    private getTokenSymbol;
}
