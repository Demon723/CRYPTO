export interface Bip85Config {
    master: Buffer;
    application: string;
    outputEntropy: number;
    index: number;
}
export interface Bip85Result {
    entropy: Buffer;
    mnemonic?: string;
    hex?: string;
}
export declare class Bip85 {
    static deriveEntropy(config: Bip85Config): Buffer;
    static deriveMnemonic(config: Bip85Config & {
        wordCount: number;
    }): {
        entropy: Buffer;
        mnemonic: string;
    };
    static deriveXprv(config: Bip85Config): string;
}
