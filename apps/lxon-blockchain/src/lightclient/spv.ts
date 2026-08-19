import { sha256, hash160 } from '../crypto/hash';

export interface CompactFilter {
  blockHash: Uint8Array;
  filter: Uint8Array;
}

export interface GolombRiceSet {
  P: number;
  M: number;
  elements: number[];
}

export class GolombRiceFilter {
  private P: number;
  private M: number;
  private elements: number[] = [];

  constructor(P: number = 20, M: number = 784931) {
    this.P = P;
    this.M = M;
  }

  insert(element: number): void {
    this.elements.push(element);
  }

  build(): Uint8Array {
    const sorted = [...this.elements].sort((a, b) => a - b);
    const stream: number[] = [];
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

  static match(filter: Uint8Array, P: number, M: number, value: number): boolean {
    const reader = new GolombRiceReader(filter, P, M);
    let last = 0;
    while (!reader.eof) {
      const quotient = reader.readQuotient();
      const remainder = reader.readRemainder();
      const candidate = last + quotient * M + remainder;
      if (candidate === value) return true;
      if (candidate > value) return false;
      last = candidate;
    }
    return false;
  }
}

class GolombRiceReader {
  private buffer: Uint8Array;
  private bitPos: number = 0;
  public eof: boolean = false;

  constructor(buffer: Uint8Array, private P: number, private M: number) {
    this.buffer = buffer;
  }

  readQuotient(): number {
    let quotient = 0;
    while (!this.eof) {
      if (this.readBit()) {
        quotient++;
      } else {
        break;
      }
    }
    return quotient;
  }

  readRemainder(): number {
    let remainder = 0;
    for (let i = 0; i < this.P; i++) {
      remainder = (remainder << 1) | (this.readBit() ? 1 : 0);
    }
    return remainder;
  }

  private readBit(): boolean {
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

export class CompactFilterBuilder {
  private filter = new GolombRiceFilter(20, 784931);

  addOutput(outpoint: Uint8Array): void {
    const hash = hash160(outpoint);
    const value = this.bytesToU64(hash);
    this.filter.insert(value);
  }

  addData(data: Uint8Array): void {
    const hash = hash160(data);
    const value = this.bytesToU64(hash);
    this.filter.insert(value);
  }

  build(): Uint8Array {
    return this.filter.build();
  }

  private bytesToU64(data: Uint8Array): number {
    let value = 0;
    for (let i = 0; i < Math.min(8, data.length); i++) {
      value |= data[i] << (8 * i);
    }
    return value;
  }
}

export class SPVLightClient {
  private blockFilters: Map<string, CompactFilter> = new Map();
  private blockHeaders: Map<string, Uint8Array> = new Map();
  private peerFilterHashes: Map<string, Uint8Array[]> = new Map();

  addBlock(blockHash: Uint8Array, filter: Uint8Array, header: Uint8Array): void {
    this.blockFilters.set(Buffer.from(blockHash).toString('hex'), {
      blockHash,
      filter,
    });
    this.blockHeaders.set(Buffer.from(blockHash).toString('hex'), header);
  }

  queryFilters(startHeight: number, endHeight: number): string[] {
    const filterHashes: string[] = [];
    for (let height = startHeight; height <= endHeight; height++) {
      const filter = this.blockFilters.get(this.heightToHash(height));
      if (filter) {
        filterHashes.push(Buffer.from(filter.blockHash).toString('hex'));
      }
    }
    return filterHashes;
  }

  matchFilter(blockHash: Uint8Array, key: Uint8Array): boolean {
    const filter = this.blockFilters.get(Buffer.from(blockHash).toString('hex'));
    if (!filter) return false;
    const hash = hash160(key);
    const value = this.bytesToU64(hash);
    return GolombRiceFilter.match(filter.filter, 20, 784931, value);
  }

  getFilterHeader(blockHash: Uint8Array): Uint8Array | undefined {
    return this.blockHeaders.get(Buffer.from(blockHash).toString('hex'));
  }

  private heightToHash(height: number): string {
    return Buffer.from(sha256(Buffer.from(height.toString()))).toString('hex');
  }

  private bytesToU64(data: Uint8Array): number {
    let value = 0;
    for (let i = 0; i < Math.min(8, data.length); i++) {
      value |= data[i] << (8 * i);
    }
    return value;
  }
}

export function buildBasicFilter(blockHash: Uint8Array, prevFilter: Uint8Array | null): Uint8Array {
  const builder = new CompactFilterBuilder();
  if (prevFilter) {
    builder.addData(prevFilter);
  }
  builder.addData(blockHash);
  return builder.build();
}

export function verifyFilterMatch(filter: Uint8Array, key: Uint8Array): boolean {
  const hash = hash160(key);
  let value = 0;
  for (let i = 0; i < Math.min(8, hash.length); i++) {
    value |= hash[i] << (8 * i);
  }
  return GolombRiceFilter.match(filter, 20, 784931, value);
}
