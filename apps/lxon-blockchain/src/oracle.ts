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

export class NativeOracle {
  private priceFeeds: Map<string, OraclePrice[]> = new Map();
  private validators: Set<string> = new Set();
  private minValidators: number = 3;
  private updateThreshold: number = 0.05;
  private maxStalenessMs: number = 300000;
  private priceHistory: Map<string, OraclePrice[]> = new Map();
  private maxHistoryLength: number = 1000;
  private reputationScores: Map<string, number> = new Map();

  constructor(validatorAddresses: string[] = []) {
    for (const addr of validatorAddresses) {
      this.validators.add(addr);
      this.reputationScores.set(addr, 1.0);
    }
  }

  addValidator(address: string): void {
    this.validators.add(address);
    this.reputationScores.set(address, 1.0);
  }

  removeValidator(address: string): void {
    this.validators.delete(address);
    this.reputationScores.delete(address);
  }

  submitPriceUpdate(update: OracleUpdate, validatorId: string): { accepted: boolean; reason: string } {
    if (!this.validators.has(validatorId)) {
      return { accepted: false, reason: `Unknown validator: ${validatorId}` };
    }

    if (update.price <= 0) {
      return { accepted: false, reason: 'Invalid price' };
    }

    if (!update.signature || update.signature.length === 0) {
      return { accepted: false, reason: 'Missing validator signature' };
    }

    const existingPrices = this.priceFeeds.get(update.symbol) || [];

    if (existingPrices.length > 0) {
      const latestPrice = existingPrices[existingPrices.length - 1].price;
      const priceChange = Math.abs(update.price - latestPrice) / latestPrice;

      if (priceChange > this.updateThreshold) {
        return {
          accepted: false,
          reason: `Price change ${(priceChange * 100).toFixed(2)}% exceeds threshold ${(this.updateThreshold * 100)}%`,
        };
      }
    }

    const confidence = this._computeConfidence(existingPrices, update.price, validatorId);

    const oraclePrice: OraclePrice = {
      symbol: update.symbol,
      price: update.price,
      timestamp: Date.now(),
      source: update.source,
      confidence,
    };

    if (!this.priceFeeds.has(update.symbol)) {
      this.priceFeeds.set(update.symbol, []);
    }

    this.priceFeeds.get(update.symbol)!.push(oraclePrice);

    const history = this.priceHistory.get(update.symbol) || [];
    history.push(oraclePrice);
    this.priceHistory.set(update.symbol, history.slice(-this.maxHistoryLength));

    const prices = this.priceFeeds.get(update.symbol)!;
    if (prices.length > this.maxHistoryLength) {
      this.priceFeeds.set(update.symbol, prices.slice(-this.maxHistoryLength));
    }

    return { accepted: true, reason: 'Price update accepted' };
  }

  getConsensusPrice(symbol: string): ConsensusPrice | null {
    const prices = this.priceFeeds.get(symbol);
    if (!prices || prices.length < this.minValidators) {
      return null;
    }

    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)].price;

    const minPrice = sortedPrices[0].price;
    const maxPrice = sortedPrices[sortedPrices.length - 1].price;
    const spread = maxPrice - minPrice;

    const recentPrices = prices.filter(p => Date.now() - p.timestamp < 60000);
    const avgConfidence = recentPrices.length > 0
      ? recentPrices.reduce((sum, p) => sum + p.confidence, 0) / recentPrices.length
      : 0;

    const latestTimestamp = prices[prices.length - 1].timestamp;
    const staleness = Date.now() - latestTimestamp;

    return {
      symbol,
      price: medianPrice,
      medianPrice,
      spread,
      sources: recentPrices.length,
      timestamp: Date.now(),
      confidence: avgConfidence,
      staleness,
    };
  }

  getTWAP(symbol: string, windowMs: number = 3600000): number | null {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length === 0) return null;

    const cutoff = Date.now() - windowMs;
    const windowPrices = history.filter(p => p.timestamp >= cutoff);
    if (windowPrices.length === 0) return null;

    const sum = windowPrices.reduce((acc, p) => acc + p.price, 0);
    return sum / windowPrices.length;
  }

  getLatestPrice(symbol: string): OraclePrice | null {
    const prices = this.priceFeeds.get(symbol);
    if (!prices || prices.length === 0) {
      return null;
    }
    return prices[prices.length - 1];
  }

  getPriceHistory(symbol: string, limit: number = 10): OraclePrice[] {
    const prices = this.priceFeeds.get(symbol) || [];
    return prices.slice(-limit);
  }

  detectDeviation(symbol: string): PriceDeviation | null {
    const consensus = this.getConsensusPrice(symbol);
    if (!consensus) return null;

    const history = this.priceHistory.get(symbol) || [];
    if (history.length < 2) return null;

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    const deviation = Math.abs(latest.price - previous.price) / previous.price;

    return {
      symbol,
      deviation,
      threshold: this.updateThreshold,
      isAnomalous: deviation > this.updateThreshold,
    };
  }

  getValidatorCount(): number {
    return this.validators.size;
  }

  isValidator(address: string): boolean {
    return this.validators.has(address);
  }

  updateReputation(validatorId: string, score: number): void {
    if (this.reputationScores.has(validatorId)) {
      const current = this.reputationScores.get(validatorId)!;
      this.reputationScores.set(validatorId, current * 0.9 + score * 0.1);
    }
  }

  getReputation(validatorId: string): number {
    return this.reputationScores.get(validatorId) || 0;
  }

  isStale(symbol: string): boolean {
    const latest = this.getLatestPrice(symbol);
    if (!latest) return true;
    return Date.now() - latest.timestamp > this.maxStalenessMs;
  }

  private _computeConfidence(existingPrices: OraclePrice[], newPrice: number, validatorId: string): number {
    if (existingPrices.length === 0) {
      return 0.5;
    }

    const recentPrices = existingPrices.slice(-10);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);

    const deviation = Math.abs(newPrice - avgPrice);
    const statisticalConfidence = Math.max(0, Math.min(1, 1 - (deviation / (stdDev + 0.001))));

    const reputation = this.reputationScores.get(validatorId) || 0.5;
    return statisticalConfidence * 0.7 + reputation * 0.3;
  }
}
