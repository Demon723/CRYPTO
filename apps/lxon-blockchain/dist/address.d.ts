export interface AddressInfo {
    address: string;
    type: 'p2pkh' | 'p2sh' | 'p2wsh' | 'p2as';
    version: number;
    data: Uint8Array;
}
export declare function encodeP2PKH(publicKey: Uint8Array, testnet?: boolean): string;
export declare function encodeP2AS(classicalPub: Uint8Array, arcPub: Uint8Array): string;
export declare function decodeAddress(address: string): AddressInfo | null;
