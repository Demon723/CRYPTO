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
var NftsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const http_service_1 = require("../../common/modules/http.service");
const logger_service_1 = require("../../common/modules/logger.service");
let NftsService = NftsService_1 = class NftsService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.logger = new logger_service_1.LoggerService(NftsService_1.name);
    }
    async getUserNfts(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            select: { id: true },
        });
        const walletIds = wallets.map((w) => w.id);
        return this.prisma.nft.findMany({
            where: { walletId: { in: walletIds } },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWalletNfts(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return this.prisma.nft.findMany({
            where: { walletId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getNftById(userId, nftId) {
        const nft = await this.prisma.nft.findFirst({
            where: { id: nftId },
            include: { wallet: { where: { userId } } },
        });
        if (!nft) {
            throw new common_1.NotFoundException('NFT not found');
        }
        return nft;
    }
    async getCollections(userId) {
        const nfts = await this.getUserNfts(userId);
        const collectionsMap = new Map();
        for (const nft of nfts) {
            const key = nft.collectionName || nft.contractAddress;
            if (!collectionsMap.has(key)) {
                collectionsMap.set(key, {
                    collectionName: nft.collectionName || 'Unknown Collection',
                    contractAddress: nft.contractAddress,
                    count: 0,
                    floorPriceUsd: nft.floorPriceUsd || undefined,
                    totalValueUsd: '0',
                    nfts: [],
                });
            }
            const collection = collectionsMap.get(key);
            collection.count += 1;
            collection.nfts.push(nft);
            if (nft.floorPriceUsd) {
                collection.floorPriceUsd = nft.floorPriceUsd;
            }
        }
        return Array.from(collectionsMap.values());
    }
    async syncNftsForWallet(userId, walletId) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        this.logger.log(`Syncing NFTs for wallet: ${wallet.address}`, 'NftsService');
        try {
            const externalNfts = await this.fetchNftsFromApi(wallet.address, wallet.chain);
            const stored = [];
            for (const nft of externalNfts) {
                const existing = await this.prisma.nft.findUnique({
                    where: {
                        walletId_contractAddress_tokenId: {
                            walletId,
                            contractAddress: nft.contractAddress,
                            tokenId: nft.tokenId,
                        },
                    },
                });
                if (!existing) {
                    const created = await this.prisma.nft.create({
                        data: {
                            ...nft,
                            walletId,
                        },
                    });
                    stored.push(created);
                }
            }
            return stored;
        }
        catch (error) {
            this.logger.warn(`Failed to sync NFTs: ${error.message}`, 'NftsService');
            return [];
        }
    }
    async fetchNftsFromApi(address, chain) {
        try {
            const response = await this.httpService
                .getAxiosInstance()
                .get(`https://${chain === 'ETHEREUM' ? 'api.opensea.io' : 'api.opensea.io'}/api/v1/assets`, {
                params: { owner: address, limit: 50 },
            });
            return response.data.assets?.map((asset) => ({
                contractAddress: asset.asset_contract?.address,
                tokenId: asset.token_id,
                name: asset.name,
                description: asset.description,
                imageUrl: asset.image_url,
                collectionName: asset.collection?.name,
                floorPriceUsd: asset.collection?.stats?.floor_price?.toString(),
                lastSalePriceUsd: asset.last_sale?.total_price?.toString(),
                rarityRank: asset.rarity?.rank,
                traits: asset.traits?.reduce((acc, trait) => {
                    acc[trait.trait_type] = trait.value;
                    return acc;
                }, {}),
            })) || [];
        }
        catch (error) {
            this.logger.warn(`Failed to fetch NFTs from OpenSea: ${error.message}`, 'NftsService');
            return [];
        }
    }
};
exports.NftsService = NftsService;
exports.NftsService = NftsService = NftsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        http_service_1.HttpService])
], NftsService);
//# sourceMappingURL=nfts.service.js.map