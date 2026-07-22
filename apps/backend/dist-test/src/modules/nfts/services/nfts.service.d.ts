import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { NftEntity, NftCollection } from '../entities/nft.entity';
export declare class NftsService {
    private readonly prisma;
    private readonly httpService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService);
    getUserNfts(userId: string): Promise<({
        wallet: {
            address: string;
            chain: import(".prisma/client").$Enums.Chain;
            label: string;
        };
    } & {
        name: string | null;
        id: string;
        createdAt: Date;
        description: string | null;
        walletId: string;
        lastUpdated: Date;
        contractAddress: string;
        tokenId: string;
        imageUrl: string | null;
        collectionName: string | null;
        floorPriceUsd: import("@prisma/client/runtime/library").Decimal | null;
        lastSalePriceUsd: import("@prisma/client/runtime/library").Decimal | null;
        rarityRank: number | null;
        traits: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getWalletNfts(userId: string, walletId: string): Promise<NftEntity[]>;
    getNftById(userId: string, nftId: string): Promise<NftEntity>;
    getCollections(userId: string): Promise<NftCollection[]>;
    syncNftsForWallet(userId: string, walletId: string): Promise<NftEntity[]>;
    private fetchNftsFromApi;
}
