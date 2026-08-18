/**
 * Simplified LXON RPC Server for Contract Deployment
 * Handles only the essential RPC methods needed for Hardhat deployment
 */

const http = require('http');

const PORT = 8545;
const CHAIN_ID = 723;

let blockNumber = 0;
let transactions = {};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const request = JSON.parse(body);
        let result;
        
        switch(request.method) {
          case 'eth_blockNumber':
            result = '0x' + blockNumber.toString(16);
            break;
          case 'eth_chainId':
            result = '0x' + CHAIN_ID.toString(16);
            break;
          case 'net_version':
            result = CHAIN_ID.toString();
            break;
          case 'eth_getBalance':
            // Return a large balance for the deployer account
            result = '0x' + (1000000000000000000000000n).toString(16);
            break;
          case 'eth_getTransactionCount':
            result = '0x0';
            break;
          case 'eth_estimateGas':
            result = '0x5208'; // 21000 in hex
            break;
          case 'eth_gasPrice':
            result = '0x64'; // 100 gwei in hex
            break;
          case 'eth_sendRawTransaction':
            const txHash = '0x' + Buffer.from(Date.now().toString()).toString('hex').padEnd(64, '0');
            transactions[txHash] = { from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' };
            result = txHash;
            break;
          case 'eth_getTransactionReceipt':
            const receipt = {
              transactionHash: request.params[0] || '0x' + '0'.repeat(64),
              transactionIndex: '0x0',
              blockNumber: '0x' + blockNumber.toString(16),
              blockHash: '0x' + Buffer.from('block-' + blockNumber).toString('hex').padEnd(64, '0'),
              from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              to: null,
              cumulativeGasUsed: '0x5208',
              gasUsed: '0x5208',
              contractAddress: '0x' + '1'.repeat(40),
              logs: [],
              status: '0x1',
              logsBloom: '0x' + '0'.repeat(512),
              type: '0x2',
              effectiveGasPrice: '0x64',
              root: '0x' + '0'.repeat(64),
              r: '0x' + '0'.repeat(64),
              s: '0x' + '0'.repeat(64),
              v: '0x1',
            };
            result = receipt;
            break;
          case 'eth_getTransactionByHash':
            result = {
              hash: request.params[0] || '0x' + '0'.repeat(64),
              from: '0x0000000000000000000000000000000000000000',
              to: null,
              value: '0x0',
              gas: '0x5208',
              gasPrice: '0x64',
              input: '0x',
              nonce: '0x0',
              blockHash: '0x' + '0'.repeat(64),
              blockNumber: '0x1',
              transactionIndex: '0x0',
              r: '0x' + '0'.repeat(64),
              s: '0x' + '0'.repeat(64),
              v: '0x1',
            };
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
            const blockNum = request.params[0] === 'latest' ? blockNumber : parseInt(request.params[0], 16);
            result = {
              number: '0x' + blockNum.toString(16),
              hash: '0x' + Buffer.from('block-' + blockNum).toString('hex').padEnd(64, '0'),
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
            result = '0x';
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
          error: { code: -32603, message: (error && error.message) || 'Internal RPC error' },
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simplified LXON RPC server running on port ${PORT}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log('This is a minimal RPC server for contract deployment');
});