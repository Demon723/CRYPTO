"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FounderCoinService = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const HeliosPBTv3_abi_json_1 = __importDefault(require("../../../../sdk/typescript/abis/HeliosPBTv3.abi.json"));
const HeliosCardRegistry_abi_json_1 = __importDefault(require("../../../../sdk/typescript/abis/HeliosCardRegistry.abi.json"));
class FounderCoinService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.FOUNDER_CONFIG.rpcUrl);
        if (config_1.FOUNDER_CONFIG.privateKey) {
            this.signer = new ethers_1.ethers.Wallet(config_1.FOUNDER_CONFIG.privateKey, this.provider);
        }
    }
    async init() {
        if (!this.signer) {
            throw new Error('Founder private key not configured');
        }
        if (!config_1.FOUNDER_CONFIG.pbtAddress) {
            throw new Error('HELIOS_PBT_ADDRESS not configured');
        }
        if (!config_1.FOUNDER_CONFIG.cardRegistryAddress) {
            throw new Error('HELIOS_CARD_REGISTRY_ADDRESS not configured');
        }
        this.pbt = new ethers_1.ethers.Contract(config_1.FOUNDER_CONFIG.pbtAddress, HeliosPBTv3_abi_json_1.default, this.signer);
        this.cardRegistry = new ethers_1.ethers.Contract(config_1.FOUNDER_CONFIG.cardRegistryAddress, HeliosCardRegistry_abi_json_1.default, this.signer);
    }
    isReady() {
        return !!this.signer && !!this.pbt && !!this.cardRegistry;
    }
    async activate(tokenId, reason) {
        if (!this.pbt)
            throw new Error('Service not initialized');
        try {
            const tx = await this.pbt.activate(tokenId);
            const receipt = await tx.wait();
            return {
                success: true,
                txHash: receipt.hash,
                action: config_1.LIFECYCLE_ACTIONS.ACTIVATE,
                tokenId,
            };
        }
        catch (error) {
            return {
                success: false,
                action: config_1.LIFECYCLE_ACTIONS.ACTIVATE,
                tokenId,
                error: error.message || 'Activation failed',
            };
        }
    }
    async freeze(tokenId, reason = 'Founder freeze') {
        if (!this.pbt)
            throw new Error('Service not initialized');
        try {
            const tx = await this.pbt.freeze(tokenId, reason);
            const receipt = await tx.wait();
            return {
                success: true,
                txHash: receipt.hash,
                action: config_1.LIFECYCLE_ACTIONS.FREEZE,
                tokenId,
            };
        }
        catch (error) {
            return {
                success: false,
                action: config_1.LIFECYCLE_ACTIONS.FREEZE,
                tokenId,
                error: error.message || 'Freeze failed',
            };
        }
    }
    async deactivate(tokenId, reason = 'Founder deactivate') {
        if (!this.pbt)
            throw new Error('Service not initialized');
        try {
            const tx = await this.pbt.deactivate(tokenId, reason);
            const receipt = await tx.wait();
            return {
                success: true,
                txHash: receipt.hash,
                action: config_1.LIFECYCLE_ACTIONS.DEACTIVATE,
                tokenId,
            };
        }
        catch (error) {
            return {
                success: false,
                action: config_1.LIFECYCLE_ACTIONS.DEACTIVATE,
                tokenId,
                error: error.message || 'Deactivation failed',
            };
        }
    }
    async registerCardholder(dto) {
        if (!this.cardRegistry)
            throw new Error('Service not initialized');
        try {
            const tx = await this.cardRegistry.registerCardholder(dto.tokenId, dto.nameHash, dto.kycHash);
            const receipt = await tx.wait();
            return {
                success: true,
                txHash: receipt.hash,
                action: 'register_cardholder',
                tokenId: dto.tokenId,
            };
        }
        catch (error) {
            return {
                success: false,
                action: 'register_cardholder',
                tokenId: dto.tokenId,
                error: error.message || 'Cardholder registration failed',
            };
        }
    }
    async getTokenStatus(tokenId) {
        if (!this.pbt)
            throw new Error('Service not initialized');
        const [status, boundWallet, isPremium] = await Promise.all([
            this.pbt.getTokenStatus(tokenId),
            this.pbt.getBoundWallet(tokenId),
            this.pbt.isPremium(tokenId),
        ]);
        return {
            status: Number(status).toString(),
            boundWallet,
            isPremium,
        };
    }
    async batchActivate(tokenIds) {
        const results = [];
        for (const tokenId of tokenIds) {
            results.push(await this.activate(tokenId));
        }
        return results;
    }
    async batchFreeze(tokenIds, reason) {
        const results = [];
        for (const tokenId of tokenIds) {
            results.push(await this.freeze(tokenId, reason));
        }
        return results;
    }
    async batchDeactivate(tokenIds, reason) {
        const results = [];
        for (const tokenId of tokenIds) {
            results.push(await this.deactivate(tokenId, reason));
        }
        return results;
    }
}
exports.FounderCoinService = FounderCoinService;
//# sourceMappingURL=coin-lifecycle.service.js.map