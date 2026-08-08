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

export const MAINNET_GENESIS: GenesisConfig = {
  chainId: 1,
  network: 'mainnet',
  genesisTime: Math.floor(Date.now() / 1000),
  validators: [],
  initialSupply: 100_000_000n * 10n ** 18n,
  maxSupply: 1_000_000_000n * 10n ** 18n,
  emissionRate: 5,
  blockTime: 2,
  epochLength: 1000,
  astroDeadlineHeight: 20 * 365 * 24 * 60 * 60,
};

export const TESTNET_GENESIS: GenesisConfig = {
  chainId: 1337,
  network: 'testnet',
  genesisTime: Math.floor(Date.now() / 1000),
  validators: [],
  initialSupply: 100_000_000n * 10n ** 18n,
  maxSupply: 1_000_000_000n * 10n ** 18n,
  emissionRate: 5,
  blockTime: 1,
  epochLength: 500,
  astroDeadlineHeight: 20 * 365 * 24 * 60 * 60,
};

export function createGenesisBlock(config: GenesisConfig): GenesisBlock {
  const configHash = hashGenesisConfig(config);
  return {
    height: 0,
    timestamp: config.genesisTime,
    previousBlockHash: '0'.repeat(64),
    transactions: [],
    validatorSet: config.validators.map(v => v.address),
    totalStake: config.validators.reduce((sum, v) => sum + v.stake, 0n),
    configHash,
  };
}

export function hashGenesisConfig(config: GenesisConfig): string {
  const data = JSON.stringify({
    chainId: config.chainId,
    network: config.network,
    genesisTime: config.genesisTime,
    initialSupply: config.initialSupply.toString(),
    maxSupply: config.maxSupply.toString(),
    emissionRate: config.emissionRate,
    blockTime: config.blockTime,
    epochLength: config.epochLength,
  });
  return Buffer.from(data).toString('hex').slice(0, 64);
}

export function validateGenesis(block: GenesisBlock, config: GenesisConfig): boolean {
  if (block.height !== 0) return false;
  if (block.timestamp !== config.genesisTime) return false;
  if (block.previousBlockHash !== '0'.repeat(64)) return false;
  if (block.configHash !== hashGenesisConfig(config)) return false;
  return true;
}
