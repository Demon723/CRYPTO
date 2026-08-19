"use strict";
/**
 * Compact binary encoding for NX transactions
 *
 * Design goals:
 * - Minimal byte footprint for high-throughput networks
 * - Deterministic encoding for signature hashing
 * - Version-tolerant with forward-compatible extension tags
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeTransaction = encodeTransaction;
exports.decodeTransaction = decodeTransaction;
exports.encodeFeeParams = encodeFeeParams;
exports.decodeFeeParams = decodeFeeParams;
exports.hashTransaction = hashTransaction;
const MAX_UINT16 = 65535;
const MAX_UINT32 = 4294967295;
function encodeTransaction(tx) {
    const parts = [];
    // Header: type (1 byte) + flags (1 byte)
    parts.push(Buffer.from([tx.type, 0x00]));
    // From address (32 bytes - fixed size for native addresses)
    parts.push(Buffer.from(tx.from));
    // To address (32 bytes, or zeroed if null)
    const toBuf = tx.to ? Buffer.from(tx.to) : Buffer.alloc(32, 0xff);
    parts.push(toBuf);
    // Nonce (8 bytes, uint64 little-endian)
    parts.push(Buffer.alloc(8));
    parts[parts.length - 1].writeBigUInt64LE(tx.nonce);
    // Fee parameters
    parts.push(encodeFeeParams(tx.fee));
    // Timestamp (8 bytes, uint64 little-endian)
    parts.push(Buffer.alloc(8));
    parts[parts.length - 1].writeBigUInt64LE(tx.timestamp);
    // Payload length (2 bytes) + payload
    if (tx.payload.length > MAX_UINT16) {
        throw new Error('Payload too large');
    }
    parts.push(Buffer.alloc(2));
    parts[parts.length - 1].writeUInt16LE(tx.payload.length);
    parts.push(tx.payload);
    // Signature (64 bytes Ed25519, or 96 bytes Ed25519+recovery)
    if (tx.signature.length !== 64 && tx.signature.length !== 96) {
        throw new Error('Invalid signature length');
    }
    parts.push(tx.signature);
    return Buffer.concat(parts);
}
function decodeTransaction(data) {
    let offset = 0;
    const type = data.readUInt8(offset);
    offset += 1;
    const _flags = data.readUInt8(offset);
    offset += 1;
    const from = data.subarray(offset, offset + 32);
    offset += 32;
    const toRaw = data.subarray(offset, offset + 32);
    offset += 32;
    const to = toRaw.every(b => b === 0xff) ? null : toRaw;
    const nonce = data.readBigUInt64LE(offset);
    offset += 8;
    const fee = decodeFeeParams(data, offset);
    offset += 24;
    const timestamp = data.readBigUInt64LE(offset);
    offset += 8;
    const payloadLen = data.readUInt16LE(offset);
    offset += 2;
    const payload = data.subarray(offset, offset + payloadLen);
    offset += payloadLen;
    const signature = data.subarray(offset, offset + 64);
    offset += 64;
    return {
        type: type,
        from: new Uint8Array(from),
        to: to ? new Uint8Array(to) : null,
        nonce,
        fee,
        timestamp,
        payload: Buffer.from(payload),
        signature: Buffer.from(signature),
    };
}
function encodeFeeParams(fee) {
    const buf = Buffer.alloc(24);
    buf.writeBigUInt64LE(fee.baseFee, 0);
    buf.writeBigUInt64LE(fee.priorityFee, 8);
    buf.writeBigUInt64LE(fee.gasLimit, 16);
    return buf;
}
function decodeFeeParams(data, offset) {
    return {
        baseFee: data.readBigUInt64LE(offset),
        priorityFee: data.readBigUInt64LE(offset + 8),
        gasLimit: data.readBigUInt64LE(offset + 16),
        gasUsed: 0n,
        sizeBytes: data.length,
    };
}
function hashTransaction(tx) {
    const encoded = encodeTransaction(tx);
    // Simplified hash - in production use BLAKE2b or SHA3-256
    let hash = 0n;
    for (let i = 0; i < encoded.length; i++) {
        hash = (hash << 8n) + BigInt(encoded[i]);
        hash = hash & 0xffffffffffffffffffffffffffffffffn;
    }
    return Buffer.from(hash.toString(16).padStart(64, '0'), 'hex');
}
