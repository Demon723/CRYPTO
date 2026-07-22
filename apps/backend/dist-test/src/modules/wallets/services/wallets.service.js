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
var WalletsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const http_service_1 = require("../../common/modules/http.service");
const wallet_entity_1 = require("../entities/wallet.entity");
const logger_service_1 = require("../../common/modules/logger.service");
const app_utils_1 = require("../../common/utils/app.utils");
let WalletsService = WalletsService_1 = class WalletsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService(WalletsService_1.name);
        this.rpcUrls = {
            [wallet_entity_1.Chain.ETHEREUM]: process.env.ETHEREUM_RPC_URL || '',
            [wallet_entity_1.Chain.POLYGON]: process.env.POLYGON_RPC_URL || '',
            [wallet_entity_1.Chain.BSC]: process.env.BSC_RPC_URL || '',
            [wallet_entity_1.Chain.ARBITRUM]: process.env.ARBITRUM_RPC_URL || '',
            [wallet_entity_1.Chain.BASE]: process.env.BASE_RPC_URL || '',
            [wallet_entity_1.Chain.AVALANCHE]: process.env.AVALANCHE_RPC_URL || '',
            [wallet_entity_1.Chain.LXON]: process.env.LXON_RPC_URL || 'https://rpc.lxonevm.com',
        };
    }
    async getUserWallets(userId) {
        return this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWalletById(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async createWallet(userId, dto) {
        const normalizedAddress = (0, app_utils_1.normalizeAddress)(dto.address);
        if (!(0, app_utils_1.isValidEthereumAddress)(normalizedAddress)) {
            throw new common_1.BadRequestException('Invalid wallet address');
        }
        const existing = await this.prisma.wallet.findFirst({
            where: {
                userId,
                address: normalizedAddress,
                chain: dto.chain,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Wallet already added for this chain');
        }
        const wallet = await this.prisma.wallet.create({
            data: {
                userId,
                address: normalizedAddress,
                chain: dto.chain,
                label: dto.label || (0, app_utils_1.truncateAddress)(normalizedAddress),
                type: dto.type || wallet_entity_1.WalletType.EOA,
                isWatchOnly: dto.isWatchOnly || false,
            },
        });
        this.logger.log(`Wallet created: ${normalizedAddress} for user ${userId}`, 'WalletsService');
        return wallet;
    }
    async deleteWallet(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        await this.prisma.wallet.update({
            where: { id: walletId },
            data: { isActive: false },
        });
        this.logger.log(`Wallet deactivated: ${wallet.address}`, 'WalletsService');
    }
    async syncWalletBalances(walletId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        this.logger.log(`Syncing balances for wallet: ${wallet.address}`, 'WalletsService');
        try {
            const balances = await this.fetchTokenBalances(wallet.address, wallet.chain);
            await this.prisma.tokenBalance.deleteMany({ where: { walletId } });
            await this.prisma.tokenBalance.createMany({
                data: balances.map((b) => ({
                    ...b,
                    walletId,
                })),
            });
            await this.prisma.wallet.update({
                where: { id: walletId },
                data: { lastSyncAt: new Date() },
            });
        }
        catch (error) {
            this.logger.error(`Failed to sync balances for wallet ${walletId}`, error, 'WalletsService');
            throw new common_1.BadRequestException('Failed to sync wallet balances');
        }
    }
    async getWalletWithBalances(userId, walletId) {
        const wallet = await this.getWalletById(userId, walletId);
        const balances = await this.prisma.tokenBalance.findMany({
            where: { walletId },
            orderBy: { balanceUsd: 'desc' },
        });
        const nfts = await this.prisma.nft.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            ...wallet,
            balances: balances.map((b) => ({
                symbol: b.symbol,
                name: b.name,
                balance: b.balance,
                balanceUsd: b.balanceUsd?.toString(),
                priceUsd: b.priceUsd?.toString(),
                change24h: b.change24h?.toString(),
            })),
            nfts: nfts.map((nft) => ({
                id: nft.id,
                name: nft.name,
                collectionName: nft.collectionName,
                imageUrl: nft.imageUrl,
                floorPriceUsd: nft.floorPriceUsd?.toString(),
            })),
        };
    }
    async fetchTokenBalances(address, chain) {
        const rpcUrl = this.rpcUrls[chain];
        if (!rpcUrl) {
            this.logger.warn(`No RPC URL configured for chain ${chain}`, 'WalletsService');
            return [];
        }
        const balances = [];
        try {
            const nativeBalance = await this.getNativeBalance(rpcUrl, address, chain);
            balances.push(nativeBalance);
        }
        catch (error) {
            this.logger.warn(`Failed to fetch native balance: ${error.message}`, 'WalletsService');
        }
        return balances;
    }
    async getNativeBalance(rpcUrl, address, chain) {
        const response = await this.httpService.getAxiosInstance().post(rpcUrl, {
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1,
        });
        const rawBalance = BigInt(response.data.result);
        const decimals = chain === wallet_entity_1.Chain.BSC ? 18 : 18;
        const balance = Number(rawBalance) / 10 ** decimals;
        return {
            tokenAddress: 'native',
            symbol: this.getNativeSymbol(chain),
            name: this.getNativeName(chain),
            decimals,
            balance: balance.toFixed(18),
            balanceUsd: null,
            priceUsd: null,
            change24h: null,
        };
    }
    getNativeSymbol(chain) {
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
    getNativeName(chain) {
        const names = {
            [wallet_entity_1.Chain.ETHEREUM]: 'Ethereum',
            [wallet_entity_1.Chain.POLYGON]: 'Polygon',
            [wallet_entity_1.Chain.BSC]: 'BNB',
            [wallet_entity_1.Chain.ARBITRUM]: 'Ethereum',
            [wallet_entity_1.Chain.BASE]: 'Ethereum',
            [wallet_entity_1.Chain.AVALANCHE]: 'Avalanche',
            [wallet_entity_1.Chain.LXON]: 'LXON Chain',
        };
        return names[chain];
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = WalletsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, http_service_1.HttpService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map