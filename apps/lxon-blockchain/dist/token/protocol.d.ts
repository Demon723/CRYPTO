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
export declare const TOKEN_CONSTANTS: {
    SYMBOL: string;
    NAME: string;
    DECIMALS: number;
    MAX_SUPPLY: bigint;
    GENESIS_SUPPLY: bigint;
    BASE_BLOCK_REWARD: bigint;
    MIN_BLOCK_REWARD: bigint;
    MAX_BLOCK_REWARD: bigint;
    MIN_STAKE: bigint;
    MAX_STAKE: bigint;
    BASE_APY: number;
    MIN_APY: number;
    MAX_APY: number;
    LOCK_PERIODS: number[];
    BASE_FEE: bigint;
    MIN_FEE: bigint;
    MAX_FEE: bigint;
    PRIORITY_FEE_CAP: bigint;
    SIZE_FEE_RATE: bigint;
    GOVERNANCE_THRESHOLD: number;
    RECOVERY_DELAY: number;
    ENTROPY_BLOCK_WINDOW: number;
    SUPPLY_TARGET_VELOCITY: number;
    STAKE_RATIO_TARGET: number;
};
export declare enum TokenTxType {
    TRANSFER = 1,
    STAKE = 2,
    UNSTAKE = 3,
    GOVERNANCE_VOTE = 4,
    PROPOSAL = 5,
    TIME_LOCK = 6,
    ATOMIC_SWAP = 7,
    RECOVERY = 8,
    BURN = 9,
    FEE_PAYMENT = 10
}
export declare enum AccountFlag {
    NONE = 0,
    FROZEN = 1,
    MULTISIG = 2,
    RECOVERY = 4,
    STEALTH = 8,
    QUANTUM_SAFE = 16
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
export declare enum ProposalStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXECUTED = "EXECUTED"
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
export declare enum SwapStatus {
    INITIATED = "INITIATED",
    FILLED = "FILLED",
    EXPIRED = "EXPIRED",
    REFUNDED = "REFUNDED"
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
