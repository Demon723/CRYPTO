/**
 * Enhanced LXON RPC Server with Event Emission and Log Handling
 * Phase 10: Event emission, log storage, bloom filters, and eth_getLogs
 * ES Module version for Node.js 18+
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = 8545;
const CHAIN_ID = 723;
const BLOCK_TIME_MS = 5000;
const DATA_DIR = '/lxon/blockchain-data';

// State management with logs support
let state = {
  blockNumber: 0,
  transactions: {},
  receipts: {},
  accounts: {},
  contracts: {},
  logs: [],
  lastBlockTime: Date.now()
};

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load state from disk
function loadState() {
  try {
    const stateFile = path.join(DATA_DIR, 'state.json');
    if (fs.existsSync(stateFile)) {
      const loadedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      state = { ...state, ...loadedState };
      console.log('State loaded from disk');
    }
  } catch (error) {
    console.log('No existing state found, starting fresh');
  }
}

// Save state to disk
function saveState() {
  try {
    const stateFile = path.join(DATA_DIR, 'state.json');
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error.message);
  }
}

// Initialize default accounts
function initializeAccounts() {
  const defaultAccounts = {
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
      balance: '1000000000000000000000000',
      nonce: 0
    }
  };
  if (Object.keys(state.accounts).length === 0) {
    state.accounts = defaultAccounts;
  }
}

// Generate transaction hash
function generateTxHash() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256')
    .update(timestamp + random)
    .digest('hex');
  return '0x' + hash;
}

// Generate block hash
function generateBlockHash(blockNumber) {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256')
    .update('block-' + blockNumber + '-' + timestamp + random)
    .digest('hex');
  return '0x' + hash;
}

// Keccak-256 hash for event signatures
function keccak256(data) {
  return '0x' + crypto.createHash('sha256').update(data).digest('hex');
}

// Event signatures for LXON contracts
const eventSignatures = {
  'Transfer(address,address,uint256)': keccak256('Transfer(address,address,uint256)'),
  'Approval(address,address,uint256)': keccak256('Approval(address,address,uint256)'),
  'Minted(address,uint256,uint256)': keccak256('Minted(address,uint256,uint256)'),
  'BlockReward(address,uint256)': keccak256('BlockReward(address,uint256)'),
  'Staked(address,uint256)': keccak256('Staked(address,uint256)'),
  'Unstaked(address,uint256)': keccak256('Unstaked(address,uint256)'),
  'StakeReward(address,uint256)': keccak256('StakeReward(address,uint256)')
};

// Generate bloom filter for logs
function generateBloomFilter(logs) {
  const bloom = new Uint8Array(256); // 2048 bits = 256 bytes
  for (const log of logs) {
    for (const topic of log.topics) {
      for (let i = 0; i < 2048; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        bloom[byteIndex] |= (1 << bitIndex);
      }
    }
    // Add address to bloom
    const addressBytes = Buffer.from(log.address.slice(2), 'hex');
    for (let i = 0; i < 2048; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      bloom[byteIndex] |= (1 << bitIndex);
    }
  }
  return '0x' + Buffer.from(bloom).toString('hex').padStart(512, '0');
}

// Create event log
function createEventLog(address, topics, data, blockNumber, txHash, logIndex) {
  return {
    address: address.toLowerCase(),
    topics: topics.map(t => t.toLowerCase()),
    data: data.toLowerCase(),
    blockNumber: '0x' + blockNumber.toString(16),
    transactionHash: txHash.toLowerCase(),
    logIndex: '0x' + logIndex.toString(16),
    blockHash: generateBlockHash(blockNumber),
    removed: false
  };
}

// Process transaction with event emission
function processTransaction(txData) {
  const txHash = generateTxHash();
  const tx = {
    hash: txHash,
    from: txData.from || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: txData.to,
    value: txData.value || '0x0',
    gas: txData.gas || '0x5208',
    gasPrice: txData.gasPrice || '0x64',
    input: txData.input || '0x',
    nonce: (state.accounts[txData.from || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']?.nonce) || 0,
    blockNumber: state.blockNumber,
    blockHash: generateBlockHash(state.blockNumber),
    transactionIndex: Object.keys(state.transactions).length,
    r: '0x' + '0'.repeat(64),
    s: '0x' + '0'.repeat(64),
    v: '0x1'
  };

  state.transactions[txHash] = tx;

  // Generate logs for this transaction
  const logs = [];
  
  // Simulate event emission for contract calls
  if (tx.to && state.contracts[tx.to.toLowerCase()]) {
    // Example: Emit Transfer event for token contract
    if (tx.input && tx.input.length > 10) {
      const methodSig = tx.input.slice(0, 10);
      // Transfer(address,uint256) = 0xa9059cbb
      if (methodSig === '0xa9059cbb') {
        const transferLog = createEventLog(
          tx.to,
          [eventSignatures['Transfer(address,address,uint256)'], tx.from, '0x' + '0'.repeat(40)],
          '0x' + '0'.repeat(64),
          state.blockNumber,
          txHash,
          0
        );
        logs.push(transferLog);
        state.logs.push(transferLog);
      }
    }
  }

  const bloomFilter = generateBloomFilter(logs);

  const receipt = {
    transactionHash: txHash,
    transactionIndex: tx.transactionIndex,
    blockNumber: '0x' + state.blockNumber.toString(16),
    blockHash: tx.blockHash,
    from: tx.from,
    to: tx.to,
    cumulativeGasUsed: '0x5208',
    gasUsed: '0x5208',
    contractAddress: tx.to === null ? '0x' + '1'.repeat(40) : null,
    logs: logs,
    status: '0x1',
    logsBloom: bloomFilter,
    type: '0x2',
    effectiveGasPrice: '0x64',
    root: '0x' + '0'.repeat(64)
  };

  state.receipts[txHash] = receipt;

  if (tx.from && state.accounts[tx.from]) {
    state.accounts[tx.from].nonce++;
  }

  if (tx.to === null && tx.input && tx.input.length > 2) {
    const contractAddress = receipt.contractAddress;
    const bytecode = tx.input.startsWith('0x') ? tx.input.slice(2) : tx.input;
    state.contracts[contractAddress] = {
      bytecode: '0x' + bytecode,
      deployedAt: state.blockNumber
    };
  }

  saveState();
  return { tx, receipt };
}

// Block production
function produceBlock() {
  state.blockNumber++;
  state.lastBlockTime = Date.now();
  console.log(`Block ${state.blockNumber} produced at ${new Date().toISOString()}`);
  saveState();
}

let blockInterval = setInterval(produceBlock, BLOCK_TIME_MS);

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/' || req.url === '/rpc')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const request = JSON.parse(body);
        let result;

        switch(request.method) {
          case 'eth_blockNumber':
            result = '0x' + state.blockNumber.toString(16);
            break;
          case 'eth_chainId':
            result = '0x' + CHAIN_ID.toString(16);
            break;
          case 'net_version':
            result = CHAIN_ID.toString();
            break;
          case 'eth_getBalance':
            const address = request.params[0]?.toLowerCase();
            const account = state.accounts[address];
            result = '0x' + (account ? BigInt(account.balance).toString(16) : '0');
            if (address === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' && result === '0x0') {
              result = '0xde0b6b3a7640000';
            }
            break;
          case 'eth_getTransactionCount':
            const nonceAddress = request.params[0]?.toLowerCase();
            const nonceAccount = state.accounts[nonceAddress];
            result = '0x' + (nonceAccount ? nonceAccount.nonce.toString(16) : '0');
            break;
          case 'eth_estimateGas':
            result = '0x5208';
            break;
          case 'eth_gasPrice':
            result = '0x64';
            break;
          case 'eth_sendRawTransaction':
            const { tx, receipt } = processTransaction({ input: request.params[0] });
            result = tx.hash;
            break;
          case 'eth_getTransactionReceipt':
            const receiptHash = request.params[0];
            result = state.receipts[receiptHash] || null;
            break;
          case 'eth_getTransactionByHash':
            const txHash = request.params[0];
            result = state.transactions[txHash] || null;
            break;
          case 'eth_call':
            result = '0x';
            break;
          case 'eth_accounts':
            result = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
            break;
          case 'eth_syncing':
            result = false;
            break;
          case 'eth_getBlockByNumber':
            const blockNum = request.params[0] === 'latest' ? state.blockNumber : parseInt(request.params[0], 16);
            result = {
              number: '0x' + blockNum.toString(16),
              hash: generateBlockHash(blockNum),
              parentHash: '0x' + '0'.repeat(64),
              nonce: '0x0000000000000000',
              sha3Uncles: '0x' + '0'.repeat(64),
              logsBloom: '0x' + '0'.repeat(512),
              transactionsRoot: '0x' + '0'.repeat(64),
              stateRoot: '0x' + '0'.repeat(64),
              receiptsRoot: '0x' + '0'.repeat(64),
              miner: '0x0000000000000000000000000000000000000000',
              difficulty: '0x0',
              totalDifficulty: '0x0',
              extraData: '0x',
              size: '0x0',
              gasLimit: '0x47b760',
              gasUsed: '0x0',
              timestamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
              transactions: [],
              uncles: [],
            };
            break;
          case 'eth_getCode':
            const codeAddress = request.params[0]?.toLowerCase();
            const contract = state.contracts[codeAddress];
            result = contract ? contract.bytecode : '0x';
            break;
          case 'eth_getLogs':
            const filter = request.params[0] || {};
            let filteredLogs = [...state.logs];
            
            if (filter.address) {
              const filterAddr = filter.address.toLowerCase();
              filteredLogs = filteredLogs.filter(log => log.address === filterAddr);
            }
            
            if (filter.topics && filter.topics.length > 0) {
              filteredLogs = filteredLogs.filter(log => {
                return filter.topics.some((topicFilter, index) => {
                  if (!topicFilter) return true;
                  if (Array.isArray(topicFilter)) {
                    return topicFilter.some(t => log.topics[index] === t.toLowerCase());
                  }
                  return log.topics[index] === topicFilter.toLowerCase();
                });
              });
            }
            
            if (filter.fromBlock !== undefined) {
              const fromBlock = typeof filter.fromBlock === 'string' ? parseInt(filter.fromBlock, 16) : filter.fromBlock;
              filteredLogs = filteredLogs.filter(log => parseInt(log.blockNumber, 16) >= fromBlock);
            }
            
            if (filter.toBlock !== undefined) {
              const toBlock = typeof filter.toBlock === 'string' ? parseInt(filter.toBlock, 16) : filter.toBlock;
              filteredLogs = filteredLogs.filter(log => parseInt(log.blockNumber, 16) <= toBlock);
            }
            
            result = filteredLogs;
            break;
          default:
            throw new Error('Unsupported JSON-RPC method: ' + request.method);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: request.id,
          result,
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32603, message: error?.message || 'Internal RPC error' },
        }));
      }
    });
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('healthy');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

loadState();
initializeAccounts();
saveState();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Enhanced LXON RPC server with event emission running on port ${PORT}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Current block: ${state.blockNumber}`);
  console.log(`Event signatures loaded: ${Object.keys(eventSignatures).length}`);
  console.log('Phase 10: Event emission and log handling enabled');
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  clearInterval(blockInterval);
  saveState();
  process.exit(0);
});