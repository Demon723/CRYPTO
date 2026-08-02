/**
 * NX Native Token Protocol
 * 
 * NON-PREDICTABLE PRICING MODEL
 * 
 * Designed to make economic parameters algorithmically opaque:
 * - Dynamic block rewards based on network entropy
 * - Chaotic fee adjustment using on-chain state
 * - Variable staking APY based on stake ratio
 * - No fixed halving schedule
 * - Supply dynamics responsive to network conditions
 * 
 * All parameters are deterministic (consensus-safe) but computationally
 * non-predictable without executing the full state transition function.
 */

export const TOKEN_CONSTANTS = {
  SYMBOL: 'NX',
  NAME: 'Native Coin',
  DECIMALS: 9,
  MAX_SUPPLY: 21_000_000n * 10n ** 9n,
  GENESIS_SUPPLY: 5_000_000n * 10n ** 9n,
  
  // Block reward parameters (NOT fixed - dynamically calculated)
  BASE_BLOCK_REWARD: 50n * 10n ** 9n,
  MIN_BLOCK_REWARD: 1n * 10n ** 9n,
  MAX_BLOCK_REWARD: 100n * 10n ** 9n,
  
  // Staking parameters
  MIN_STAKE: 1000n * 10n ** 9n,
  MAX_STAKE: 1_000_000n * 10n ** 9n,
  BASE_APY: 0.12,
  MIN_APY: 0.01,
  MAX_APY: 0.50,
  LOCK_PERIODS: [30, 90, 180, 365],
  
  // Fee parameters (dynamic base)
  BASE_FEE: 1000n,
  MIN_FEE: 100n,
  MAX_FEE: 1_000_000n,
  PRIORITY_FEE_CAP: 10_000_000_000n,
  SIZE_FEE_RATE: 10n,
  
  // Governance
  GOVERNANCE_THRESHOLD: 0.05,
  RECOVERY_DELAY: 3 * 24 * 3600,
  
  // Non-predictable tuning
  ENTROPY_BLOCK_WINDOW: 100,
  SUPPLY_TARGET_VELOCITY: 0.15,
  STAKE_RATIO_TARGET: 0.60,
};

export enum TokenTxType {
  TRANSFER = 0x01,
  STAKE = 0x02,
  UNSTAKE = 0x03,
  GOVERNANCE_VOTE = 0x04,
  PROPOSAL = 0x05,
  TIME_LOCK = 0x06,
  ATOMIC_SWAP = 0x07,
  RECOVERY = 0x08,
  BURN = 0x09,
  FEE_PAYMENT = 0x0A,
}

export enum AccountFlag {
  NONE = 0x00,
  FROZEN = 0x01,
  MULTISIG = 0x02,
  RECOVERY = 0x04,
  STEALTH = 0x08,
  QUANTUM_SAFE = 0x10,
}

export interface TokenAccount {
  address: Uint8Array;
  nonce: bigint;
  balance: bigint;
  stake: bigint;
  delegatedTo: Uint8Array | null;
  votingPower: bigint;
  flags: number;
  metadataHash: Uint8Array | null;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface StakePosition {
  account: Uint8Array;
  amount: bigint;
  lockEnd: bigint;
  apy: number;
  rewardAccumulated: bigint;
  lastClaim: bigint;
}

export interface Proposal {
  id: Uint8Array;
  proposer: Uint8Array;
  title: string;
  description: string;
  startBlock: bigint;
  endBlock: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  quorum: bigint;
  status: ProposalStatus;
  executed: boolean;
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
}

export interface TimeLock {
  id: Uint8Array;
  creator: Uint8Array;
  target: Uint8Array | null;
  amount: bigint;
  unlockTime: bigint;
  hashLock: Uint8Array | null;
  claimed: boolean;
}

export interface AtomicSwap {
  id: Uint8Array;
  maker: Uint8Array;
  taker: Uint8Array;
  makerAsset: Uint8Array;
  takerAsset: Uint8Array;
  makerAmount: bigint;
  takerAmount: bigint;
  hashLock: Uint8Array;
  timeLock: bigint;
  status: SwapStatus;
}

export enum SwapStatus {
  INITIATED = 'INITIATED',
  FILLED = 'FILLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export interface RecoveryRequest {
  id: Uint8Array;
  account: Uint8Array;
  newOwner: Uint8Array;
  delayEnds: bigint;
  confirmedBy: Uint8Array[];
  requiredConfirmations: number;
}

export interface FeeParams {
  baseFee: bigint;
  priorityFee: bigint;
  gasLimit: bigint;
  gasUsed: bigint;
  sizeBytes: number;
}

export interface TokenTx {
  type: TokenTxType;
  from: Uint8Array;
  to: Uint8Array | null;
  nonce: bigint;
  fee: FeeParams;
  timestamp: bigint;
  payload: Buffer;
  signature: Buffer;
}

export interface NetworkMetrics {
  totalSupply: bigint;
  circulatingSupply: bigint;
  totalStaked: bigint;
  totalTransactions: bigint;
  avgBlockSize: number;
  blockInterval: bigint;
  entropySeed: bigint;
  stakeRatio: number;
  velocityRatio: number;
}
