import { generateAstroWallet } from '../wallet/astro-wallet';
import { TransactionPool } from '../mempool/tx-pool';
export interface SendTxRequest {
    to: string;
    amount: bigint;
    fee?: bigint;
}
export interface SendTxResult {
    hash: string;
    sender: string;
    recipient: string;
    amount: string;
    fee: string;
    status: 'pending' | 'rejected';
    reason?: string;
}
export declare function createTransferTransaction(wallet: ReturnType<typeof generateAstroWallet>, request: SendTxRequest): any;
export declare function sendTransaction(pool: TransactionPool, wallet: ReturnType<typeof generateAstroWallet>, request: SendTxRequest): SendTxResult;
export declare function faucetRequest(pool: TransactionPool, address: string, amount?: bigint): SendTxResult;
