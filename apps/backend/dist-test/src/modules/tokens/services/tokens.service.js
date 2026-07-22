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
var TokensService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const http_service_1 = require("../../common/modules/http.service");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let TokensService = TokensService_1 = class TokensService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService(TokensService_1.name);
        this.coinGeckoApi = 'https://api.coingecko.com/api/v3';
        this.dexScreenerApi = 'https://api.dexscreener.com/latest/dex';
    }
    async searchTokens(query, chain) {
        if (!query || query.length < 2) {
            throw new common_1.BadRequestException('Query must be at least 2 characters');
        }
        const normalizedQuery = query.toLowerCase();
        const dbTokens = await this.prisma.token.findMany({
            where: {
                OR: [
                    { symbol: { contains: query.toUpperCase() } },
                    { name: { contains: query } },
                    { address: { contains: query.toLowerCase() } },
                ],
                ...(chain && { chain }),
            },
            take: 20,
            orderBy: { marketCapUsd: 'desc' },
        });
        const externalResults = await this.fetchExternalTokens(query, chain);
        const combined = [...dbTokens, ...externalResults];
        const unique = new Map();
        for (const token of combined) {
            const key = `${token.chain}-${token.address}`;
            if (!unique.has(key)) {
                unique.set(key, token);
            }
        }
        return Array.from(unique.values()).slice(0, 50);
    }
    async getTokenByAddress(address, chain) {
        const normalizedAddress = address.toLowerCase().replace(/^0x/, '0x');
        let token = await this.prisma.token.findUnique({
            where: { address: normalizedAddress },
        });
        if (!token) {
            token = await this.fetchAndUpsertToken(normalizedAddress, chain);
        }
        if (!token) {
            return null;
        }
        return {
            address: token.address,
            chain: token.chain,
            symbol: token.symbol,
            name: token.name,
            priceUsd: token.priceUsd?.toString(),
            change24h: token.change24h?.toString(),
            marketCapUsd: token.marketCapUsd?.toString(),
            volumeUsd24h: token.volumeUsd24h?.toString(),
            riskScore: token.riskScore || undefined,
            isVerified: token.isVerified,
            isScam: token.isScam,
        };
    }
    async getTokenPrice(address, chain) {
        const token = await this.getTokenByAddress(address, chain);
        if (!token) {
            return null;
        }
        return {
            priceUsd: token.priceUsd || '0',
            change24h: token.change24h || '0',
        };
    }
    async getTrendingTokens(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
            },
            orderBy: { volumeUsd24h: 'desc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            riskScore: t.riskScore || undefined,
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async getTopGainers(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
                change24h: { not: null },
            },
            orderBy: { change24h: 'desc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async getTopLosers(chain) {
        const tokens = await this.prisma.token.findMany({
            where: {
                ...(chain && { chain }),
                isScam: false,
                change24h: { not: null },
            },
            orderBy: { change24h: 'asc' },
            take: 20,
        });
        return tokens.map((t) => ({
            address: t.address,
            chain: t.chain,
            symbol: t.symbol,
            name: t.name,
            priceUsd: t.priceUsd?.toString(),
            change24h: t.change24h?.toString(),
            marketCapUsd: t.marketCapUsd?.toString(),
            volumeUsd24h: t.volumeUsd24h?.toString(),
            isVerified: t.isVerified,
            isScam: t.isScam,
        }));
    }
    async fetchExternalTokens(query, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`${this.dexScreenerApi}/search`, {
                params: { q: query },
            });
            const pairs = response.data.pairs || [];
            const tokens = [];
            for (const pair of pairs) {
                if (chain && this.mapChain(pair.chainId) !== chain) {
                    continue;
                }
                tokens.push({
                    address: pair.baseToken.address,
                    chain: this.mapChain(pair.chainId),
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    priceUsd: pair.priceUsd,
                    change24h: pair.priceChange?.h24,
                    marketCapUsd: pair.marketCap?.toString(),
                    volumeUsd24h: pair.volume?.h24?.toString(),
                });
            }
            return tokens.slice(0, 20);
        }
        catch (error) {
            this.logger.warn(`Failed to fetch external tokens: ${error.message}`, 'TokensService');
            return [];
        }
    }
    async fetchAndUpsertToken(address, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`${this.dexScreenerApi}/search`, {
                params: { q: address },
            });
            const pair = response.data.pairs?.[0];
            if (!pair)
                return null;
            return this.prisma.token.upsert({
                where: { address: address.toLowerCase() },
                create: {
                    address: address.toLowerCase(),
                    chain,
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    decimals: 18,
                    priceUsd: parseFloat(pair.priceUsd || '0'),
                    change24h: parseFloat(pair.priceChange?.h24 || '0'),
                    marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
                    volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
                    lastUpdated: new Date(),
                },
                update: {
                    priceUsd: parseFloat(pair.priceUsd || '0'),
                    change24h: parseFloat(pair.priceChange?.h24 || '0'),
                    marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
                    volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
                    lastUpdated: new Date(),
                },
            });
        }
        catch (error) {
            this.logger.warn(`Failed to fetch token from external API: ${error.message}`, 'TokensService');
            return null;
        }
    }
    mapChain(chainId) {
        const chainMap = {
            ethereum: wallet_entity_1.Chain.ETHEREUM,
            polygon: wallet_entity_1.Chain.POLYGON,
            bsc: wallet_entity_1.Chain.BSC,
            arbitrum: wallet_entity_1.Chain.ARBITRUM,
            base: wallet_entity_1.Chain.BASE,
            avalanche: wallet_entity_1.Chain.AVALANCHE,
            lxon: wallet_entity_1.Chain.LXON,
        };
        return chainMap[chainId] || wallet_entity_1.Chain.ETHEREUM;
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = TokensService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        http_service_1.HttpService])
], TokensService);
//# sourceMappingURL=tokens.service.js.map