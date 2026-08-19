export interface OraclePrice {
    symbol: string;
    price: number;
    timestamp: number;
    source: string;
    confidence: number;
}
export interface OracleUpdate {
    symbol: string;
    price: number;
    source: string;
    signature: string;
}
export interface ConsensusPrice {
    symbol: string;
    price: number;
    medianPrice: number;
    spread: number;
    sources: number;
    timestamp: number;
    confidence: number;
    staleness: number;
}
export interface PriceDeviation {
    symbol: string;
    deviation: number;
    threshold: number;
    isAnomalous: boolean;
}
export declare class NativeOracle {
    private priceFeeds;
    private validators;
    private minValidators;
    private updateThreshold;
    private maxStalenessMs;
    private priceHistory;
    private maxHistoryLength;
    private reputationScores;
    constructor(validatorAddresses?: string[]);
    addValidator(address: string): void;
    removeValidator(address: string): void;
    submitPriceUpdate(update: OracleUpdate, validatorId: string): {
        accepted: boolean;
        reason: string;
    };
    getConsensusPrice(symbol: string): ConsensusPrice | null;
    getTWAP(symbol: string, windowMs?: number): number | null;
    getLatestPrice(symbol: string): OraclePrice | null;
    getPriceHistory(symbol: string, limit?: number): OraclePrice[];
    detectDeviation(symbol: string): PriceDeviation | null;
    getValidatorCount(): number;
    isValidator(address: string): boolean;
    updateReputation(validatorId: string, score: number): void;
    getReputation(validatorId: string): number;
    isStale(symbol: string): boolean;
    private _computeConfidence;
}
