"use strict";
/**
 * NX Token State Transition Engine
 *
 * NON-PREDICTABLE PRICING MODEL
 *
 * Key innovations:
 * 1. Dynamic block rewards - no fixed halving, uses entropy + network state
 * 2. Chaotic fee adjustment - base fee varies with congestion, time, and entropy
 * 3. Variable staking APY - inversely proportional to stake ratio
 * 4. Supply-responsive emission - adjusts to maintain target velocity
 * 5. All values deterministic but non-predictable without full state
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenEngine = void 0;
const protocol_1 = require("./protocol");
const encoding_1 = require("./encoding");
function serializeForState(obj) {
    return Buffer.from(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }));
}
class TokenEngine {
    state;
    blockNumber = 0n;
    totalStaked = 0n;
    treasury = protocol_1.TOKEN_CONSTANTS.GENESIS_SUPPLY;
    totalTransactions = 0n;
    totalFeesBurned = 0n;
    lastBlockTimestamp = 0n;
    blockIntervals = [];
    entropyWindow = [];
    constructor(state) {
        this.state = state;
        this.lastBlockTimestamp = BigInt(Date.now() * 1000);
        this.initializeGenesis();
    }
    newBlock(prevBlockHash) {
        this.blockNumber++;
        if (prevBlockHash) {
            this.captureEntropy(prevBlockHash);
        }
        this.distributeBlockRewards();
        this.updateNetworkMetrics();
    }
    getBlockNumber() {
        return this.blockNumber;
    }
    executeTransaction(tx, txIndex) {
        const ctx = {
            txIndex,
            reads: [],
            writes: [],
            gasUsed: 0n,
            success: false,
        };
        if (!this.verifySignature(tx)) {
            return { ...ctx, success: false, error: 'Invalid signature' };
        }
        const [sender, senderWriter] = this.state.getAccount(tx.from, txIndex);
        if (!sender) {
            return { ...ctx, success: false, error: 'Sender account not found' };
        }
        ctx.reads.push({ key: this.accountKey(tx.from), txIndex, version: senderWriter });
        if (sender.nonce !== tx.nonce) {
            return { ...ctx, success: false, error: 'Invalid nonce' };
        }
        if ((sender.flags & protocol_1.AccountFlag.FROZEN) !== 0) {
            return { ...ctx, success: false, error: 'Account frozen' };
        }
        const fee = this.calculateDynamicFee(tx);
        if (sender.balance < fee) {
            return { ...ctx, success: false, error: 'Insufficient balance for fee' };
        }
        let result;
        switch (tx.type) {
            case protocol_1.TokenTxType.TRANSFER:
                result = this.executeTransfer(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.STAKE:
                result = this.executeStake(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.UNSTAKE:
                result = this.executeUnstake(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.BURN:
                result = this.executeBurn(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.GOVERNANCE_VOTE:
                result = this.executeVote(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.PROPOSAL:
                result = this.executeProposal(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.TIME_LOCK:
                result = this.executeTimeLock(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.ATOMIC_SWAP:
                result = this.executeAtomicSwap(tx, sender, txIndex, ctx);
                break;
            case protocol_1.TokenTxType.RECOVERY:
                result = this.executeRecovery(tx, sender, txIndex, ctx);
                break;
            default:
                result = { ...ctx, success: false, error: 'Unknown transaction type' };
        }
        if (result.success) {
            const updatedSender = {
                ...sender,
                nonce: sender.nonce + 1n,
                balance: sender.balance - fee,
                updatedAt: BigInt(Date.now() * 1000),
            };
            this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
            result.writes.push({ key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) });
            this.totalTransactions++;
            this.totalFeesBurned += fee;
        }
        return result;
    }
    calculateDynamicFee(tx) {
        const metrics = this.getNetworkMetrics();
        const now = BigInt(Date.now() * 1000);
        const entropyFactor = this.getEntropyFactor();
        const congestionFactor = this.getCongestionFactor(metrics);
        const temporalFactor = this.getTemporalFactor(now);
        const sizeComponent = BigInt(tx.payload.length) * protocol_1.TOKEN_CONSTANTS.SIZE_FEE_RATE;
        const dynamicPriorityCap = this.calculateDynamicPriorityCap(metrics);
        const priorityComponent = tx.fee.priorityFee > dynamicPriorityCap ? dynamicPriorityCap : tx.fee.priorityFee;
        const baseWithEntropy = (protocol_1.TOKEN_CONSTANTS.BASE_FEE * entropyFactor) / 100n;
        const congestionAdjustment = (baseWithEntropy * congestionFactor) / 100n;
        const temporalAdjustment = (congestionAdjustment * temporalFactor) / 100n;
        const totalFee = temporalAdjustment + sizeComponent + priorityComponent;
        const clamped = totalFee < protocol_1.TOKEN_CONSTANTS.MIN_FEE
            ? protocol_1.TOKEN_CONSTANTS.MIN_FEE
            : totalFee > protocol_1.TOKEN_CONSTANTS.MAX_FEE
                ? protocol_1.TOKEN_CONSTANTS.MAX_FEE
                : totalFee;
        return clamped;
    }
    getEntropyFactor() {
        if (this.entropyWindow.length === 0) {
            return 100n;
        }
        let mixed = 0n;
        for (let i = 0; i < this.entropyWindow.length; i++) {
            mixed = (mixed * 31n + this.entropyWindow[i]) % 256n;
        }
        const factor = 50n + (mixed % 151n);
        return factor;
    }
    getCongestionFactor(metrics) {
        const targetVelocity = BigInt(Math.round(Number(metrics.totalSupply) * protocol_1.TOKEN_CONSTANTS.SUPPLY_TARGET_VELOCITY));
        if (targetVelocity === 0n)
            return 100n;
        const velocityRatio = this.totalTransactions / targetVelocity;
        let factor;
        if (velocityRatio < 1n / 2n) {
            factor = 50n + (velocityRatio * 100n) / 2n;
        }
        else if (velocityRatio < 1n) {
            factor = 100n + ((velocityRatio - 1n / 2n) * 200n);
        }
        else {
            factor = 300n;
        }
        return factor;
    }
    getTemporalFactor(now) {
        const date = new Date(Number(now / 1000n));
        const hour = date.getUTCHours();
        const dayOfWeek = date.getUTCDay();
        const hourFactor = hour >= 14 && hour <= 20 ? 120n : hour >= 8 && hour <= 22 ? 100n : 80n;
        const dayFactor = dayOfWeek >= 1 && dayOfWeek <= 5 ? 110n : 90n;
        return (hourFactor * dayFactor) / 100n;
    }
    calculateDynamicPriorityCap(metrics) {
        const baseCap = protocol_1.TOKEN_CONSTANTS.PRIORITY_FEE_CAP;
        const entropyFactor = this.getEntropyFactor();
        const congestionFactor = this.getCongestionFactor(metrics);
        const dynamicCap = (baseCap * entropyFactor * congestionFactor) / 10000n;
        return dynamicCap > baseCap ? baseCap : dynamicCap;
    }
    calculateDynamicBlockReward() {
        const metrics = this.getNetworkMetrics();
        const now = BigInt(Date.now() * 1000);
        const entropyFactor = this.getEntropyFactor();
        const stakeRatio = metrics.stakeRatio;
        const stakeComponent = stakeRatio < protocol_1.TOKEN_CONSTANTS.STAKE_RATIO_TARGET ? 120n : 80n;
        const blocksPerYear = 365n * 24n * 60n * 60n / (this.blockIntervals.length > 0
            ? this.blockIntervals.reduce((a, b) => a + b) / BigInt(this.blockIntervals.length) / 1000n
            : 1n);
        const years = this.blockNumber / blocksPerYear;
        const decayNoise = ((now / 1000n) % 997n) / 997n;
        const decayFactor = 100n - (years * 7n) + (decayNoise * 20n);
        const velocityComponent = metrics.velocityRatio > 1n / 2n ? 90n : 110n;
        const reward = (protocol_1.TOKEN_CONSTANTS.BASE_BLOCK_REWARD * entropyFactor * stakeComponent * decayFactor * velocityComponent) / 1000000n;
        return reward < protocol_1.TOKEN_CONSTANTS.MIN_BLOCK_REWARD
            ? protocol_1.TOKEN_CONSTANTS.MIN_BLOCK_REWARD
            : reward > protocol_1.TOKEN_CONSTANTS.MAX_BLOCK_REWARD
                ? protocol_1.TOKEN_CONSTANTS.MAX_BLOCK_REWARD
                : reward;
    }
    calculateDynamicAPY(stakerBalance) {
        const metrics = this.getNetworkMetrics();
        const totalStaked = metrics.totalStaked;
        const circulating = metrics.circulatingSupply;
        if (circulating === 0n || totalStaked === 0n) {
            return protocol_1.TOKEN_CONSTANTS.BASE_APY;
        }
        const stakeRatio = Number(totalStaked) / Number(circulating);
        let apy;
        if (stakeRatio < 0.3) {
            apy = protocol_1.TOKEN_CONSTANTS.MAX_APY;
        }
        else if (stakeRatio < protocol_1.TOKEN_CONSTANTS.STAKE_RATIO_TARGET) {
            const t = (stakeRatio - 0.3) / (protocol_1.TOKEN_CONSTANTS.STAKE_RATIO_TARGET - 0.3);
            apy = protocol_1.TOKEN_CONSTANTS.MAX_APY - t * (protocol_1.TOKEN_CONSTANTS.MAX_APY - protocol_1.TOKEN_CONSTANTS.BASE_APY);
        }
        else if (stakeRatio < 0.8) {
            const t = (stakeRatio - protocol_1.TOKEN_CONSTANTS.STAKE_RATIO_TARGET) / (0.8 - protocol_1.TOKEN_CONSTANTS.STAKE_RATIO_TARGET);
            apy = protocol_1.TOKEN_CONSTANTS.BASE_APY - t * (protocol_1.TOKEN_CONSTANTS.BASE_APY - protocol_1.TOKEN_CONSTANTS.MIN_APY);
        }
        else {
            apy = protocol_1.TOKEN_CONSTANTS.MIN_APY;
        }
        const entropyNoise = (Number(this.getEntropyFactor()) / 100 - 1) * 0.1;
        apy += entropyNoise;
        return Math.max(protocol_1.TOKEN_CONSTANTS.MIN_APY, Math.min(protocol_1.TOKEN_CONSTANTS.MAX_APY, apy));
    }
    captureEntropy(blockHash) {
        let entropy = 0n;
        for (let i = 0; i < blockHash.length; i++) {
            entropy = (entropy * 256n + BigInt(blockHash[i])) % 10000n;
        }
        this.entropyWindow.push(entropy);
        if (this.entropyWindow.length > protocol_1.TOKEN_CONSTANTS.ENTROPY_BLOCK_WINDOW) {
            this.entropyWindow.shift();
        }
    }
    distributeBlockRewards() {
        const reward = this.calculateDynamicBlockReward();
        if (reward > 0n && this.treasury >= reward) {
            this.treasury -= reward;
        }
    }
    getNetworkMetrics() {
        const totalSupply = protocol_1.TOKEN_CONSTANTS.MAX_SUPPLY;
        const circulating = totalSupply - this.totalStaked - this.totalFeesBurned;
        const stakeRatio = circulating > 0n ? Number(this.totalStaked) / Number(circulating) : 0;
        const velocityRatio = circulating > 0n ? Number(this.totalTransactions) / Number(circulating) : 0;
        return {
            totalSupply,
            circulatingSupply: circulating,
            totalStaked: this.totalStaked,
            totalTransactions: this.totalTransactions,
            avgBlockSize: 0,
            blockInterval: this.blockIntervals.length > 0
                ? this.blockIntervals.reduce((a, b) => a + b) / BigInt(this.blockIntervals.length)
                : 0n,
            entropySeed: this.entropyWindow.length > 0 ? this.entropyWindow[this.entropyWindow.length - 1] : 0n,
            stakeRatio,
            velocityRatio,
        };
    }
    updateNetworkMetrics() {
        const now = BigInt(Date.now() * 1000);
        if (this.lastBlockTimestamp > 0n) {
            const interval = now - this.lastBlockTimestamp;
            this.blockIntervals.push(interval);
            if (this.blockIntervals.length > 100) {
                this.blockIntervals.shift();
            }
        }
        this.lastBlockTimestamp = now;
    }
    calculateQuorum() {
        const threshold = BigInt(Math.round(Number(protocol_1.TOKEN_CONSTANTS.GOVERNANCE_THRESHOLD) * 100));
        return (protocol_1.TOKEN_CONSTANTS.MAX_SUPPLY * threshold) / 100n;
    }
    verifySignature(tx) {
        return tx.signature.length === 64 || tx.signature.length === 96;
    }
    decodeAmount(data) {
        if (data.length < 32)
            return 0n;
        return data.readBigUInt64LE(0);
    }
    decodeTimestamp(data) {
        if (data.length < 8)
            return 0n;
        return data.readBigUInt64LE(0);
    }
    extractProposalId(payload) {
        return payload.subarray(0, 32);
    }
    accountKey(address) {
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
    initializeGenesis() {
        const genesisAccount = {
            address: new Uint8Array(32),
            nonce: 0n,
            balance: protocol_1.TOKEN_CONSTANTS.GENESIS_SUPPLY,
            stake: 0n,
            delegatedTo: null,
            votingPower: 0n,
            flags: protocol_1.AccountFlag.NONE,
            metadataHash: null,
            createdAt: BigInt(Date.now() * 1000),
            updatedAt: BigInt(Date.now() * 1000),
        };
        this.state.writeAccount(new Uint8Array(32), 0, 0, genesisAccount);
    }
    // ----- Transaction Handlers -----
    executeTransfer(tx, sender, txIndex, ctx) {
        if (!tx.to || tx.payload.length < 32) {
            return { ...ctx, success: false, error: 'Invalid transfer recipient' };
        }
        const amount = this.decodeAmount(tx.payload);
        if (amount <= 0n || amount > sender.balance) {
            return { ...ctx, success: false, error: 'Insufficient balance' };
        }
        const [recipient, recipientWriter] = this.state.getAccount(tx.to, txIndex);
        if (!recipient) {
            return { ...ctx, success: false, error: 'Recipient not found' };
        }
        ctx.reads.push({ key: this.accountKey(tx.to), txIndex, version: recipientWriter });
        const updatedSender = { ...sender, balance: sender.balance - amount };
        const updatedRecipient = { ...recipient, balance: recipient.balance + amount, updatedAt: BigInt(Date.now() * 1000) };
        this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
        this.state.writeAccount(tx.to, txIndex, 0, updatedRecipient);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) },
                { key: this.accountKey(tx.to), txIndex, incarnation: 0, value: serializeForState(updatedRecipient) },
            ],
            gasUsed: this.estimateGas(tx, 1),
        };
    }
    executeStake(tx, sender, txIndex, ctx) {
        const amount = this.decodeAmount(tx.payload);
        if (amount < protocol_1.TOKEN_CONSTANTS.MIN_STAKE || amount > protocol_1.TOKEN_CONSTANTS.MAX_STAKE) {
            return { ...ctx, success: false, error: 'Stake amount out of range' };
        }
        if (amount > sender.balance) {
            return { ...ctx, success: false, error: 'Insufficient balance' };
        }
        const now = BigInt(Date.now() * 1000);
        const lockEnd = now + BigInt(protocol_1.TOKEN_CONSTANTS.LOCK_PERIODS[0] * 24 * 3600 * 1000);
        const apy = this.calculateDynamicAPY(amount);
        const position = {
            account: tx.from,
            amount,
            lockEnd,
            apy,
            rewardAccumulated: 0n,
            lastClaim: now,
        };
        const updatedSender = {
            ...sender,
            balance: sender.balance - amount,
            stake: sender.stake + amount,
            votingPower: sender.votingPower + amount,
        };
        this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
        this.state.writeStake(tx.from, txIndex, 0, position);
        this.totalStaked += amount;
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) },
                { key: this.stakeKey(tx.from), txIndex, incarnation: 0, value: serializeForState(position) },
            ],
            gasUsed: this.estimateGas(tx, 2),
        };
    }
    executeUnstake(tx, sender, txIndex, ctx) {
        const [position, _] = this.state.getStake(tx.from, txIndex);
        if (!position) {
            return { ...ctx, success: false, error: 'No stake position' };
        }
        ctx.reads.push({ key: this.stakeKey(tx.from), txIndex, version: _ });
        const now = BigInt(Date.now() * 1000);
        if (now < position.lockEnd) {
            return { ...ctx, success: false, error: 'Stake still locked' };
        }
        const updatedSender = {
            ...sender,
            balance: sender.balance + position.amount,
            stake: sender.stake - position.amount,
            votingPower: sender.votingPower - position.amount,
        };
        this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
        this.totalStaked -= position.amount;
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) },
            ],
            gasUsed: this.estimateGas(tx, 2),
        };
    }
    executeBurn(tx, sender, txIndex, ctx) {
        const amount = this.decodeAmount(tx.payload);
        if (amount > sender.balance) {
            return { ...ctx, success: false, error: 'Insufficient balance' };
        }
        const updatedSender = { ...sender, balance: sender.balance - amount };
        this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
        this.treasury -= amount;
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) },
            ],
            gasUsed: this.estimateGas(tx, 1),
        };
    }
    executeVote(tx, sender, txIndex, ctx) {
        const [proposal, _] = this.state.getProposal(this.extractProposalId(tx.payload), txIndex);
        if (!proposal) {
            return { ...ctx, success: false, error: 'Proposal not found' };
        }
        ctx.reads.push({ key: this.proposalKey(this.extractProposalId(tx.payload)), txIndex, version: _ });
        const voteWeight = sender.votingPower;
        const approve = tx.payload.readUInt8(0) === 1;
        const updatedProposal = {
            ...proposal,
            votesFor: approve ? proposal.votesFor + voteWeight : proposal.votesFor,
            votesAgainst: !approve ? proposal.votesAgainst + voteWeight : proposal.votesAgainst,
        };
        this.state.writeProposal(proposal.id, txIndex, 0, updatedProposal);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.proposalKey(proposal.id), txIndex, incarnation: 0, value: serializeForState(updatedProposal) },
            ],
            gasUsed: this.estimateGas(tx, 3),
        };
    }
    executeProposal(tx, sender, txIndex, ctx) {
        const titleLen = tx.payload.readUInt16LE(0);
        const title = tx.payload.subarray(2, 2 + titleLen).toString();
        const descLen = tx.payload.readUInt16LE(2 + titleLen);
        const description = tx.payload.subarray(4 + titleLen, 4 + titleLen + descLen).toString();
        const id = (0, encoding_1.hashTransaction)(tx).subarray(0, 32);
        const proposal = {
            id: new Uint8Array(id),
            proposer: tx.from,
            title,
            description,
            startBlock: this.blockNumber,
            endBlock: this.blockNumber + 10000n,
            votesFor: 0n,
            votesAgainst: 0n,
            quorum: this.calculateQuorum(),
            status: protocol_1.ProposalStatus.ACTIVE,
            executed: false,
        };
        this.state.writeProposal(proposal.id, txIndex, 0, proposal);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.proposalKey(proposal.id), txIndex, incarnation: 0, value: serializeForState(proposal) },
            ],
            gasUsed: this.estimateGas(tx, 5),
        };
    }
    executeTimeLock(tx, sender, txIndex, ctx) {
        const amount = this.decodeAmount(tx.payload.subarray(0, 32));
        const unlockTime = this.decodeTimestamp(tx.payload.subarray(32, 40));
        const hashLock = tx.payload.subarray(40, 72);
        if (amount > sender.balance) {
            return { ...ctx, success: false, error: 'Insufficient balance' };
        }
        const id = (0, encoding_1.hashTransaction)(tx).subarray(0, 32);
        const timelock = {
            id: new Uint8Array(id),
            creator: tx.from,
            target: tx.to,
            amount,
            unlockTime,
            hashLock: hashLock.length > 0 ? new Uint8Array(hashLock) : null,
            claimed: false,
        };
        const updatedSender = { ...sender, balance: sender.balance - amount };
        this.state.writeAccount(tx.from, txIndex, 0, updatedSender);
        this.state.writeTimeLock(timelock.id, txIndex, 0, timelock);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.accountKey(tx.from), txIndex, incarnation: 0, value: serializeForState(updatedSender) },
                { key: this.timelockKey(timelock.id), txIndex, incarnation: 0, value: serializeForState(timelock) },
            ],
            gasUsed: this.estimateGas(tx, 3),
        };
    }
    executeAtomicSwap(tx, sender, txIndex, ctx) {
        const maker = tx.payload.subarray(0, 32);
        const taker = tx.payload.subarray(32, 64);
        const makerAmount = this.decodeAmount(tx.payload.subarray(64, 96));
        const takerAmount = this.decodeAmount(tx.payload.subarray(96, 128));
        const hashLock = tx.payload.subarray(128, 160);
        const timeLock = this.decodeTimestamp(tx.payload.subarray(160, 168));
        const id = (0, encoding_1.hashTransaction)(tx).subarray(0, 32);
        const swap = {
            id: new Uint8Array(id),
            maker: new Uint8Array(maker),
            taker: new Uint8Array(taker),
            makerAsset: tx.from,
            takerAsset: tx.to || Buffer.alloc(32, 0),
            makerAmount,
            takerAmount,
            hashLock: new Uint8Array(hashLock),
            timeLock,
            status: protocol_1.SwapStatus.INITIATED,
        };
        this.state.writeSwap(swap.id, txIndex, 0, swap);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.swapKey(swap.id), txIndex, incarnation: 0, value: serializeForState(swap) },
            ],
            gasUsed: this.estimateGas(tx, 4),
        };
    }
    executeRecovery(tx, sender, txIndex, ctx) {
        const newOwner = tx.payload.subarray(0, 32);
        const delayEnds = this.decodeTimestamp(tx.payload.subarray(32, 40));
        const required = tx.payload.readUInt8(40);
        const id = (0, encoding_1.hashTransaction)(tx).subarray(0, 32);
        const recovery = {
            id: new Uint8Array(id),
            account: tx.from,
            newOwner: new Uint8Array(newOwner),
            delayEnds,
            confirmedBy: [],
            requiredConfirmations: required,
        };
        this.state.writeRecovery(recovery.id, txIndex, 0, recovery);
        return {
            ...ctx,
            success: true,
            writes: [
                { key: this.recoveryKey(recovery.id), txIndex, incarnation: 0, value: serializeForState(recovery) },
            ],
            gasUsed: this.estimateGas(tx, 5),
        };
    }
    estimateGas(tx, complexity) {
        const base = 100n;
        const payloadCost = BigInt(tx.payload.length) * 3n;
        const complexityCost = BigInt(complexity) * 1000n;
        return base + payloadCost + complexityCost;
    }
}
exports.TokenEngine = TokenEngine;
