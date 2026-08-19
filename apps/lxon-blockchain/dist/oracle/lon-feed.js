"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LONPriceFeed = void 0;
const oracle_1 = require("../oracle");
class LONPriceFeed {
    oracle;
    config;
    lonValidators = new Set();
    priceCache = new Map();
    updateTimer = null;
    constructor(validatorAddresses = [], config = {}) {
        this.oracle = new oracle_1.NativeOracle(validatorAddresses);
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
    addLONValidator(address) {
        this.lonValidators.add(address);
        this.oracle.addValidator(address);
    }
    removeLONValidator(address) {
        this.lonValidators.delete(address);
        this.oracle.removeValidator(address);
    }
    submitLONPrice(symbol, price, source, validatorId, signature) {
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
    getLONConsensus(symbol) {
        const consensus = this.oracle.getConsensusPrice(symbol);
        if (!consensus)
            return null;
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
    getLONPrice(symbol) {
        const cached = this.priceCache.get(symbol);
        if (cached && Date.now() - cached.timestamp < this.config.maxStalenessMs) {
            return cached;
        }
        const consensus = this.getLONConsensus(symbol);
        if (!consensus)
            return null;
        const point = {
            symbol,
            price: consensus.price,
            timestamp: Date.now(),
            source: 'lon-oracle-consensus',
            confidence: consensus.confidence,
        };
        this.priceCache.set(symbol, point);
        return point;
    }
    getAllLONPrices() {
        const results = [];
        for (const symbol of this.config.supportedPairs) {
            const data = this.getLONConsensus(symbol);
            if (data)
                results.push(data);
        }
        return results;
    }
    getLONPriceHistory(symbol, limit = 50) {
        const history = this.oracle.getPriceHistory(symbol, limit);
        return history.map(h => ({
            symbol: h.symbol,
            price: h.price,
            timestamp: h.timestamp,
            source: h.source,
            confidence: h.confidence,
        }));
    }
    detectLONAnomaly(symbol) {
        const deviation = this.oracle.detectDeviation(symbol);
        if (!deviation)
            return null;
        return {
            isAnomalous: deviation.isAnomalous,
            deviation: deviation.deviation,
            threshold: deviation.threshold,
        };
    }
    getValidatorReputation(validatorId) {
        return this.oracle.getReputation(validatorId);
    }
    startAutoUpdate(callback) {
        this.updateTimer = setInterval(() => {
            const prices = this.getAllLONPrices();
            callback(prices);
        }, this.config.updateIntervalMs);
    }
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    getOracleInstance() {
        return this.oracle;
    }
}
exports.LONPriceFeed = LONPriceFeed;
