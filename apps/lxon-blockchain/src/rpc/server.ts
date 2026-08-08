import http from 'http';
import { TransactionPool } from '../mempool/tx-pool';
import { MonadBFTEngine } from '../consensus/monad-bft';

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
      this.server = http.createServer((req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('Method Not Allowed');
          return;
        }

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

  private handleRequest(request: RPCRequest): RPCResponse {
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

      case 'net_version':
        return { jsonrpc: '2.0', result: '1', id };

      case 'web3_clientVersion':
        return { jsonrpc: '2.0', result: 'LXON/v1.0.0', id };

      default:
        return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id };
    }
  }
}
