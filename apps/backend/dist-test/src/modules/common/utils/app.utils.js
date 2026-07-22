"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSensitiveData = exports.isValidUrl = exports.sanitizeString = exports.generateSecureRandomString = exports.throttle = exports.debounce = exports.chunkArray = exports.sleep = exports.formatPercentage = exports.formatUsd = exports.parseTransactionType = exports.getChainCurrency = exports.getChainExplorer = exports.getChainName = exports.isZeroAddress = exports.truncateAddress = exports.normalizeAddress = exports.isValidEthereumAddress = exports.generateId = void 0;
const crypto_1 = require("crypto");
const wallet_entity_1 = require("../../../modules/wallets/entities/wallet.entity");
const transaction_entity_1 = require("../../../modules/transactions/entities/transaction.entity");
const generateId = () => (0, crypto_1.randomUUID)();
exports.generateId = generateId;
const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
exports.isValidEthereumAddress = isValidEthereumAddress;
const normalizeAddress = (address) => {
    return address.toLowerCase().replace(/^0x/, '0x');
};
exports.normalizeAddress = normalizeAddress;
const truncateAddress = (address, startLength = 6, endLength = 4) => {
    if (!address || address.length < startLength + endLength)
        return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};
exports.truncateAddress = truncateAddress;
const isZeroAddress = (address) => {
    const normalized = address.replace(/^0x/, '');
    return /^0+$/.test(normalized);
};
exports.isZeroAddress = isZeroAddress;
const getChainName = (chain) => {
    const chainNames = {
        [wallet_entity_1.Chain.ETHEREUM]: 'Ethereum',
        [wallet_entity_1.Chain.POLYGON]: 'Polygon',
        [wallet_entity_1.Chain.BSC]: 'BNB Chain',
        [wallet_entity_1.Chain.ARBITRUM]: 'Arbitrum',
        [wallet_entity_1.Chain.BASE]: 'Base',
        [wallet_entity_1.Chain.AVALANCHE]: 'Avalanche',
        [wallet_entity_1.Chain.LXON]: 'LXON Chain',
    };
    return chainNames[chain] || chain;
};
exports.getChainName = getChainName;
const getChainExplorer = (chain) => {
    const explorers = {
        [wallet_entity_1.Chain.ETHEREUM]: 'https://etherscan.io',
        [wallet_entity_1.Chain.POLYGON]: 'https://polygonscan.com',
        [wallet_entity_1.Chain.BSC]: 'https://bscscan.com',
        [wallet_entity_1.Chain.ARBITRUM]: 'https://arbiscan.io',
        [wallet_entity_1.Chain.BASE]: 'https://basescan.org',
        [wallet_entity_1.Chain.AVALANCHE]: 'https://snowtrace.io',
        [wallet_entity_1.Chain.LXON]: 'https://explorer.lxonevm.com',
    };
    return explorers[chain] || 'https://etherscan.io';
};
exports.getChainExplorer = getChainExplorer;
const getChainCurrency = (chain) => {
    const currencies = {
        [wallet_entity_1.Chain.ETHEREUM]: 'ETH',
        [wallet_entity_1.Chain.POLYGON]: 'MATIC',
        [wallet_entity_1.Chain.BSC]: 'BNB',
        [wallet_entity_1.Chain.ARBITRUM]: 'ETH',
        [wallet_entity_1.Chain.BASE]: 'ETH',
        [wallet_entity_1.Chain.AVALANCHE]: 'AVAX',
        [wallet_entity_1.Chain.LXON]: 'LXON',
    };
    return currencies[chain] || 'ETH';
};
exports.getChainCurrency = getChainCurrency;
const parseTransactionType = (type) => {
    const normalized = type.toLowerCase().replace(/[^a-z]/g, '_');
    return Object.values(transaction_entity_1.TransactionType).find((t) => t.toLowerCase().replace(/[^a-z]/g, '_') === normalized);
};
exports.parseTransactionType = parseTransactionType;
const formatUsd = (value, decimals = 2) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num))
        return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};
exports.formatUsd = formatUsd;
const formatPercentage = (value, decimals = 2) => {
    if (isNaN(value))
        return '0.00%';
    return `${value.toFixed(decimals)}%`;
};
exports.formatPercentage = formatPercentage;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};
exports.chunkArray = chunkArray;
const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};
exports.throttle = throttle;
const generateSecureRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (x) => chars[x % chars.length]).join('');
};
exports.generateSecureRandomString = generateSecureRandomString;
const sanitizeString = (input) => {
    return input.trim().replace(/\s+/g, ' ');
};
exports.sanitizeString = sanitizeString;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
const maskSensitiveData = (data) => {
    const masked = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && /(password|secret|token|key|api)/i.test(key)) {
            masked[key] = '***REDACTED***';
        }
        else {
            masked[key] = value;
        }
    }
    return masked;
};
exports.maskSensitiveData = maskSensitiveData;
//# sourceMappingURL=app.utils.js.map