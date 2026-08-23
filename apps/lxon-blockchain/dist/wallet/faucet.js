"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetService = void 0;
const send_1 = require("./send");
class FaucetService {
    pool;
    config;
    claims = new Map();
    constructor(pool, config = {}) {
        this.pool = pool;
        this.config = {
            amount: 1000000000000000000n,
            cooldownMs: 24 * 60 * 60 * 1000,
            maxPerDay: 3,
            ...config,
        };
    }
    request(address) {
        const now = Date.now();
        const today = Math.floor(now / (24 * 60 * 60 * 1000));
        const userClaims = this.claims.get(address) || [];
        const recentClaims = userClaims.filter(ts => today - Math.floor(ts / (24 * 60 * 60 * 1000)) < 1);
        if (recentClaims.length >= this.config.maxPerDay) {
            return { success: false, reason: 'Daily limit exceeded' };
        }
        const lastClaim = recentClaims[recentClaims.length - 1] || 0;
        if (now - lastClaim < this.config.cooldownMs) {
            return { success: false, reason: 'Cooldown period active' };
        }
        const result = (0, send_1.faucetRequest)(this.pool, address, this.config.amount);
        if (result.status === 'pending') {
            userClaims.push(now);
            this.claims.set(address, userClaims);
            return { success: true, txHash: result.hash };
        }
        return { success: false, reason: result.reason };
    }
    getClaimHistory(address) {
        const userClaims = this.claims.get(address) || [];
        return userClaims.map(ts => ({
            timestamp: ts,
            txHash: '0x' + '0'.repeat(64),
        }));
    }
}
exports.FaucetService = FaucetService;
