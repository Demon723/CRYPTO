export interface NftEntity {
  id: string;
  walletId: string;
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  floorPriceUsd?: string;
  lastSalePriceUsd?: string;
  rarityRank?: number;
  traits?: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface NftCollection {
  collectionName: string;
  contractAddress: string;
  count: number;
  floorPriceUsd?: string;
  totalValueUsd?: string;
  nfts: NftEntity[];
}

export interface NftTransfer {
  hash: string;
  from: string;
  to: string;
  timestamp: Date;
  transactionHash: string;
}
