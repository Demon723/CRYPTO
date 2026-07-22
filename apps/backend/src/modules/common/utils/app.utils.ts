import { randomUUID } from 'crypto';
import { Chain, WalletType } from '../../../modules/wallets/entities/wallet.entity';
import { TransactionType, TransactionStatus } from '../../../modules/transactions/entities/transaction.entity';

export const generateId = (): string => randomUUID();

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const normalizeAddress = (address: string): string => {
  return address.toLowerCase().replace(/^0x/, '0x');
};

export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address || address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const isZeroAddress = (address: string): boolean => {
  const normalized = address.replace(/^0x/, '');
  return /^0+$/.test(normalized);
};

export const getChainName = (chain: Chain): string => {
  const chainNames: Record<Chain, string> = {
    [Chain.ETHEREUM]: 'Ethereum',
    [Chain.POLYGON]: 'Polygon',
    [Chain.BSC]: 'BNB Chain',
    [Chain.ARBITRUM]: 'Arbitrum',
    [Chain.BASE]: 'Base',
    [Chain.AVALANCHE]: 'Avalanche',
    [Chain.LXON]: 'LXON Chain',
  };
  return chainNames[chain] || chain;
};

export const getChainExplorer = (chain: Chain): string => {
  const explorers: Record<Chain, string> = {
    [Chain.ETHEREUM]: 'https://etherscan.io',
    [Chain.POLYGON]: 'https://polygonscan.com',
    [Chain.BSC]: 'https://bscscan.com',
    [Chain.ARBITRUM]: 'https://arbiscan.io',
    [Chain.BASE]: 'https://basescan.org',
    [Chain.AVALANCHE]: 'https://snowtrace.io',
    [Chain.LXON]: 'https://explorer.lxonevm.com',
  };
  return explorers[chain] || 'https://etherscan.io';
};

export const getChainCurrency = (chain: Chain): string => {
  const currencies: Record<Chain, string> = {
    [Chain.ETHEREUM]: 'ETH',
    [Chain.POLYGON]: 'MATIC',
    [Chain.BSC]: 'BNB',
    [Chain.ARBITRUM]: 'ETH',
    [Chain.BASE]: 'ETH',
    [Chain.AVALANCHE]: 'AVAX',
    [Chain.LXON]: 'LXON',
  };
  return currencies[chain] || 'ETH';
};

export const parseTransactionType = (type: string): TransactionType | undefined => {
  const normalized = type.toLowerCase().replace(/[^a-z]/g, '_');
  return Object.values(TransactionType).find((t) => t.toLowerCase().replace(/[^a-z]/g, '_') === normalized);
};

export const formatUsd = (value: number | string, decimals = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  if (isNaN(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const generateSecureRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (x) => chars[x % chars.length]).join('');
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const maskSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /(password|secret|token|key|api)/i.test(key)) {
      masked[key] = '***REDACTED***';
    } else {
      masked[key] = value;
    }
  }
  return masked;
};
