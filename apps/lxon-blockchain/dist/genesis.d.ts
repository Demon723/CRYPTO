export interface GenesisConfig {
    chainId: number;
    network: 'mainnet' | 'testnet' | 'devnet';
    genesisTime: number;
    validators: Array<{
        address: string;
        publicKey: string;
        stake: bigint;
    }>;
    initialSupply: bigint;
    maxSupply: bigint;
    emissionRate: number;
    blockTime: number;
    epochLength: number;
    astroDeadlineHeight: number;
}
export interface GenesisBlock {
    height: number;
    timestamp: number;
    previousBlockHash: string;
    transactions: string[];
    validatorSet: string[];
    totalStake: bigint;
    configHash: string;
}
export declare const MAINNET_GENESIS: GenesisConfig;
export declare const TESTNET_GENESIS: GenesisConfig;
export declare function getGenesisConfig(network?: 'mainnet' | 'testnet' | 'devnet'): GenesisConfig;
export declare function createGenesisBlock(config: GenesisConfig): GenesisBlock;
export declare function hashGenesisConfig(config: GenesisConfig): string;
export declare function validateGenesis(block: GenesisBlock, config: GenesisConfig): boolean;
