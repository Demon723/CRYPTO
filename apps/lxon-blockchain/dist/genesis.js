"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TESTNET_GENESIS = exports.MAINNET_GENESIS = void 0;
exports.getGenesisConfig = getGenesisConfig;
exports.createGenesisBlock = createGenesisBlock;
exports.hashGenesisConfig = hashGenesisConfig;
exports.validateGenesis = validateGenesis;
function loadValidatorsFromEnv() {
    const validators = [];
    const count = parseInt(process.env.VALIDATOR_COUNT || '0', 10);
    for (let i = 1; i <= count; i++) {
        const address = process.env[`VALIDATOR_${i}_ADDRESS`];
        const publicKey = process.env[`VALIDATOR_${i}_PUBLIC_KEY`];
        const stake = process.env[`VALIDATOR_${i}_STAKE`];
        if (address && publicKey && stake) {
            validators.push({ address, publicKey, stake: BigInt(stake) });
        }
    }
    if (validators.length === 0) {
        const addresses = (process.env.VALIDATOR_ADDRESSES || '').split(',').filter(a => a.length === 42 && a.startsWith('0x'));
        for (const addr of addresses) {
            validators.push({
                address: addr,
                publicKey: process.env.VALIDATOR_PUBLIC_KEY || '',
                stake: BigInt(process.env.VALIDATOR_STAKE || 1000000000n * 10n ** 18n),
            });
        }
    }
    return validators;
}
const MAINNET_GENESIS_TIME = process.env.GENESIS_TIME
    ? parseInt(process.env.GENESIS_TIME, 10)
    : 1710000000;
exports.MAINNET_GENESIS = {
    chainId: 5454,
    network: 'mainnet',
    genesisTime: MAINNET_GENESIS_TIME,
    validators: loadValidatorsFromEnv(),
    initialSupply: 100000000n * 10n ** 18n,
    maxSupply: 1000000000n * 10n ** 18n,
    emissionRate: 5,
    blockTime: 2,
    epochLength: 1000,
    astroDeadlineHeight: 20 * 365 * 24 * 60 * 60,
};
exports.TESTNET_GENESIS = {
    chainId: 1337,
    network: 'testnet',
    genesisTime: process.env.GENESIS_TIME
        ? parseInt(process.env.GENESIS_TIME, 10)
        : 1710000000,
    validators: loadValidatorsFromEnv(),
    initialSupply: 100000000n * 10n ** 18n,
    maxSupply: 1000000000n * 10n ** 18n,
    emissionRate: 5,
    blockTime: 1,
    epochLength: 500,
    astroDeadlineHeight: 20 * 365 * 24 * 60 * 60,
};
function getGenesisConfig(network = 'mainnet') {
    if (network === 'testnet')
        return exports.TESTNET_GENESIS;
    return exports.MAINNET_GENESIS;
}
function createGenesisBlock(config) {
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
function hashGenesisConfig(config) {
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
function validateGenesis(block, config) {
    if (block.height !== 0)
        return false;
    if (block.timestamp !== config.genesisTime)
        return false;
    if (block.previousBlockHash !== '0'.repeat(64))
        return false;
    if (block.configHash !== hashGenesisConfig(config))
        return false;
    return true;
}
