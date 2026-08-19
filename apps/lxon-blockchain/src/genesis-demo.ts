import { createGenesisBlock, validateGenesis, MAINNET_GENESIS, TESTNET_GENESIS } from './genesis';

const mainnetGenesis = createGenesisBlock(MAINNET_GENESIS);
const testnetGenesis = createGenesisBlock(TESTNET_GENESIS);

console.log('===== GENESIS BLOCK =====');
console.log(`Mainnet Genesis Height: ${mainnetGenesis.height}`);
console.log(`Mainnet Genesis Time: ${new Date(mainnetGenesis.timestamp * 1000).toISOString()}`);
console.log(`Mainnet Validators: ${mainnetGenesis.validatorSet.length}`);
console.log(`Mainnet Config Hash: ${mainnetGenesis.configHash}`);
console.log('');
console.log(`Testnet Genesis Height: ${testnetGenesis.height}`);
console.log(`Testnet Genesis Time: ${new Date(testnetGenesis.timestamp * 1000).toISOString()}`);
console.log(`Testnet Validators: ${testnetGenesis.validatorSet.length}`);
console.log(`Testnet Config Hash: ${testnetGenesis.configHash}`);
console.log('');
console.log(`Mainnet validation: ${validateGenesis(mainnetGenesis, MAINNET_GENESIS) ? 'VALID' : 'INVALID'}`);
console.log(`Testnet validation: ${validateGenesis(testnetGenesis, TESTNET_GENESIS) ? 'VALID' : 'INVALID'}`);
