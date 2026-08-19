import { NativeOracle } from '../oracle';
export interface LONOracleConfig {
    updateIntervalMs: number;
    maxStalenessMs: number;
    confidenceThreshold: number;
    deviationThreshold: number;
    supportedPairs: string[];
}
export interface LONPricePoint {
    symbol: string;
    price: number;
    timestamp: number;
    source: string;
    confidence: number;
    volume24h?: number;
    change24h?: number;
}
export interface LONConsensusData {
    symbol: string;
    price: number;
    twap: number;
    spread: number;
    confidence: number;
    staleness: number;
    isStale: boolean;
    sources: number;
}
export declare class LONPriceFeed {
    private oracle;
    private config;
    private lonValidators;
    private priceCache;
    private updateTimer;
    constructor(validatorAddresses?: string[], config?: Partial<LONOracleConfig>);
    addLONValidator(address: string): void;
    removeLONValidator(address: string): void;
    submitLONPrice(symbol: string, price: number, source: string, validatorId: string, signature: string): {
        accepted: boolean;
        reason: string;
    };
    getLONConsensus(symbol: string): LONConsensusData | null;
    getLONPrice(symbol: string): LONPricePoint | null;
    getAllLONPrices(): LONConsensusData[];
    getLONPriceHistory(symbol: string, limit?: number): LONPricePoint[];
    detectLONAnomaly(symbol: string): {
        isAnomalous: boolean;
        deviation: number;
        threshold: number;
    } | null;
    getValidatorReputation(validatorId: string): number;
    startAutoUpdate(callback: (prices: LONConsensusData[]) => void): void;
    stopAutoUpdate(): void;
    getOracleInstance(): NativeOracle;
}
