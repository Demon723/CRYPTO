import { generateAstroWallet } from '../wallet/astro-wallet';
export interface ReceiveAddress {
    address: string;
    type: 'classical' | 'astro';
    publicKey: string;
    path: string;
}
export declare function generateReceiveAddress(wallet: ReturnType<typeof generateAstroWallet>, type?: 'classical' | 'astro'): ReceiveAddress;
export declare function generateNewAddress(): ReceiveAddress;
export declare function hashMessage(message: string): string;
