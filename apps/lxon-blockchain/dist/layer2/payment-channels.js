"use strict";
/**
 * Lightning-Style Payment Channels for LXON Blockchain
 *
 * Implements Bitcoin Lightning Network-inspired payment channels for:
 * - Instant off-chain transactions
 * - Privacy through transaction batching
 * - Reduced on-chain load
 * - Micropayment support
 *
 * Features:
 * - Bidirectional payment channels
 * - HTLC (Hashed Timelock Contracts) for routing
 * - Channel management (open, update, close)
 * - Watchtower integration for security
 * - Multi-hop routing capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = exports.WatchtowerService = exports.PaymentChannelManager = void 0;
const crypto_1 = require("crypto");
class PaymentChannelManager {
    channels = new Map();
    pendingChannels = new Map();
    watchtowers = [];
    /**
     * Open a new payment channel
     */
    async openChannel(localNode, remoteNode, parameters, fundingUTXO) {
        const channelId = this.generateChannelId(localNode, remoteNode);
        // Create funding transaction
        const fundingTx = this.createFundingTransaction(localNode, remoteNode, parameters, fundingUTXO);
        // Create initial commitment transactions
        const initialBalances = [
            parameters.capacity - parameters.pushAmount,
            parameters.pushAmount,
        ];
        const localCommitment = this.createCommitmentTransaction(channelId, localNode, remoteNode, initialBalances, 0, [], parameters);
        const remoteCommitment = this.createCommitmentTransaction(channelId, remoteNode, localNode, initialBalances, 0, [], parameters);
        // Generate funding txid
        const fundingTxid = this.generateFundingTxid(fundingTx);
        // Create channel state
        const channelState = {
            channelId,
            participants: [localNode, remoteNode],
            balances: initialBalances,
            fundingTxid: fundingTxid,
            fundingOutputIndex: 0,
            localCommitment,
            remoteCommitment,
            localNextCommitmentNumber: 1,
            remoteNextCommitmentNumber: 1,
            htlcs: [],
            isClosed: false,
        };
        const channel = {
            channelId,
            parameters,
            state: channelState,
            localNode,
            remoteNode,
        };
        this.pendingChannels.set(channelId, channel);
        return {
            channelId,
            fundingTx,
        };
    }
    /**
     * Confirm channel opening (after funding transaction confirms)
     */
    confirmChannelOpening(channelId, fundingTxid) {
        const pendingChannel = this.pendingChannels.get(channelId);
        if (!pendingChannel) {
            return false;
        }
        pendingChannel.state.fundingTxid = fundingTxid;
        this.channels.set(channelId, pendingChannel);
        this.pendingChannels.delete(channelId);
        return true;
    }
    /**
     * Update channel state (send payment)
     */
    async updateChannel(channelId, amount, paymentHash) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.state.isClosed) {
            return { success: false, error: 'Channel is closed' };
        }
        // Check if sufficient balance
        if (channel.state.balances[0] < amount) {
            return { success: false, error: 'Insufficient balance' };
        }
        // Update balances
        const newBalances = [
            channel.state.balances[0] - amount,
            channel.state.balances[1] + amount,
        ];
        // Add HTLC if payment hash provided
        const newHTLCs = [...channel.state.htlcs];
        if (paymentHash) {
            const htlc = {
                htlcId: this.generateHTLCId(),
                paymentHash,
                amount,
                expiry: this.calculateHTLCExpiry(),
                direction: 'outgoing',
                state: 'pending',
            };
            newHTLCs.push(htlc);
        }
        // Create new commitment transaction
        const newCommitment = this.createCommitmentTransaction(channelId, channel.localNode, channel.remoteNode, newBalances, channel.state.localNextCommitmentNumber, newHTLCs, channel.parameters);
        // Sign the commitment
        const signature = this.signCommitment(newCommitment);
        // Update channel state (temporary)
        const updatedChannel = { ...channel };
        updatedChannel.state.balances = newBalances;
        updatedChannel.state.htlcs = newHTLCs;
        updatedChannel.state.localCommitment = newCommitment;
        updatedChannel.state.localNextCommitmentNumber++;
        return {
            success: true,
            signature,
        };
    }
    /**
     * Receive channel update from remote party
     */
    receiveChannelUpdate(update) {
        const channel = this.channels.get(update.channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        // Verify signature
        if (!this.verifyCommitmentSignature(update)) {
            return { success: false, error: 'Invalid signature' };
        }
        // Update channel state
        channel.state.balances = update.newBalances;
        channel.state.htlcs = update.newHTLCs;
        channel.state.remoteCommitment = this.createCommitmentTransaction(update.channelId, channel.remoteNode, channel.localNode, update.newBalances, update.commitmentNumber, update.newHTLCs, channel.parameters);
        channel.state.remoteNextCommitmentNumber = update.commitmentNumber + 1;
        return { success: true };
    }
    /**
     * Fulfill HTLC (provide preimage to claim payment)
     */
    fulfillHTLC(channelId, htlcId, preimage) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        const htlc = channel.state.htlcs.find(h => h.htlcId === htlcId);
        if (!htlc) {
            return { success: false, error: 'HTLC not found' };
        }
        // Verify preimage matches payment hash
        const computedHash = (0, crypto_1.createHash)('sha256').update(preimage).digest();
        if (!computedHash.equals(htlc.paymentHash)) {
            return { success: false, error: 'Invalid preimage' };
        }
        // Update HTLC state
        htlc.state = 'fulfilled';
        htlc.preimage = preimage;
        // Update balances
        if (htlc.direction === 'incoming') {
            channel.state.balances[0] += htlc.amount;
        }
        else {
            channel.state.balances[1] += htlc.amount;
        }
        return { success: true };
    }
    /**
     * Close channel cooperatively
     */
    closeChannel(channelId, finalBalances) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        if (channel.state.isClosed) {
            return { success: false, error: 'Channel already closed' };
        }
        const balances = finalBalances || channel.state.balances;
        // Create closing transaction
        const closeTx = this.createClosingTransaction(channelId, channel.state.participants, balances, channel.state.fundingTxid, channel.state.fundingOutputIndex, channel.parameters.capacity);
        channel.state.isClosed = true;
        channel.state.closeTx = closeTx.txid;
        return {
            success: true,
            closeTx,
        };
    }
    /**
     * Force close channel (uncooperative close)
     */
    forceCloseChannel(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        // Publish latest commitment transaction
        const closeTx = this.createCommitmentTransaction(channelId, channel.localNode, channel.remoteNode, channel.state.balances, channel.state.localNextCommitmentNumber - 1, channel.state.htlcs, channel.parameters);
        channel.state.isClosed = true;
        channel.state.closeTx = closeTx;
        return {
            success: true,
            closeTx: closeTx.txid,
        };
    }
    /**
     * Add watchtower for channel monitoring
     */
    addWatchtower(watchtower) {
        this.watchtowers.push(watchtower);
    }
    /**
     * Send channel data to watchtowers
     */
    syncWatchtowers(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel)
            return;
        for (const watchtower of this.watchtowers) {
            watchtower.monitorChannel(channel);
        }
    }
    /**
     * Generate unique channel ID
     */
    generateChannelId(localNode, remoteNode) {
        const combined = localNode < remoteNode
            ? localNode + remoteNode
            : remoteNode + localNode;
        return (0, crypto_1.createHash)('sha256').update(combined).digest('hex');
    }
    /**
     * Generate funding transaction ID
     */
    generateFundingTxid(fundingTx) {
        const txString = JSON.stringify(fundingTx);
        return (0, crypto_1.createHash)('sha256').update(txString).digest('hex');
    }
    /**
     * Generate unique HTLC ID
     */
    generateHTLCId() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    /**
     * Calculate HTLC expiry (blocks from now)
     */
    calculateHTLCExpiry() {
        return 144; // ~1 day in blocks
    }
    /**
     * Create funding transaction
     */
    createFundingTransaction(localNode, remoteNode, parameters, fundingUTXO) {
        // Create 2-of-2 multisig output for channel funding
        const fundingScript = this.createFundingScript(localNode, remoteNode);
        const fundingTx = {
            version: 2,
            inputs: [{
                    utxoKey: { txid: fundingUTXO.txid, outputIndex: fundingUTXO.outputIndex },
                    unlockingScript: Buffer.alloc(0), // To be signed
                    sequence: 0xffffffff,
                }],
            outputs: [{
                    value: parameters.capacity,
                    lockingScript: fundingScript,
                    address: this.encodeScriptAddress(fundingScript),
                    scriptType: 'p2wsh',
                }],
            locktime: 0,
            isUTXOBased: true,
        };
        return fundingTx;
    }
    /**
     * Create 2-of-2 multisig funding script
     */
    createFundingScript(localNode, remoteNode) {
        // Simplified 2-of-2 multisig script
        // OP_2 <pubkey1> <pubkey2> OP_2 OP_CHECKMULTISIG
        const localPubkey = Buffer.from(localNode, 'hex');
        const remotePubkey = Buffer.from(remoteNode, 'hex');
        return Buffer.concat([
            Buffer.from([0x52]), // OP_2
            Buffer.from([localPubkey.length]),
            localPubkey,
            Buffer.from([remotePubkey.length]),
            remotePubkey,
            Buffer.from([0x52]), // OP_2
            Buffer.from([0xae]), // OP_CHECKMULTISIG
        ]);
    }
    /**
     * Encode script to address
     */
    encodeScriptAddress(script) {
        const scriptHash = (0, crypto_1.createHash)('sha256').update(script).digest();
        const hash160 = (0, crypto_1.createHash)('ripemd160').update(scriptHash).digest();
        return `lxon1${hash160.toString('hex')}`;
    }
    /**
     * Create commitment transaction
     */
    createCommitmentTransaction(channelId, toSelf, toOther, balances, commitmentNumber, htlcs, parameters) {
        // Create outputs based on balances and HTLCs
        const outputs = [
            {
                address: toSelf,
                amount: balances[0],
                isToSelf: true,
                delayBlocks: 1000, // Relative timelock for penalty transactions
            },
            {
                address: toOther,
                amount: balances[1],
                isToSelf: false,
                delayBlocks: 0,
            },
        ];
        // Add HTLC outputs
        for (const htlc of htlcs) {
            if (htlc.state === 'pending') {
                outputs.push({
                    address: this.encodeHTLCAddress(htlc.paymentHash),
                    amount: htlc.amount,
                    isToSelf: htlc.direction === 'incoming',
                    delayBlocks: htlc.expiry,
                });
            }
        }
        // Calculate fee
        const fee = this.calculateCommitmentFee(outputs, parameters.feeRate);
        // Create transaction ID
        const txid = this.generateCommitmentTxid(channelId, commitmentNumber, outputs);
        return {
            txid,
            commitmentNumber,
            fee,
            outputs,
            htlcs,
            signature: Buffer.alloc(0),
        };
    }
    /**
     * Calculate commitment transaction fee
     */
    calculateCommitmentFee(outputs, feeRate) {
        // Simplified fee calculation based on output count
        const estimatedSize = 180 + outputs.length * 34;
        return feeRate * BigInt(estimatedSize);
    }
    /**
     * Generate commitment transaction ID
     */
    generateCommitmentTxid(channelId, commitmentNumber, outputs) {
        const data = `${channelId}:${commitmentNumber}:${JSON.stringify(outputs)}`;
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
    }
    /**
     * Create closing transaction
     */
    createClosingTransaction(channelId, participants, balances, fundingTxid, fundingOutputIndex, capacity) {
        const closingTx = {
            version: 2,
            inputs: [{
                    utxoKey: { txid: fundingTxid, outputIndex: fundingOutputIndex },
                    unlockingScript: Buffer.alloc(0), // 2-of-2 signature
                    sequence: 0xffffffff,
                }],
            outputs: [
                {
                    value: balances[0],
                    lockingScript: this.createP2WPKHScript(participants[0]),
                    address: participants[0],
                    scriptType: 'p2wpkh',
                },
                {
                    value: balances[1],
                    lockingScript: this.createP2WPKHScript(participants[1]),
                    address: participants[1],
                    scriptType: 'p2wpkh',
                },
            ],
            locktime: 0,
            isUTXOBased: true,
        };
        return closingTx;
    }
    /**
     * Create P2WPKH locking script
     */
    createP2WPKHScript(address) {
        const pubkeyHash = Buffer.from(address.slice(0, 40), 'hex');
        return Buffer.concat([
            Buffer.from([0x00, 0x14]), // OP_0 OP_PUSH20
            pubkeyHash,
        ]);
    }
    /**
     * Encode HTLC address
     */
    encodeHTLCAddress(paymentHash) {
        return `htlc1${paymentHash.toString('hex').slice(0, 40)}`;
    }
    /**
     * Sign commitment transaction
     */
    signCommitment(commitment) {
        // Simplified signature generation
        // In reality, this would use proper cryptographic signing
        const data = `${commitment.txid}:${commitment.commitmentNumber}`;
        return (0, crypto_1.createHash)('sha256').update(data).digest();
    }
    /**
     * Verify commitment signature
     */
    verifyCommitmentSignature(update) {
        // Simplified signature verification
        return update.signature.length > 0;
    }
    /**
     * Get channel information
     */
    getChannelInfo(channelId) {
        return this.channels.get(channelId);
    }
    /**
     * Get all channels for a node
     */
    getChannelsForNode(node) {
        return Array.from(this.channels.values()).filter(channel => channel.localNode === node || channel.remoteNode === node);
    }
    /**
     * Get channel statistics
     */
    getChannelStatistics() {
        const channels = Array.from(this.channels.values());
        const activeChannels = channels.filter(c => !c.state.isClosed).length;
        const closedChannels = channels.filter(c => c.state.isClosed).length;
        const totalCapacity = channels.reduce((sum, c) => sum + c.parameters.capacity, BigInt(0));
        return {
            totalChannels: channels.length,
            totalCapacity,
            activeChannels,
            closedChannels,
        };
    }
}
exports.PaymentChannelManager = PaymentChannelManager;
class WatchtowerService {
    watchtowers = new Map();
    monitoredChannels = new Map();
    /**
     * Register a watchtower
     */
    registerWatchtower(watchtower) {
        this.watchtowers.set(watchtower.id, watchtower);
    }
    /**
     * Monitor channel with watchtower
     */
    monitorChannel(channelId, watchtowerId) {
        const watchtower = this.watchtowers.get(watchtowerId);
        if (!watchtower) {
            return false;
        }
        const channels = this.monitoredChannels.get(watchtowerId) || [];
        // Add channel to monitoring (simplified)
        this.monitoredChannels.set(watchtowerId, channels);
        return true;
    }
    /**
     * Check for channel breaches
     */
    async checkBreaches(channelId) {
        const reports = [];
        for (const [watchtowerId, watchtower] of this.watchtowers) {
            try {
                const breaches = await watchtower.checkBreaches(channelId);
                reports.push(...breaches);
            }
            catch (error) {
                console.error(`Watchtower ${watchtowerId} error:`, error);
            }
        }
        return reports;
    }
}
exports.WatchtowerService = WatchtowerService;
class PaymentRouter {
    networkGraph = new Map();
    /**
     * Add channel to network graph
     */
    addChannel(channel) {
        const { channelId, localNode, remoteNode, parameters } = channel;
        // Add forward direction
        if (!this.networkGraph.has(localNode)) {
            this.networkGraph.set(localNode, new Map());
        }
        this.networkGraph.get(localNode).set(remoteNode, {
            channelID: channelId,
            nextNode: remoteNode,
            fee: parameters.feeRate,
            cltvExpiry: parameters.locktime,
        });
        // Add reverse direction
        if (!this.networkGraph.has(remoteNode)) {
            this.networkGraph.set(remoteNode, new Map());
        }
        this.networkGraph.get(remoteNode).set(localNode, {
            channelID: channelId,
            nextNode: localNode,
            fee: parameters.feeRate,
            cltvExpiry: parameters.locktime,
        });
    }
    /**
     * Find route for payment
     */
    findRoute(sourceNode, targetNode, amount) {
        // Use Dijkstra's algorithm to find shortest path
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        // Initialize distances
        for (const node of this.networkGraph.keys()) {
            distances.set(node, BigInt(2) ** BigInt(256)); // Infinity
        }
        distances.set(sourceNode, BigInt(0));
        // Priority queue (simplified as array)
        const queue = [
            { node: sourceNode, distance: BigInt(0) },
        ];
        while (queue.length > 0) {
            // Sort by distance (inefficient but works for small graphs)
            queue.sort((a, b) => (a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0));
            const { node: currentNode, distance: currentDistance } = queue.shift();
            if (currentNode === targetNode) {
                break;
            }
            if (visited.has(currentNode)) {
                continue;
            }
            visited.add(currentNode);
            const neighbors = this.networkGraph.get(currentNode);
            if (!neighbors)
                continue;
            for (const [nextNode, hop] of neighbors) {
                if (visited.has(nextNode))
                    continue;
                const newDistance = currentDistance + hop.fee;
                if (newDistance < distances.get(nextNode)) {
                    distances.set(nextNode, newDistance);
                    previous.set(nextNode, hop);
                    queue.push({ node: nextNode, distance: newDistance });
                }
            }
        }
        // Reconstruct path
        if (!previous.has(targetNode)) {
            return null; // No route found
        }
        const hops = [];
        let currentNode = targetNode;
        let totalFee = BigInt(0);
        let totalLocktime = 0;
        while (currentNode !== sourceNode) {
            const hop = previous.get(currentNode);
            hops.unshift(hop);
            totalFee += hop.fee;
            totalLocktime = Math.max(totalLocktime, hop.cltvExpiry);
            currentNode = this.networkGraph.get(currentNode).get(hop.nextNode).nextNode;
        }
        return {
            hops,
            totalFee,
            totalAmount: amount + totalFee,
            totalLocktime,
        };
    }
    /**
     * Get network statistics
     */
    getNetworkStatistics() {
        let totalChannels = 0;
        let totalCapacity = BigInt(0);
        for (const [node, neighbors] of this.networkGraph) {
            totalChannels += neighbors.size;
        }
        return {
            nodes: this.networkGraph.size,
            channels: totalChannels / 2, // Each channel counted twice
            avgCapacity: totalChannels > 0 ? totalCapacity / BigInt(totalChannels) : BigInt(0),
        };
    }
}
exports.PaymentRouter = PaymentRouter;
