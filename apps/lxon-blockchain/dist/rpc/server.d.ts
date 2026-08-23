import { TransactionPool } from '../mempool/tx-pool';
import { MonadBFTEngine } from '../consensus/monad-bft';
import { NativeTokenState } from '../token';
export interface RPCRequest {
    jsonrpc: string;
    method: string;
    params: any[];
    id?: number | string;
}
export interface RPCResponse {
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
    };
    id?: number | string;
}
export declare class JsonRpcServer {
    private pool;
    private engine;
    private tokenState;
    private port;
    private chainId;
    private currentBlockHeight;
    private server;
    private rateLimits;
    private startTime;
    private requestCount;
    private errorCount;
    constructor(pool: TransactionPool, engine: MonadBFTEngine, tokenState: NativeTokenState, port?: number, chainId?: number);
    start(): Promise<void>;
    stop(): void;
    setBlockHeight(height: bigint): void;
    handleRequest(request: RPCRequest): RPCResponse;
}
