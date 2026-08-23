"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeService = exports.SUPPORTED_TOKENS = exports.SUPPORTED_CHAINS = void 0;
const common_1 = require("@nestjs/common");
exports.SUPPORTED_CHAINS = [
    {
        chainId: 10,
        name: 'Optimism',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrl: 'https://optimism-mainnet.g.alchemy.com/v2/',
        bridgeContractAddress: '0x0000000000000000000000000000000000000000',
        explorerUrl: 'https://optimistic.etherscan.io',
        isEVM: true,
        blockTime: 2,
        confirmations: 1,
    },
    {
        chainId: 42161,
        name: 'Arbitrum One',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/',
        bridgeContractAddress: '0x0000000000000000000000000000000000000000',
        explorerUrl: 'https://arbiscan.io',
        isEVM: true,
        blockTime: 0.25,
        confirmations: 1,
    },
    {
        chainId: 56,
        name: 'BNB Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        bridgeContractAddress: '0x0000000000000000000000000000000000000000',
        explorerUrl: 'https://bscscan.com',
        isEVM: true,
        blockTime: 3,
        confirmations: 1,
    },
    {
        chainId: 43114,
        name: 'Avalanche',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        bridgeContractAddress: '0x0000000000000000000000000000000000000000',
        explorerUrl: 'https://snowtrace.io',
        isEVM: true,
        blockTime: 2,
        confirmations: 1,
    },
     {
         chainId: 5454,
         name: 'LXON',
         nativeCurrency: { name: 'LXON', symbol: 'LXON', decimals: 18 },
         rpcUrl: process.env.LXON_RPC_URL || 'http://localhost:8545',
         bridgeContractAddress: '0x0000000000000000000000000000000000000000',
         explorerUrl: 'https://explorer.lxon.com',
         isEVM: true,
         blockTime: 2,
         confirmations: 1,
     },
];
exports.SUPPORTED_TOKENS = [
    { symbol: 'LXON', name: 'LXON', decimals: 18, logoUri: '/tokens/lxon.png' },
    { symbol: 'ETH', name: 'Ether', decimals: 18, logoUri: '/tokens/eth.png' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoUri: '/tokens/usdc.png' },
    { symbol: 'USDT', name: 'Tether', decimals: 6, logoUri: '/tokens/usdt.png' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoUri: '/tokens/wbtc.png' },
    { symbol: 'MATIC', name: 'Polygon', decimals: 18, logoUri: '/tokens/matic.png' },
    { symbol: 'BNB', name: 'BNB', decimals: 18, logoUri: '/tokens/bnb.png' },
    { symbol: 'AVAX', name: 'Avalanche', decimals: 18, logoUri: '/tokens/avax.png' },
];
let BridgeService = class BridgeService {
    constructor() {
        this.transfers = new Map();
        this.validators = [];
        this.minConfirmations = 1;
        this.maxTransferAmount = '1000000';
        this.feePercentage = 0.1;
        this.listeners = new Map();
    }
    getSupportedChains() {
        return exports.SUPPORTED_CHAINS;
    }
    getSupportedTokens() {
        return exports.SUPPORTED_TOKENS;
    }
    async initiateTransfer(params) {
        const fromChain = exports.SUPPORTED_CHAINS.find((c) => c.chainId === params.fromChainId);
        const toChain = exports.SUPPORTED_CHAINS.find((c) => c.chainId === params.toChainId);
        const token = exports.SUPPORTED_TOKENS.find((t) => t.symbol === params.tokenSymbol);
        if (!fromChain || !toChain || !token) {
            throw new Error('Invalid chain or token');
        }
        const transfer = {
            id: 'bridge_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            fromChain,
            toChain,
            token,
            amount: params.amount,
            sender: params.sender,
            recipient: params.recipient,
            status: 'pending',
            timestamp: Date.now(),
        };
        this.transfers.set(transfer.id, transfer);
        transfer.status = 'locked';
        transfer.fromTxHash = '0x' + this.generateRandomHash();
        this.emit('status', 'locked');
        await new Promise((resolve) => setTimeout(resolve, fromChain.confirmations * 100));
        transfer.status = 'completed';
        transfer.completedAt = Date.now();
        transfer.toTxHash = '0x' + this.generateRandomHash();
        this.emit('status', 'completed');
        this.emit('status', 'idle');
        return transfer;
    }
    async getTransferStatus(transferId) {
        return this.transfers.get(transferId) || null;
    }
    getTransferHistory(address) {
        return Array.from(this.transfers.values()).filter((t) => t.sender === address || t.recipient === address);
    }
    async estimateFee(fromChainId, toChainId, amount) {
        const fromChain = exports.SUPPORTED_CHAINS.find((c) => c.chainId === fromChainId);
        if (!fromChain)
            throw new Error('Invalid source chain');
        const baseFee = parseFloat(amount) * this.feePercentage;
        const gasFee = 0.001;
        return (baseFee + gasFee).toFixed(6);
    }
    getValidators() {
        return this.validators;
    }
    addValidator(validator) {
        this.validators.push(validator);
    }
    onStatusChange(callback) {
        if (!this.listeners.has('status')) {
            this.listeners.set('status', new Set());
        }
        this.listeners.get('status').add(callback);
        return () => this.listeners.get('status')?.delete(callback);
    }
    generateRandomHash() {
        return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
    }
};
exports.BridgeService = BridgeService;
exports.BridgeService = BridgeService = __decorate([
    (0, common_1.Injectable)()
], BridgeService);
//# sourceMappingURL=bridge.service.js.map