"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSTMEngine = exports.MultiVersionDataStructure = exports.VersionedValue = void 0;
class VersionedValue {
    txIndex;
    incarnation;
    value;
    constructor(txIndex, incarnation, value) {
        this.txIndex = txIndex;
        this.incarnation = incarnation;
        this.value = value;
    }
}
exports.VersionedValue = VersionedValue;
class MultiVersionDataStructure {
    data = new Map();
    read(key, txIndex) {
        const entries = this.data.get(key);
        if (!entries || entries.length === 0) {
            return [null, null];
        }
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
    write(key, txIndex, incarnation, value) {
        if (!this.data.has(key)) {
            this.data.set(key, []);
        }
        const entries = this.data.get(key);
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].txIndex === txIndex) {
                entries[i] = new VersionedValue(txIndex, incarnation, value);
                return;
            }
        }
        entries.push(new VersionedValue(txIndex, incarnation, value));
        entries.sort((a, b) => a.txIndex - b.txIndex);
    }
    remove_writes(txIndex, keys) {
        for (const key of keys) {
            const entries = this.data.get(key);
            if (entries) {
                this.data.set(key, entries.filter(e => e.txIndex !== txIndex));
            }
        }
    }
    dumpState() {
        const state = {};
        for (const [key, entries] of this.data.entries()) {
            if (entries.length > 0) {
                state[key] = entries[entries.length - 1].value;
            }
        }
        return state;
    }
}
exports.MultiVersionDataStructure = MultiVersionDataStructure;
class BlockSTMEngine {
    txs;
    numTxs;
    mvds = new MultiVersionDataStructure();
    incarnations;
    readSets;
    writeSets;
    dag = new Map();
    mevResistant = false;
    pendingDAG = [];
    executionOrder = [];
    executionIdx = 0;
    validationIdx = 0;
    constructor(txs) {
        this.txs = txs;
        this.numTxs = txs.length;
        this.incarnations = new Array(this.numTxs).fill(0);
        this.readSets = Array.from({ length: this.numTxs }, () => ({}));
        this.writeSets = Array.from({ length: this.numTxs }, () => new Set());
        this.validationIdx = this.numTxs;
    }
    execute_transaction(txIndex, incarnation) {
        const localReadSet = {};
        const dynamicReadValues = {};
        const tx = this.txs[txIndex];
        for (const readKey of tx.read_keys) {
            const [val, writer] = this.mvds.read(readKey, txIndex);
            localReadSet[readKey] = writer;
            dynamicReadValues[readKey] = val;
        }
        let localWriteSet = {};
        if (tx.logic) {
            localWriteSet = tx.logic(dynamicReadValues);
        }
        else if (tx.write_dict) {
            localWriteSet = tx.write_dict;
        }
        const prevWriteKeys = this.writeSets[txIndex];
        const newWriteKeys = new Set(Object.keys(localWriteSet));
        this.readSets[txIndex] = localReadSet;
        this.writeSets[txIndex] = newWriteKeys;
        for (const [wKey, wVal] of Object.entries(localWriteSet)) {
            this.mvds.write(wKey, txIndex, incarnation, wVal);
        }
        const removedKeys = new Set();
        for (const key of prevWriteKeys) {
            if (!newWriteKeys.has(key)) {
                removedKeys.add(key);
            }
        }
        if (removedKeys.size > 0) {
            this.mvds.remove_writes(txIndex, removedKeys);
            return true;
        }
        return false;
    }
    validate_transaction(txIndex) {
        const recordedReads = this.readSets[txIndex];
        for (const [key, expectedWriter] of Object.entries(recordedReads)) {
            const [, currentWriter] = this.mvds.read(key, txIndex);
            if (currentWriter !== expectedWriter) {
                return false;
            }
        }
        return true;
    }
    add_to_dag(vertex) {
        this.dag.set(vertex.hash, vertex);
        this.pendingDAG.push(vertex);
    }
    topological_sort() {
        const sorted = [];
        const visited = new Set();
        const temp = new Set();
        const visit = (hash) => {
            if (temp.has(hash))
                return false;
            if (visited.has(hash))
                return true;
            temp.add(hash);
            const vertex = this.dag.get(hash);
            if (vertex) {
                for (const parent of vertex.parents) {
                    if (!visit(parent))
                        return false;
                }
            }
            temp.delete(hash);
            visited.add(hash);
            sorted.push(hash);
            return true;
        };
        for (const hash of this.dag.keys()) {
            if (!visited.has(hash)) {
                visit(hash);
            }
        }
        return sorted;
    }
    detect_mev_conflict(txIndex) {
        if (!this.mevResistant)
            return false;
        const tx = this.txs[txIndex];
        const writeKeys = Object.keys(tx.write_dict || {});
        for (const key of writeKeys) {
            for (const [otherHash, otherVertex] of this.dag.entries()) {
                if (otherVertex.transaction.read_keys.includes(key) ||
                    Object.keys(otherVertex.transaction.write_dict || {}).includes(key)) {
                    const otherTxIndex = parseInt(otherHash.slice(0, 8), 16) % this.numTxs;
                    if (otherTxIndex !== txIndex && otherTxIndex < txIndex) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    async process_block(numThreads) {
        const workerPromises = [];
        const workerLoop = async () => {
            loop: while (true) {
                let txToExec = null;
                let txToVal = null;
                synchronizedBlock: {
                    if (this.executionIdx < this.numTxs) {
                        txToExec = this.executionIdx;
                        this.executionIdx += 1;
                    }
                    else if (this.validationIdx < this.numTxs) {
                        txToVal = this.validationIdx;
                        this.validationIdx += 1;
                    }
                    else {
                        break loop;
                    }
                }
                if (txToExec !== null) {
                    const inc = this.incarnations[txToExec];
                    this.execute_transaction(txToExec, inc);
                    if (this.mevResistant) {
                        this.detect_mev_conflict(txToExec);
                    }
                    synchronizedBlock: {
                        this.validationIdx = Math.min(this.validationIdx, txToExec);
                    }
                }
                else if (txToVal !== null) {
                    const isValid = this.validate_transaction(txToVal);
                    if (!isValid) {
                        synchronizedBlock: {
                            this.incarnations[txToVal] += 1;
                            this.mvds.remove_writes(txToVal, this.writeSets[txToVal]);
                            this.writeSets[txToVal].clear();
                            this.executionIdx = Math.min(this.executionIdx, txToVal);
                            this.validationIdx = Math.min(this.validationIdx, txToVal + 1);
                        }
                    }
                }
                await new Promise(resolve => setImmediate(resolve));
            }
        };
        for (let i = 0; i < numThreads; i++) {
            workerPromises.push(workerLoop());
        }
        await Promise.all(workerPromises);
    }
    async process_block_deferred(numThreads) {
        const executionOrder = [];
        const orderingPhase = async () => {
            const sorted = this.topological_sort();
            for (const hash of sorted) {
                const vertex = this.dag.get(hash);
                if (vertex) {
                    executionOrder.push(hash);
                }
            }
        };
        await orderingPhase();
        const workerPromises = [];
        const workerLoop = async () => {
            loop: while (true) {
                let txToExec = null;
                let txToVal = null;
                synchronizedBlock: {
                    if (this.executionIdx < this.numTxs) {
                        txToExec = this.executionIdx;
                        this.executionIdx += 1;
                    }
                    else if (this.validationIdx < this.numTxs) {
                        txToVal = this.validationIdx;
                        this.validationIdx += 1;
                    }
                    else {
                        break loop;
                    }
                }
                if (txToExec !== null) {
                    const inc = this.incarnations[txToExec];
                    this.execute_transaction(txToExec, inc);
                    if (this.mevResistant) {
                        this.detect_mev_conflict(txToExec);
                    }
                    synchronizedBlock: {
                        this.validationIdx = Math.min(this.validationIdx, txToExec);
                    }
                }
                else if (txToVal !== null) {
                    const isValid = this.validate_transaction(txToVal);
                    if (!isValid) {
                        synchronizedBlock: {
                            this.incarnations[txToVal] += 1;
                            this.mvds.remove_writes(txToVal, this.writeSets[txToVal]);
                            this.writeSets[txToVal].clear();
                            this.executionIdx = Math.min(this.executionIdx, txToVal);
                            this.validationIdx = Math.min(this.validationIdx, txToVal + 1);
                        }
                    }
                }
                await new Promise(resolve => setImmediate(resolve));
            }
        };
        for (let i = 0; i < numThreads; i++) {
            workerPromises.push(workerLoop());
        }
        await Promise.all(workerPromises);
        return {
            executionOrder,
            finalState: this.mvds.dumpState(),
        };
    }
}
exports.BlockSTMEngine = BlockSTMEngine;
