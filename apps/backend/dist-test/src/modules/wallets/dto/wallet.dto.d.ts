import { Chain } from '../../wallets/entities/wallet.entity';
export declare class WalletCreateDto {
    address: string;
    chain: Chain;
    label?: string;
    type?: string;
    isWatchOnly?: boolean;
}
export declare class WalletSyncDto {
    walletId?: string;
}
