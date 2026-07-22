"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TransactionsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const http_service_1 = require("../../common/modules/http.service");
const transaction_entity_1 = require("../entities/transaction.entity");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService(TransactionsService_1.name);
    }
    async getUserTransactions(filter) {
        const { page = 1, limit = 20, ...where } = filter;
        const skip = (page - 1) * limit;
        const query = {
            where: {
                userId: where.userId,
                ...(where.chain && { chain: where.chain }),
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
        return { data, total };
    }
    async getTransactionByHash(userId, hash) {
        return this.prisma.transaction.findFirst({
            where: { userId, hash },
        });
    }
    async indexTransactionsFromAddress(userId, address, chain) {
        this.logger.log(`Indexing transactions for ${address} on ${chain}`, 'TransactionsService');
        const transactions = await this.fetchTransactionsFromChain(address, chain);
        const stored = [];
        for (const tx of transactions) {
            const existing = await this.prisma.transaction.findUnique({
                where: { hash: tx.hash },
            });
            if (!existing) {
                const created = await this.prisma.transaction.create({
                    data: {
                        ...tx,
                        userId,
                        status: transaction_entity_1.TransactionStatus.CONFIRMED,
                    },
                });
                stored.push(created);
            }
        }
        return stored;
    }
    async getTransactionStats(userId, startDate, endDate) {
        const where = {
            userId,
        };
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = startDate;
            if (endDate)
                where.timestamp.lte = endDate;
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
            byType: {},
            byChain: {},
        };
        let totalVolume = 0;
        let totalFees = 0;
        for (const tx of transactions) {
            stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
            stats.byChain[tx.chain] = (stats.byChain[tx.chain] || 0) + 1;
            if (tx.valueUsd)
                totalVolume += parseFloat(tx.valueUsd);
            if (tx.feeUsd)
                totalFees += parseFloat(tx.feeUsd);
        }
        stats.totalVolumeUsd = totalVolume.toFixed(2);
        stats.totalFeesUsd = totalFees.toFixed(2);
        return stats;
    }
    async fetchTransactionsFromChain(address, chain) {
        const apiKeys = {
            [wallet_entity_1.Chain.ETHEREUM]: process.env.ETHERSCAN_API_KEY,
            [wallet_entity_1.Chain.POLYGON]: process.env.POLYGONSCAN_API_KEY,
            [wallet_entity_1.Chain.BSC]: process.env.BSCSCAN_API_KEY,
            [wallet_entity_1.Chain.ARBITRUM]: process.env.ARBISCAN_API_KEY,
            [wallet_entity_1.Chain.BASE]: process.env.BASESCAN_API_KEY,
            [wallet_entity_1.Chain.AVALANCHE]: process.env.SNOWTRACE_API_KEY,
            [wallet_entity_1.Chain.LXON]: process.env.LXONSCAN_API_KEY,
        };
        const explorerUrls = {
            [wallet_entity_1.Chain.ETHEREUM]: 'https://api.etherscan.io/api',
            [wallet_entity_1.Chain.POLYGON]: 'https://api.polygonscan.com/api',
            [wallet_entity_1.Chain.BSC]: 'https://api.bscscan.com/api',
            [wallet_entity_1.Chain.ARBITRUM]: 'https://api.arbiscan.io/api',
            [wallet_entity_1.Chain.BASE]: 'https://api.basescan.org/api',
            [wallet_entity_1.Chain.AVALANCHE]: 'https://api.snowtrace.io/api',
            [wallet_entity_1.Chain.LXON]: 'https://explorer.lxonevm.com/api',
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
            return result.result.slice(0, 100).map((tx) => ({
                hash: tx.hash,
                chain: chain,
                type: this.inferTransactionType(tx),
                fromAddress: tx.from || address,
                toAddress: tx.to || undefined,
                value: tx.value,
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                blockNumber: parseInt(tx.blockNumber, 10),
                timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000),
                status: (tx.txreceipt_status === '1' ? transaction_entity_1.TransactionStatus.CONFIRMED : transaction_entity_1.TransactionStatus.FAILED),
                contractAddress: tx.to || undefined,
                tokenSymbol: this.getTokenSymbol(chain),
            }));
        }
        catch (error) {
            this.logger.warn(`Failed to fetch transactions: ${error.message}`, 'TransactionsService');
            return [];
        }
    }
    inferTransactionType(tx) {
        if (!tx.to || tx.to === '0x')
            return transaction_entity_1.TransactionType.CONTRACT_CALL;
        if (tx.input && tx.input !== '0x') {
            const methodId = tx.input.slice(0, 10).toLowerCase();
            const methodMap = {
                '0xa9059cbb': transaction_entity_1.TransactionType.TRANSFER,
                '0x095ea7b3': transaction_entity_1.TransactionType.APPROVE,
                '0x23b872dd': transaction_entity_1.TransactionType.TRANSFER,
            };
            return methodMap[methodId] || transaction_entity_1.TransactionType.CONTRACT_CALL;
        }
        return transaction_entity_1.TransactionType.TRANSFER;
    }
    getTokenSymbol(chain) {
        const symbols = {
            [wallet_entity_1.Chain.ETHEREUM]: 'ETH',
            [wallet_entity_1.Chain.POLYGON]: 'MATIC',
            [wallet_entity_1.Chain.BSC]: 'BNB',
            [wallet_entity_1.Chain.ARBITRUM]: 'ETH',
            [wallet_entity_1.Chain.BASE]: 'ETH',
            [wallet_entity_1.Chain.AVALANCHE]: 'AVAX',
            [wallet_entity_1.Chain.LXON]: 'LXON',
        };
        return symbols[chain];
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, http_service_1.HttpService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map