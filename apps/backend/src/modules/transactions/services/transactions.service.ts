// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { TransactionEntity, TransactionFilter, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { Chain } from '../../wallets/entities/wallet.entity';
import { LoggerService } from '../../common/modules/logger.service';
import { chunkArray } from '../../common/utils/app.utils';

@Injectable()
export class TransactionsService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getUserTransactions(filter: TransactionFilter): Promise<{ data: TransactionEntity[]; total: number }> {
    const { page = 1, limit = 20, ...where } = filter;
    const skip = (page - 1) * limit;

    const query: Parameters<typeof this.prisma.transaction.findMany>[0] = {
      where: {
        userId: where.userId,
        ...(where.chain && { chain: where.chain as Chain }),
        ...(where.type && { type: where.type }),
        ...(where.status && { status: where.status }),
        ...(where.fromAddress && { fromAddress: { equals: where.fromAddress } }),
        ...(where.toAddress && { toAddress: { equals: where.toAddress } }),
        ...(where.startDate && { timestamp: { gte: where.startDate } }),
        ...(where.endDate && { timestamp: { lte: where.endDate } }),
      },
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
    };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany(query),
      this.prisma.transaction.count({ where: query.where }),
    ]);

// @ts-ignore
    return { data, total };
  }

  async getTransactionByHash(userId: string, hash: string): Promise<TransactionEntity | null> {
// @ts-ignore
    return this.prisma.transaction.findFirst({
      where: { userId, hash },
    });
  }

  async indexTransactionsFromAddress(
    userId: string,
    address: string,
    chain: Chain,
  ): Promise<TransactionEntity[]> {
    this.logger.log(`Indexing transactions for ${address} on ${chain}`, 'TransactionsService');

    const transactions = await this.fetchTransactionsFromChain(address, chain);
    const stored: TransactionEntity[] = [];

    for (const tx of transactions) {
      const existing = await this.prisma.transaction.findUnique({
        where: { hash: tx.hash },
      });

      if (!existing) {
        const created = await this.prisma.transaction.create({
          data: {
            ...tx,
            userId,
            status: TransactionStatus.CONFIRMED,
          },
        });
        stored.push(created);
      }
    }

    return stored;
  }

  async getTransactionStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalTransactions: number;
    totalVolumeUsd: string;
    totalFeesUsd: string;
    byType: Record<TransactionType, number>;
    byChain: Record<string, number>;
  }> {
    const where: Parameters<typeof this.prisma.transaction.findMany>[0]['where'] = {
      userId,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        type: true,
        chain: true,
        valueUsd: true,
        feeUsd: true,
      },
    });

    const stats = {
      totalTransactions: transactions.length,
      totalVolumeUsd: '0',
      totalFeesUsd: '0',
      byType: {} as Record<TransactionType, number>,
      byChain: {} as Record<string, number>,
    };

    let totalVolume = 0;
    let totalFees = 0;

    for (const tx of transactions) {
      stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
      stats.byChain[tx.chain] = (stats.byChain[tx.chain] || 0) + 1;

// @ts-ignore
      if (tx.valueUsd) totalVolume += parseFloat(tx.valueUsd);
// @ts-ignore
      if (tx.feeUsd) totalFees += parseFloat(tx.feeUsd);
    }

    stats.totalVolumeUsd = totalVolume.toFixed(2);
    stats.totalFeesUsd = totalFees.toFixed(2);

    return stats;
  }

  private async fetchTransactionsFromChain(
    address: string,
    chain: Chain,
  ): Promise<Partial<TransactionEntity>[]> {
    const apiKeys: Record<Chain, string | undefined> = {
      [Chain.ETHEREUM]: process.env.ETHERSCAN_API_KEY,
      [Chain.POLYGON]: process.env.POLYGONSCAN_API_KEY,
      [Chain.BSC]: process.env.BSCSCAN_API_KEY,
      [Chain.ARBITRUM]: process.env.ARBISCAN_API_KEY,
      [Chain.BASE]: process.env.BASESCAN_API_KEY,
      [Chain.AVALANCHE]: process.env.SNOWTRACE_API_KEY,
    [Chain.LXON]: process.env.LXONSCAN_API_KEY,
    };

    const explorerUrls: Record<Chain, string> = {
      [Chain.ETHEREUM]: 'https://api.etherscan.io/api',
      [Chain.POLYGON]: 'https://api.polygonscan.com/api',
      [Chain.BSC]: 'https://api.bscscan.com/api',
      [Chain.ARBITRUM]: 'https://api.arbiscan.io/api',
      [Chain.BASE]: 'https://api.basescan.org/api',
      [Chain.AVALANCHE]: 'https://api.snowtrace.io/api',
    [Chain.LXON]: 'https://explorer.lxonevm.com/api',
    };

    const apiKey = apiKeys[chain];
    const baseUrl = explorerUrls[chain];

    if (!apiKey) {
      this.logger.warn(`No API key configured for chain ${chain}`, 'TransactionsService');
      return [];
    }

    try {
      const response = await this.httpService
        .getAxiosInstance()
        .get(baseUrl, {
          params: {
            module: 'account',
            action: 'txlist',
            address,
            startblock: 0,
            endblock: 99999999,
            sort: 'desc',
            apikey: apiKey,
          },
        });

      const result = response.data;
      if (result.status !== '1') {
        return [];
      }

      return result.result.slice(0, 100).map((tx: Record<string, unknown>) => ({
        hash: tx.hash as string,
        chain: chain as Chain,
        type: this.inferTransactionType(tx),
        fromAddress: (tx.from as string) || address,
        toAddress: (tx.to as string) || undefined,
        value: tx.value as string,
        gasUsed: tx.gasUsed as string,
        gasPrice: tx.gasPrice as string,
        blockNumber: parseInt(tx.blockNumber as string, 10),
        timestamp: new Date(parseInt(tx.timeStamp as string, 10) * 1000),
        status: (tx.txreceipt_status === '1' ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED) as TransactionStatus,
        contractAddress: (tx.to as string) || undefined,
        tokenSymbol: this.getTokenSymbol(chain),
        ...(tx.data && { metadata: JSON.stringify(tx.data) }),
      }));
    } catch (error) {
      this.logger.warn(`Failed to fetch transactions: ${error.message}`, 'TransactionsService');
      return [];
    }
  }

  private inferTransactionType(tx: Record<string, unknown>): TransactionType {
    if (!tx.to || tx.to === '0x') return TransactionType.CONTRACT_CALL;
    if (tx.input && tx.input !== '0x') {
      const methodId = (tx.input as string).slice(0, 10).toLowerCase();
      const methodMap: Record<string, TransactionType> = {
        '0xa9059cbb': TransactionType.TRANSFER,
        '0x095ea7b3': TransactionType.APPROVE,
        '0x23b872dd': TransactionType.TRANSFER,
      };
      return methodMap[methodId] || TransactionType.CONTRACT_CALL;
    }
    return TransactionType.TRANSFER;
  }

  private getTokenSymbol(chain: Chain): string {
    const symbols: Record<Chain, string> = {
      [Chain.ETHEREUM]: 'ETH',
      [Chain.POLYGON]: 'MATIC',
      [Chain.BSC]: 'BNB',
      [Chain.ARBITRUM]: 'ETH',
      [Chain.BASE]: 'ETH',
      [Chain.AVALANCHE]: 'AVAX',
    [Chain.LXON]: 'LXON',
    };
    return symbols[chain];
  }
}
