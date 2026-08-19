"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapStatus = exports.ProposalStatus = exports.AccountFlag = exports.TokenTxType = exports.TOKEN_CONSTANTS = void 0;
exports.TOKEN_CONSTANTS = {
    SYMBOL: 'NX',
    NAME: 'Native Coin',
    DECIMALS: 9,
    MAX_SUPPLY: 21000000n * 10n ** 9n,
    GENESIS_SUPPLY: 5000000n * 10n ** 9n,
    // Block reward parameters (NOT fixed - dynamically calculated)
    BASE_BLOCK_REWARD: 50n * 10n ** 9n,
    MIN_BLOCK_REWARD: 1n * 10n ** 9n,
    MAX_BLOCK_REWARD: 100n * 10n ** 9n,
    // Staking parameters
    MIN_STAKE: 1000n * 10n ** 9n,
    MAX_STAKE: 1000000n * 10n ** 9n,
    BASE_APY: 0.12,
    MIN_APY: 0.01,
    MAX_APY: 0.50,
    LOCK_PERIODS: [30, 90, 180, 365],
    // Fee parameters (dynamic base)
    BASE_FEE: 1000n,
    MIN_FEE: 100n,
    MAX_FEE: 1000000n,
    PRIORITY_FEE_CAP: 10000000000n,
    SIZE_FEE_RATE: 10n,
    // Governance
    GOVERNANCE_THRESHOLD: 0.05,
    RECOVERY_DELAY: 3 * 24 * 3600,
    // Non-predictable tuning
    ENTROPY_BLOCK_WINDOW: 100,
    SUPPLY_TARGET_VELOCITY: 0.15,
    STAKE_RATIO_TARGET: 0.60,
};
var TokenTxType;
(function (TokenTxType) {
    TokenTxType[TokenTxType["TRANSFER"] = 1] = "TRANSFER";
    TokenTxType[TokenTxType["STAKE"] = 2] = "STAKE";
    TokenTxType[TokenTxType["UNSTAKE"] = 3] = "UNSTAKE";
    TokenTxType[TokenTxType["GOVERNANCE_VOTE"] = 4] = "GOVERNANCE_VOTE";
    TokenTxType[TokenTxType["PROPOSAL"] = 5] = "PROPOSAL";
    TokenTxType[TokenTxType["TIME_LOCK"] = 6] = "TIME_LOCK";
    TokenTxType[TokenTxType["ATOMIC_SWAP"] = 7] = "ATOMIC_SWAP";
    TokenTxType[TokenTxType["RECOVERY"] = 8] = "RECOVERY";
    TokenTxType[TokenTxType["BURN"] = 9] = "BURN";
    TokenTxType[TokenTxType["FEE_PAYMENT"] = 10] = "FEE_PAYMENT";
})(TokenTxType || (exports.TokenTxType = TokenTxType = {}));
var AccountFlag;
(function (AccountFlag) {
    AccountFlag[AccountFlag["NONE"] = 0] = "NONE";
    AccountFlag[AccountFlag["FROZEN"] = 1] = "FROZEN";
    AccountFlag[AccountFlag["MULTISIG"] = 2] = "MULTISIG";
    AccountFlag[AccountFlag["RECOVERY"] = 4] = "RECOVERY";
    AccountFlag[AccountFlag["STEALTH"] = 8] = "STEALTH";
    AccountFlag[AccountFlag["QUANTUM_SAFE"] = 16] = "QUANTUM_SAFE";
})(AccountFlag || (exports.AccountFlag = AccountFlag = {}));
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["PENDING"] = "PENDING";
    ProposalStatus["ACTIVE"] = "ACTIVE";
    ProposalStatus["ACCEPTED"] = "ACCEPTED";
    ProposalStatus["REJECTED"] = "REJECTED";
    ProposalStatus["EXECUTED"] = "EXECUTED";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
var SwapStatus;
(function (SwapStatus) {
    SwapStatus["INITIATED"] = "INITIATED";
    SwapStatus["FILLED"] = "FILLED";
    SwapStatus["EXPIRED"] = "EXPIRED";
    SwapStatus["REFUNDED"] = "REFUNDED";
})(SwapStatus || (exports.SwapStatus = SwapStatus = {}));
