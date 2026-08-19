"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmGovernanceEngine = void 0;
class WasmGovernanceEngine {
    wasmRuntime;
    validators = new Map();
    votes = new Map();
    minStake = BigInt(100000);
    votingPeriodMs = 86400000;
    proposalThreshold = BigInt(1000000);
    constructor(runtime, validatorAddresses = []) {
        this.wasmRuntime = runtime;
        for (const addr of validatorAddresses) {
            this.validators.set(addr, {
                address: addr,
                stake: BigInt(0),
                isActive: true,
                reputation: 1.0,
            });
        }
    }
    addValidator(address, stake) {
        this.validators.set(address, {
            address,
            stake,
            isActive: true,
            reputation: 1.0,
        });
    }
    removeValidator(address) {
        this.validators.delete(address);
    }
    createUpgradeProposal(moduleName, newVersion, newManifest, proposer) {
        const validator = this.validators.get(proposer);
        if (!validator || !validator.isActive) {
            return { accepted: false, reason: 'Invalid proposer' };
        }
        if (validator.stake < this.proposalThreshold) {
            return { accepted: false, reason: 'Insufficient stake to propose' };
        }
        const proposalId = `upgrade_${moduleName}_${Date.now()}`;
        const proposal = {
            proposalId,
            moduleName,
            newVersion,
            newManifest,
            proposer,
            timestamp: Date.now(),
            votesFor: 0,
            votesAgainst: 0,
            quorum: this._calculateQuorum(),
            status: 'pending',
        };
        const result = this.wasmRuntime.proposeUpgrade(proposal);
        if (result.accepted) {
            this.votes.set(proposalId, []);
        }
        return { accepted: result.accepted, reason: result.reason, proposalId };
    }
    castVote(proposalId, voterId, approve) {
        const proposal = this.wasmRuntime.getUpgradeProposals().find(p => p.proposalId === proposalId);
        if (!proposal) {
            return { accepted: false, reason: 'Proposal not found' };
        }
        if (proposal.status !== 'pending') {
            return { accepted: false, reason: `Proposal already ${proposal.status}` };
        }
        const validator = this.validators.get(voterId);
        if (!validator || !validator.isActive) {
            return { accepted: false, reason: 'Invalid voter' };
        }
        const vote = {
            voterId,
            proposalId,
            approve,
            votingPower: validator.stake,
            timestamp: Date.now(),
        };
        const proposalVotes = this.votes.get(proposalId) || [];
        proposalVotes.push(vote);
        this.votes.set(proposalId, proposalVotes);
        return this.wasmRuntime.voteOnUpgrade(proposalId, approve);
    }
    async executeApprovedUpgrade(proposalId) {
        const result = await this.wasmRuntime.executeUpgrade(proposalId);
        return result;
    }
    getValidatorStake(address) {
        const validator = this.validators.get(address);
        return validator ? validator.stake : BigInt(0);
    }
    getTotalStake() {
        let total = BigInt(0);
        for (const validator of this.validators.values()) {
            total += validator.stake;
        }
        return total;
    }
    getActiveValidators() {
        return Array.from(this.validators.values()).filter(v => v.isActive);
    }
    _calculateQuorum() {
        const totalStake = this.getTotalStake();
        const activeValidators = this.getActiveValidators();
        if (activeValidators.length === 0)
            return 100;
        const required = Math.ceil(activeValidators.length * 0.66);
        return Math.min(required, activeValidators.length);
    }
}
exports.WasmGovernanceEngine = WasmGovernanceEngine;
