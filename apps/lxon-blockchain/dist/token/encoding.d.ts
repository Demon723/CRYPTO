/**
 * Compact binary encoding for NX transactions
 *
 * Design goals:
 * - Minimal byte footprint for high-throughput networks
 * - Deterministic encoding for signature hashing
 * - Version-tolerant with forward-compatible extension tags
 */
import { TokenTx, FeeParams } from './protocol';
export declare function encodeTransaction(tx: TokenTx): Buffer;
export declare function decodeTransaction(data: Buffer): TokenTx;
export declare function encodeFeeParams(fee: FeeParams): Buffer;
export declare function decodeFeeParams(data: Buffer, offset: number): FeeParams;
export declare function hashTransaction(tx: TokenTx): Buffer;
