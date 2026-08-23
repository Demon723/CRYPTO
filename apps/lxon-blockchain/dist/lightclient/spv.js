"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPVLightClient = exports.CompactFilterBuilder = exports.GolombRiceFilter = void 0;
exports.buildBasicFilter = buildBasicFilter;
exports.verifyFilterMatch = verifyFilterMatch;
const hash_1 = require("../crypto/hash");
class GolombRiceFilter {
    P;
    M;
    elements = [];
    constructor(P = 20, M = 784931) {
        this.P = P;
        this.M = M;
    }
    insert(element) {
        this.elements.push(element);
    }
    build() {
        const sorted = [...this.elements].sort((a, b) => a - b);
        const stream = [];
        let last = 0;
        for (const value of sorted) {
            const delta = value - last;
            const quotient = Math.floor(delta / this.M);
            const remainder = delta % this.M;
            stream.push(...Array(quotient).fill(1));
            stream.push(0);
            for (let i = this.P - 1; i >= 0; i--) {
                stream.push((remainder >> i) & 1);
            }
            last = value;
        }
        const byteLength = Math.ceil(stream.length / 8);
        const buffer = Buffer.alloc(byteLength);
        for (let i = 0; i < stream.length; i++) {
            if (stream[i]) {
                buffer[i >> 3] |= (1 << (7 - (i % 8)));
            }
        }
        return buffer;
    }
    static match(filter, P, M, value) {
        const reader = new GolombRiceReader(filter, P, M);
        let last = 0;
        while (!reader.eof) {
            const quotient = reader.readQuotient();
            const remainder = reader.readRemainder();
            const candidate = last + quotient * M + remainder;
            if (candidate === value)
                return true;
            if (candidate > value)
                return false;
            last = candidate;
        }
        return false;
    }
}
exports.GolombRiceFilter = GolombRiceFilter;
class GolombRiceReader {
    P;
    M;
    buffer;
    bitPos = 0;
    eof = false;
    constructor(buffer, P, M) {
        this.P = P;
        this.M = M;
        this.buffer = buffer;
    }
    readQuotient() {
        let quotient = 0;
        while (!this.eof) {
            if (this.readBit()) {
                quotient++;
            }
            else {
                break;
            }
        }
        return quotient;
    }
    readRemainder() {
        let remainder = 0;
        for (let i = 0; i < this.P; i++) {
            remainder = (remainder << 1) | (this.readBit() ? 1 : 0);
        }
        return remainder;
    }
    readBit() {
        if (this.bitPos >= this.buffer.length * 8) {
            this.eof = true;
            return false;
        }
        const byteIndex = this.bitPos >> 3;
        const bitIndex = 7 - (this.bitPos & 7);
        const bit = (this.buffer[byteIndex] >> bitIndex) & 1;
        this.bitPos++;
        return bit === 1;
    }
}
class CompactFilterBuilder {
    filter = new GolombRiceFilter(20, 784931);
    addOutput(outpoint) {
        const hash = (0, hash_1.hash160)(outpoint);
        const value = this.bytesToU64(hash);
        this.filter.insert(value);
    }
    addData(data) {
        const hash = (0, hash_1.hash160)(data);
        const value = this.bytesToU64(hash);
        this.filter.insert(value);
    }
    build() {
        return this.filter.build();
    }
    bytesToU64(data) {
        let value = 0;
        for (let i = 0; i < Math.min(8, data.length); i++) {
            value |= data[i] << (8 * i);
        }
        return value;
    }
}
exports.CompactFilterBuilder = CompactFilterBuilder;
class SPVLightClient {
    blockFilters = new Map();
    blockHeaders = new Map();
    peerFilterHashes = new Map();
    addBlock(blockHash, filter, header) {
        this.blockFilters.set(Buffer.from(blockHash).toString('hex'), {
            blockHash,
            filter,
        });
        this.blockHeaders.set(Buffer.from(blockHash).toString('hex'), header);
    }
    queryFilters(startHeight, endHeight) {
        const filterHashes = [];
        for (let height = startHeight; height <= endHeight; height++) {
            const filter = this.blockFilters.get(this.heightToHash(height));
            if (filter) {
                filterHashes.push(Buffer.from(filter.blockHash).toString('hex'));
            }
        }
        return filterHashes;
    }
    matchFilter(blockHash, key) {
        const filter = this.blockFilters.get(Buffer.from(blockHash).toString('hex'));
        if (!filter)
            return false;
        const hash = (0, hash_1.hash160)(key);
        const value = this.bytesToU64(hash);
        return GolombRiceFilter.match(filter.filter, 20, 784931, value);
    }
    getFilterHeader(blockHash) {
        return this.blockHeaders.get(Buffer.from(blockHash).toString('hex'));
    }
    heightToHash(height) {
        return Buffer.from((0, hash_1.sha256)(Buffer.from(height.toString()))).toString('hex');
    }
    bytesToU64(data) {
        let value = 0;
        for (let i = 0; i < Math.min(8, data.length); i++) {
            value |= data[i] << (8 * i);
        }
        return value;
    }
}
exports.SPVLightClient = SPVLightClient;
function buildBasicFilter(blockHash, prevFilter) {
    const builder = new CompactFilterBuilder();
    if (prevFilter) {
        builder.addData(prevFilter);
    }
    builder.addData(blockHash);
    return builder.build();
}
function verifyFilterMatch(filter, key) {
    const hash = (0, hash_1.hash160)(key);
    let value = 0;
    for (let i = 0; i < Math.min(8, hash.length); i++) {
        value |= hash[i] << (8 * i);
    }
    return GolombRiceFilter.match(filter, 20, 784931, value);
}
