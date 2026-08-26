import http from 'http';
import { TransactionPool } from '../mempool/tx-pool';
import { MonadBFTEngine } from '../consensus/monad-bft';
import { faucetRequest } from '../wallet/send';

export interface RPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id?: number | string;
}

export interface RPCResponse {
  jsonrpc: string;
  result?: any;
  error?: { code: number; message: string };
  id?: number | string;
}

export class JsonRpcServer {
  private pool: TransactionPool;
  private engine: MonadBFTEngine;
  private port: number;
  private server: http.Server | null = null;

  constructor(pool: TransactionPool, engine: MonadBFTEngine, port: number = 8545) {
    this.pool = pool;
    this.engine = engine;
    this.port = port;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const url = req.url || '/';

        if (req.method === 'GET' && (url === '/health' || url === '/healthz')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'HEALTHY', chainId: 723, blockNumber: 0 }));
          return;
        }

        if (req.method === 'POST' && url === '/faucet') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { address, amount } = JSON.parse(body);
              if (!address || typeof address !== 'string') {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Missing address' }));
                return;
              }
              const result = faucetRequest(this.pool, address, BigInt(amount || '1000000000000000000'));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && (url === '/' || url === '/rpc')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const request: RPCRequest = JSON.parse(body);
              const response = this.handleRequest(request);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
      });

      this.server.listen(this.port, () => {
        console.log(`JSON-RPC server listening on port ${this.port}`);
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  handleRequest(request: RPCRequest): RPCResponse {
    const { method, params, id } = request;

    switch (method) {
      case 'eth_blockNumber':
        return { jsonrpc: '2.0', result: '0x0', id };

      case 'eth_getBalance':
        return { jsonrpc: '2.0', result: '0x0', id };

      case 'eth_sendRawTransaction': {
        const [rawTx] = params;
        const accepted = this.pool.addTransaction({ read_keys: [] } as any, '0x'.padEnd(40, '0'), 1000n);
        if (!accepted.accepted) {
          return { jsonrpc: '2.0', error: { code: -32000, message: accepted.reason || 'Transaction rejected' }, id };
        }
        return { jsonrpc: '2.0', result: '0x' + '0'.repeat(64), id };
      }

      case 'eth_getTransactionCount':
        return { jsonrpc: '2.0', result: '0x0', id };

      case 'eth_estimateGas':
        return { jsonrpc: '2.0', result: '0x5208', id };

      case 'eth_gasPrice':
        return { jsonrpc: '2.0', result: '0x0', id };

      case 'eth_chainId':
        return { jsonrpc: '2.0', result: '0x1', id };

      case 'eth_accounts':
        return { jsonrpc: '2.0', result: [], id };

      case 'eth_getCode':
        return { jsonrpc: '2.0', result: '0x', id };

      case 'eth_call':
        return { jsonrpc: '2.0', result: '0x', id };

      case 'eth_sendTransaction':
        return { jsonrpc: '2.0', result: '0x' + '0'.repeat(64), id };

      case 'eth_getTransactionByHash':
        return { jsonrpc: '2.0', result: null, id };

      case 'eth_getTransactionReceipt':
        return { jsonrpc: '2.0', result: null, id };

      case 'eth_blockByNumber':
        return { jsonrpc: '2.0', result: null, id };

      case 'net_version':
        return { jsonrpc: '2.0', result: '1', id };

      case 'web3_clientVersion':
        return { jsonrpc: '2.0', result: 'LXON/v1.0.0', id };

      default:
        return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id };
    }
  }
}
