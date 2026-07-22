import { NftsService } from '../services/nfts.service';
export declare class NftsController {
    private readonly nftsService;
    constructor(nftsService: NftsService);
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
    getWalletNfts(userId: string, walletId: string): Promise<import("../entities/nft.entity").NftEntity[]>;
    getNft(userId: string, nftId: string): Promise<import("../entities/nft.entity").NftEntity>;
    getCollections(userId: string): Promise<import("../entities/nft.entity").NftCollection[]>;
    syncNfts(userId: string, walletId: string): Promise<import("../entities/nft.entity").NftEntity[]>;
}
