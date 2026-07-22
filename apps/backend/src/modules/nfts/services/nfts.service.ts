// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { NftEntity, NftCollection } from '../entities/nft.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class NftsService {
  private readonly logger = new LoggerService(NftsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getUserNfts(userId: string) {
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

  async getWalletNfts(userId: string, walletId: string): Promise<NftEntity[]> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.nft.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNftById(userId: string, nftId: string): Promise<NftEntity> {
    const nft = await this.prisma.nft.findFirst({
      where: { id: nftId },
      include: { wallet: { where: { userId } } },
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    // @ts-ignore
    return nft;
  }

  async getCollections(userId: string): Promise<NftCollection[]> {
    const nfts = await this.getUserNfts(userId);

    const collectionsMap = new Map<string, NftCollection>();

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
      const collection = collectionsMap.get(key)!;
      collection.count += 1;
      collection.nfts.push(nft);
      if (nft.floorPriceUsd) {
        collection.floorPriceUsd = nft.floorPriceUsd;
      }
    }

    return Array.from(collectionsMap.values());
  }

  async syncNftsForWallet(userId: string, walletId: string): Promise<NftEntity[]> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    this.logger.log(`Syncing NFTs for wallet: ${wallet.address}`, 'NftsService');

    try {
      const externalNfts = await this.fetchNftsFromApi(wallet.address, wallet.chain);
      const stored: NftEntity[] = [];

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
    } catch (error) {
      this.logger.warn(`Failed to sync NFTs: ${error.message}`, 'NftsService');
      return [];
    }
  }

  private async fetchNftsFromApi(address: string, chain: string): Promise<Partial<NftEntity>[]> {
    try {
      const response = await this.httpService
        .getAxiosInstance()
        .get(`https://${chain === 'ETHEREUM' ? 'api.opensea.io' : 'api.opensea.io'}/api/v1/assets`, {
          params: { owner: address, limit: 50 },
        });

      return response.data.assets?.map((asset: Record<string, unknown>) => ({
        contractAddress: asset.asset_contract?.address,
        tokenId: asset.token_id,
        name: asset.name,
        description: asset.description,
        imageUrl: asset.image_url,
        collectionName: asset.collection?.name,
        floorPriceUsd: asset.collection?.stats?.floor_price?.toString(),
        lastSalePriceUsd: asset.last_sale?.total_price?.toString(),
        rarityRank: asset.rarity?.rank,
        traits: asset.traits?.reduce((acc: Record<string, string>, trait: Record<string, string>) => {
          acc[trait.trait_type] = trait.value;
          return acc;
        }, {}),
      })) || [];
    } catch (error) {
      this.logger.warn(`Failed to fetch NFTs from OpenSea: ${error.message}`, 'NftsService');
      return [];
    }
  }
}
