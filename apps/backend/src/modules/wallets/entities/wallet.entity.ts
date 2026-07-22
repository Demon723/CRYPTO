export enum Chain {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  ARBITRUM = 'ARBITRUM',
  BASE = 'BASE',
  AVALANCHE = 'AVALANCHE',
  LXON = 'LXON',
}

export enum WalletType {
  EOA = 'EOA',
  SMART_CONTRACT = 'SMART_CONTRACT',
  MULTISIG = 'MULTISIG',
  EMBEDDED = 'EMBEDDED',
}

export interface WalletEntity {
  id: string;
  userId: string;
  address: string;
  chain: Chain;
  label?: string;
  type: WalletType;
  isActive: boolean;
  isWatchOnly: boolean;
  ensName?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletWithBalance extends WalletEntity {
  balances: Array<{
    symbol: string;
    name: string;
    balance: string;
    balanceUsd?: string;
    priceUsd?: string;
    change24h?: string;
  }>;
  nfts?: Array<{
    id: string;
    name?: string;
    collectionName?: string;
    imageUrl?: string;
    floorPriceUsd?: string;
  }>;
}

export interface WalletCreateDto {
  address: string;
  chain: Chain;
  label?: string;
  type?: WalletType;
  isWatchOnly?: boolean;
}
