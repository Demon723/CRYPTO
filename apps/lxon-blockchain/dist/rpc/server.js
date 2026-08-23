"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcServer = void 0;
const http_1 = __importDefault(require("http"));
const MAX_REQUEST_BODY = 1024 * 1024; // 1MB max request body
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
const RATE_LIMIT_BLOCK_THRESHOLD = 200; // Block after 200 requests per minute
const BLOCK_TIME_MS = 2000; // 2 second blocks
class JsonRpcServer {
    pool;
    engine;
    tokenState;
    port;
    chainId;
    currentBlockHeight = 0n;
    server = null;
    rateLimits = new Map();
    startTime = Date.now();
    requestCount = 0;
    errorCount = 0;
    constructor(pool, engine, tokenState, port = 8545, chainId = 5454) {
        this.pool = pool;
        this.engine = engine;
        this.tokenState = tokenState;
        this.port = port;
        this.chainId = chainId;
    }
    start() {
        return new Promise((resolve, reject) => {
            this.server = http_1.default.createServer((req, res) => {
                // Health check endpoint (used by ALB)
                if (req.url === '/health') {
                    const health = {
                        status: 'ok',
                        chainId: '0x' + this.chainId.toString(16),
                        blockHeight: '0x' + this.currentBlockHeight.toString(16),
                        uptime: Date.now() - this.startTime,
                        peers: this.engine.validators.validators.size,
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(health));
                    return;
                }
                // Metrics endpoint for monitoring
                if (req.url === '/metrics') {
                    const tps = this.currentBlockHeight > 0n
                        ? Number(this.currentBlockHeight) / ((Date.now() - this.startTime) / 1000)
                        : 0;
                    const mempoolStats = this.pool.getStats();
                    const metrics = {
                        lxon_block_height: Number(this.currentBlockHeight),
                        lxon_tps: tps.toFixed(2),
                        lxon_uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
                        lxon_mempool_pending: mempoolStats.pending,
                        lxon_mempool_confirmed: mempoolStats.confirmed,
                        lxon_mempool_rejected: mempoolStats.rejected,
                        lxon_request_count: this.requestCount,
                        lxon_error_count: this.errorCount,
                        lxon_block_time_seconds: BLOCK_TIME_MS / 1000,
                        lxon_validator_count: this.engine.validators.validators.size,
                    };
                    res.writeHead(200, {
                        'Content-Type': 'text/plain; version=0.0.4',
                        'Cache-Control': 'no-store',
                    });
                    let output = '';
                    for (const [key, value] of Object.entries(metrics)) {
                        output += `${key} ${typeof value === 'string' ? `"${value}"` : value}\n`;
                    }
                    res.end(output);
                    return;
                }
                if (req.method === 'POST') {
                    // Check CORS
                    const origin = req.headers.origin;
                    const corsOrigins = (process.env.RPC_CORS_ORIGINS || 'http://localhost:3000').split(',');
                    if (origin && corsOrigins.includes(origin)) {
                        res.setHeader('Access-Control-Allow-Origin', origin);
                        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    }
                    // Rate limiting
                    const clientIp = req.socket.remoteAddress || 'unknown';
                    const now = Date.now();
                    const entry = this.rateLimits.get(clientIp);
                    if (entry) {
                        if (now > entry.resetTime) {
                            entry.requests = 0;
                            entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
                            entry.blocked = false;
                        }
                        if (entry.blocked) {
                            this.errorCount++;
                            res.writeHead(429, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                error: { code: -32429, message: 'Too Many Requests' },
                                id: null,
                            }));
                            return;
                        }
                        entry.requests++;
                        if (entry.requests > RATE_LIMIT_BLOCK_THRESHOLD) {
                            entry.blocked = true;
                        }
                    }
                    else {
                        this.rateLimits.set(clientIp, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW_MS, blocked: false });
                    }
                    // Request body size limit
                    let body = '';
                    let bodySize = 0;
                    req.on('data', (chunk) => {
                        bodySize += chunk.length;
                        if (bodySize > MAX_REQUEST_BODY) {
                            this.errorCount++;
                            res.writeHead(413, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                error: { code: -32000, message: 'Request body too large' },
                                id: null,
                            }));
                            req.destroy();
                        }
                        else {
                            body += chunk.toString();
                        }
                    });
                    req.on('end', () => {
                        this.requestCount++;
                        try {
                            const request = JSON.parse(body);
                            const response = this.handleRequest(request);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        }
                        catch (err) {
                            this.errorCount++;
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                error: { code: -32700, message: 'Parse error' },
                                id: null,
                            }));
                        }
                    });
                    return;
                }
                res.writeHead(405);
                res.end('Method Not Allowed');
            });
            this.server.listen(this.port, () => {
                console.log(`JSON-RPC server listening on port ${this.port}`);
                resolve();
            });
            this.server.on('error', reject);
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }
    setBlockHeight(height) {
        this.currentBlockHeight = height;
    }
    handleRequest(request) {
        const { method, params, id } = request;
        switch (method) {
            case 'eth_blockNumber':
                return { jsonrpc: '2.0', result: '0x' + this.currentBlockHeight.toString(16), id };
            case 'eth_getBalance': {
                const address = params && params[0] ? params[0] : '';
                const balance = this.tokenState.getBalance(address);
                return { jsonrpc: '2.0', result: '0x' + (balance || 0n).toString(16), id };
            }
            case 'eth_sendRawTransaction': {
                const [rawTx] = params || [];
                if (!rawTx || typeof rawTx !== 'string') {
                    return { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params: missing raw transaction' }, id };
                }
                // Validate raw transaction format
                const rawTxStr = rawTx;
                if (!rawTxStr.startsWith('0x') || rawTxStr.length < 4) {
                    return { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid raw transaction format' }, id };
                }
                const rawBytes = Buffer.from(rawTxStr.slice(2), 'hex');
                if (rawBytes.length === 0) {
                    return { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid raw transaction: empty data' }, id };
                }
                // Basic validation: transaction must have a minimum structure
                // In a full implementation, this would decode RLP, verify signature, etc.
                const accepted = this.pool.addTransaction({ read_keys: [] }, rawTxStr.slice(2, 42), 1000n);
                if (!accepted.accepted) {
                    return { jsonrpc: '2.0', error: { code: -32000, message: accepted.reason || 'Transaction rejected' }, id };
                }
                // Return a placeholder transaction hash
                const txHash = '0x' + Buffer.from(rawBytes).toString('hex').slice(0, 64).padEnd(64, '0');
                return { jsonrpc: '2.0', result: txHash, id };
            }
            case 'eth_getTransactionCount':
                return { jsonrpc: '2.0', result: '0x' + this.currentBlockHeight.toString(16), id };
            case 'eth_estimateGas':
                return { jsonrpc: '2.0', result: '0x5208', id };
            case 'eth_gasPrice':
                return { jsonrpc: '2.0', result: '0x64', id };
            case 'eth_chainId':
                return { jsonrpc: '2.0', result: '0x' + this.chainId.toString(16), id };
            case 'eth_accounts':
                return { jsonrpc: '2.0', result: Array.from(this.engine.validators.validators.keys()), id };
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
            case 'eth_getBlockByNumber':
                return { jsonrpc: '2.0', result: null, id };
            case 'net_version':
                return { jsonrpc: '2.0', result: this.chainId.toString(), id };
            case 'web3_clientVersion':
                return { jsonrpc: '2.0', result: 'LXON/v1.0.0', id };
            default:
                return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id };
        }
    }
}
exports.JsonRpcServer = JsonRpcServer;
