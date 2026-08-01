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
}

export class NativeOracle {
  private priceFeeds: Map<string, OraclePrice[]> = new Map();
  private validators: Set<string> = new Set();
  private minValidators: number = 3;
  private updateThreshold: number = 0.05;

  constructor(validatorAddresses: string[] = []) {
    for (const addr of validatorAddresses) {
      this.validators.add(addr);
    }
  }

  addValidator(address: string): void {
    this.validators.add(address);
  }

  removeValidator(address: string): void {
    this.validators.delete(address);
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

    const oraclePrice: OraclePrice = {
      symbol: update.symbol,
      price: update.price,
      timestamp: Date.now(),
      source: update.source,
      confidence: this._computeConfidence(existingPrices, update.price),
    };

    if (!this.priceFeeds.has(update.symbol)) {
      this.priceFeeds.set(update.symbol, []);
    }

    this.priceFeeds.get(update.symbol)!.push(oraclePrice);

    const maxPrices = 100;
    const prices = this.priceFeeds.get(update.symbol)!;
    if (prices.length > maxPrices) {
      this.priceFeeds.set(update.symbol, prices.slice(-maxPrices));
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

    return {
      symbol,
      price: medianPrice,
      medianPrice,
      spread,
      sources: recentPrices.length,
      timestamp: Date.now(),
    };
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

  private _computeConfidence(existingPrices: OraclePrice[], newPrice: number): number {
    if (existingPrices.length === 0) {
      return 0.5;
    }

    const recentPrices = existingPrices.slice(-10);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);

    const deviation = Math.abs(newPrice - avgPrice);
    const confidence = Math.max(0, Math.min(1, 1 - (deviation / (stdDev + 0.001))));

    return confidence;
  }

  getValidatorCount(): number {
    return this.validators.size;
  }

  isValidator(address: string): boolean {
    return this.validators.has(address);
  }
}