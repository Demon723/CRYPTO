"use strict";
/**
 * NX Token State Engine
 *
 * Implements native account state using Multi-Version Data Structures (MVDS)
 * for optimistic parallel execution, inspired by Block-STM and MonadDB patterns.
 *
 * Key innovations:
 * - Speculative state writes with incarnation tracking
 * - Async-native storage interface (io_uring pattern)
 * - Conflict detection without global locking
 * - Deterministic state root computation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeTokenState = void 0;
class NativeTokenState {
    accounts = new Map();
    stakes = new Map();
    proposals = new Map();
    timelocks = new Map();
    swaps = new Map();
    recoveries = new Map();
    nonces = new Map();
    MAX_INCARNATIONS = 16;
    // Async storage interface (MonadDB pattern)
    storageCallback;
    readCallback;
    constructor(storageCallbacks) {
        this.storageCallback = storageCallbacks?.write;
        this.readCallback = storageCallbacks?.read;
    }
    // ----- Account Operations -----
    getAccount(address, txIndex) {
        const key = this.addressKey(address);
        const entries = this.accounts.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeAccount(address, txIndex, incarnation, account) {
        const key = this.addressKey(address);
        this.upsert(this.accounts, key, txIndex, incarnation, account);
        this.nonces.set(key, account.nonce);
    }
    // ----- Stake Operations -----
    getStake(address, txIndex) {
        const key = this.stakeKey(address);
        const entries = this.stakes.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeStake(address, txIndex, incarnation, position) {
        const key = this.stakeKey(address);
        this.upsert(this.stakes, key, txIndex, incarnation, position);
    }
    // ----- Proposal Operations -----
    getProposal(id, txIndex) {
        const key = this.proposalKey(id);
        const entries = this.proposals.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeProposal(id, txIndex, incarnation, proposal) {
        const key = this.proposalKey(id);
        this.upsert(this.proposals, key, txIndex, incarnation, proposal);
    }
    // ----- TimeLock Operations -----
    getTimeLock(id, txIndex) {
        const key = this.timelockKey(id);
        const entries = this.timelocks.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeTimeLock(id, txIndex, incarnation, timelock) {
        const key = this.timelockKey(id);
        this.upsert(this.timelocks, key, txIndex, incarnation, timelock);
    }
    // ----- AtomicSwap Operations -----
    getSwap(id, txIndex) {
        const key = this.swapKey(id);
        const entries = this.swaps.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeSwap(id, txIndex, incarnation, swap) {
        const key = this.swapKey(id);
        this.upsert(this.swaps, key, txIndex, incarnation, swap);
    }
    // ----- Recovery Operations -----
    getRecovery(id, txIndex) {
        const key = this.recoveryKey(id);
        const entries = this.recoveries.get(key);
        if (!entries || entries.length === 0)
            return [null, null];
        let targetVal = null;
        let writerTx = null;
        for (const entry of entries) {
            if (entry.txIndex < txIndex) {
                targetVal = entry.value;
                writerTx = entry.txIndex;
            }
            else {
                break;
            }
        }
        return [targetVal, writerTx];
    }
    writeRecovery(id, txIndex, incarnation, recovery) {
        const key = this.recoveryKey(id);
        this.upsert(this.recoveries, key, txIndex, incarnation, recovery);
    }
    // ----- State Root & Persistence -----
    dumpState() {
        const state = {};
        for (const [key, entries] of this.accounts.entries()) {
            if (entries.length > 0) {
                const latest = entries[entries.length - 1];
                state[key] = Buffer.from(JSON.stringify(latest.value));
            }
        }
        return state;
    }
    async commitBatch(writes) {
        if (this.storageCallback) {
            await this.storageCallback(writes);
        }
    }
    async readBatch(keys) {
        if (this.readCallback) {
            return await this.readCallback(keys);
        }
        return new Map();
    }
    // ----- Conflict Detection (Block-STM style) -----
    detectConflict(txA, txB) {
        const writesA = new Set(txA.writes.map(w => w.key));
        const writesB = new Set(txB.writes.map(w => w.key));
        for (const key of writesA) {
            if (writesB.has(key))
                return true;
        }
        const readsA = new Set(txA.reads.map(r => r.key));
        const writesBSet = new Set(txB.writes.map(w => w.key));
        for (const key of readsA) {
            if (writesBSet.has(key))
                return true;
        }
        return false;
    }
    // ----- Utility -----
    upsert(map, key, txIndex, incarnation, value) {
        if (!map.has(key)) {
            map.set(key, []);
        }
        const entries = map.get(key);
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].txIndex === txIndex) {
                entries[i] = { txIndex, incarnation, value };
                return;
            }
        }
        entries.push({ txIndex, incarnation, value });
        entries.sort((a, b) => a.txIndex - b.txIndex || a.incarnation - b.incarnation);
    }
    addressKey(address) {
        return `acc:${Buffer.from(address).toString('hex')}`;
    }
    stakeKey(address) {
        return `stake:${Buffer.from(address).toString('hex')}`;
    }
    proposalKey(id) {
        return `prop:${Buffer.from(id).toString('hex')}`;
    }
    timelockKey(id) {
        return `tl:${Buffer.from(id).toString('hex')}`;
    }
    swapKey(id) {
        return `swap:${Buffer.from(id).toString('hex')}`;
    }
    recoveryKey(id) {
        return `rec:${Buffer.from(id).toString('hex')}`;
    }
}
exports.NativeTokenState = NativeTokenState;
