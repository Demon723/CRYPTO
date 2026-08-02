import { WasmRuntime, UpgradeProposal } from '../wasm-hotswap';

export interface GovernanceVote {
  voterId: string;
  proposalId: string;
  approve: boolean;
  votingPower: bigint;
  timestamp: number;
}

export interface ValidatorInfo {
  address: string;
  stake: bigint;
  isActive: boolean;
  reputation: number;
}

export class WasmGovernanceEngine {
  private wasmRuntime: WasmRuntime;
  private validators: Map<string, ValidatorInfo> = new Map();
  private votes: Map<string, GovernanceVote[]> = new Map();
  private minStake: bigint = BigInt(100000);
  private votingPeriodMs: number = 86400000;
  private proposalThreshold: bigint = BigInt(1000000);

  constructor(runtime: WasmRuntime, validatorAddresses: string[] = []) {
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

  addValidator(address: string, stake: bigint): void {
    this.validators.set(address, {
      address,
      stake,
      isActive: true,
      reputation: 1.0,
    });
  }

  removeValidator(address: string): void {
    this.validators.delete(address);
  }

  createUpgradeProposal(
    moduleName: string,
    newVersion: string,
    newManifest: any,
    proposer: string,
  ): { accepted: boolean; reason: string; proposalId?: string } {
    const validator = this.validators.get(proposer);
    if (!validator || !validator.isActive) {
      return { accepted: false, reason: 'Invalid proposer' };
    }

    if (validator.stake < this.proposalThreshold) {
      return { accepted: false, reason: 'Insufficient stake to propose' };
    }

    const proposalId = `upgrade_${moduleName}_${Date.now()}`;
    const proposal: UpgradeProposal = {
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

  castVote(proposalId: string, voterId: string, approve: boolean): { accepted: boolean; reason: string } {
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

    const vote: GovernanceVote = {
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

  async executeApprovedUpgrade(proposalId: string): Promise<any> {
    const result = await this.wasmRuntime.executeUpgrade(proposalId);
    return result;
  }

  getValidatorStake(address: string): bigint {
    const validator = this.validators.get(address);
    return validator ? validator.stake : BigInt(0);
  }

  getTotalStake(): bigint {
    let total = BigInt(0);
    for (const validator of this.validators.values()) {
      total += validator.stake;
    }
    return total;
  }

  getActiveValidators(): ValidatorInfo[] {
    return Array.from(this.validators.values()).filter(v => v.isActive);
  }

  private _calculateQuorum(): number {
    const totalStake = this.getTotalStake();
    const activeValidators = this.getActiveValidators();
    if (activeValidators.length === 0) return 100;
    const required = Math.ceil(activeValidators.length * 0.66);
    return Math.min(required, activeValidators.length);
  }
}
