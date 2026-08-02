import { NativeOracle, OracleUpdate, ConsensusPrice, OraclePrice } from '../oracle';

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

export class LONPriceFeed {
  private oracle: NativeOracle;
  private config: LONOracleConfig;
  private lonValidators: Set<string> = new Set();
  private priceCache: Map<string, LONPricePoint> = new Map();
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(
    validatorAddresses: string[] = [],
    config: Partial<LONOracleConfig> = {},
  ) {
    this.oracle = new NativeOracle(validatorAddresses);
    this.config = {
      updateIntervalMs: config.updateIntervalMs || 5000,
      maxStalenessMs: config.maxStalenessMs || 300000,
      confidenceThreshold: config.confidenceThreshold || 0.7,
      deviationThreshold: config.deviationThreshold || 0.03,
      supportedPairs: config.supportedPairs || ['LON/USD', 'LON/BTC', 'LON/ETH', 'LON/USDC'],
    };

    for (const addr of validatorAddresses) {
      this.lonValidators.add(addr);
    }
  }

  addLONValidator(address: string): void {
    this.lonValidators.add(address);
    this.oracle.addValidator(address);
  }

  removeLONValidator(address: string): void {
    this.lonValidators.delete(address);
    this.oracle.removeValidator(address);
  }

  submitLONPrice(symbol: string, price: number, source: string, validatorId: string, signature: string): { accepted: boolean; reason: string } {
    if (!this.config.supportedPairs.includes(symbol)) {
      return { accepted: false, reason: `Unsupported symbol: ${symbol}` };
    }

    if (price <= 0) {
      return { accepted: false, reason: 'Invalid price' };
    }

    const result = this.oracle.submitPriceUpdate({ symbol, price, source, signature }, validatorId);

    if (result.accepted) {
      this.priceCache.set(symbol, {
        symbol,
        price,
        timestamp: Date.now(),
        source,
        confidence: 0.8,
      });
    }

    return result;
  }

  getLONConsensus(symbol: string): LONConsensusData | null {
    const consensus = this.oracle.getConsensusPrice(symbol);
    if (!consensus) return null;

    const twap = this.oracle.getTWAP(symbol, 3600000) || consensus.price;
    const isStale = this.oracle.isStale(symbol);

    return {
      symbol,
      price: consensus.price,
      twap,
      spread: consensus.spread,
      confidence: consensus.confidence,
      staleness: consensus.staleness,
      isStale,
      sources: consensus.sources,
    };
  }

  getLONPrice(symbol: string): LONPricePoint | null {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.config.maxStalenessMs) {
      return cached;
    }

    const consensus = this.getLONConsensus(symbol);
    if (!consensus) return null;

    const point: LONPricePoint = {
      symbol,
      price: consensus.price,
      timestamp: Date.now(),
      source: 'lon-oracle-consensus',
      confidence: consensus.confidence,
    };

    this.priceCache.set(symbol, point);
    return point;
  }

  getAllLONPrices(): LONConsensusData[] {
    const results: LONConsensusData[] = [];
    for (const symbol of this.config.supportedPairs) {
      const data = this.getLONConsensus(symbol);
      if (data) results.push(data);
    }
    return results;
  }

  getLONPriceHistory(symbol: string, limit: number = 50): LONPricePoint[] {
    const history = this.oracle.getPriceHistory(symbol, limit);
    return history.map(h => ({
      symbol: h.symbol,
      price: h.price,
      timestamp: h.timestamp,
      source: h.source,
      confidence: h.confidence,
    }));
  }

  detectLONAnomaly(symbol: string): { isAnomalous: boolean; deviation: number; threshold: number } | null {
    const deviation = this.oracle.detectDeviation(symbol);
    if (!deviation) return null;

    return {
      isAnomalous: deviation.isAnomalous,
      deviation: deviation.deviation,
      threshold: deviation.threshold,
    };
  }

  getValidatorReputation(validatorId: string): number {
    return this.oracle.getReputation(validatorId);
  }

  startAutoUpdate(callback: (prices: LONConsensusData[]) => void): void {
    this.updateTimer = setInterval(() => {
      const prices = this.getAllLONPrices();
      callback(prices);
    }, this.config.updateIntervalMs);
  }

  stopAutoUpdate(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  getOracleInstance(): NativeOracle {
    return this.oracle;
  }
}
