import { Injectable } from '@nestjs/common';
import {
  BridgeChain,
  BridgeToken,
  BridgeTransfer,
  BridgeValidator,
  BridgeStatus,
} from './bridge.types';

export const SUPPORTED_CHAINS: BridgeChain[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    bridgeContractAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://etherscan.io',
    isEVM: true,
    blockTime: 12,
    confirmations: 12,
  },
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
    chainId: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/',
    bridgeContractAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://polygonscan.com',
    isEVM: true,
    blockTime: 2,
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
    chainId: 199,
    name: 'LXON',
    nativeCurrency: { name: 'LXON', symbol: 'LXON', decimals: 18 },
    rpcUrl: 'https://rpc.lxon.com',
    bridgeContractAddress: '0x0000000000000000000000000000000000000000',
    explorerUrl: 'https://explorer.lxon.com',
    isEVM: true,
    blockTime: 2,
    confirmations: 1,
  },
];

export const SUPPORTED_TOKENS: BridgeToken[] = [
  { symbol: 'LXON', name: 'LXON', decimals: 18, logoUri: '/tokens/lxon.png' },
  { symbol: 'ETH', name: 'Ether', decimals: 18, logoUri: '/tokens/eth.png' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoUri: '/tokens/usdc.png' },
  { symbol: 'USDT', name: 'Tether', decimals: 6, logoUri: '/tokens/usdt.png' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoUri: '/tokens/wbtc.png' },
  { symbol: 'MATIC', name: 'Polygon', decimals: 18, logoUri: '/tokens/matic.png' },
  { symbol: 'BNB', name: 'BNB', decimals: 18, logoUri: '/tokens/bnb.png' },
  { symbol: 'AVAX', name: 'Avalanche', decimals: 18, logoUri: '/tokens/avax.png' },
];

@Injectable()
export class BridgeService {
  private transfers: Map<string, BridgeTransfer> = new Map();
  private validators: BridgeValidator[] = [];
  private minConfirmations = 1;
  private maxTransferAmount = '1000000';
  private feePercentage = 0.1;
  private listeners: Map<string, Set<(status: BridgeStatus) => void>> = new Map();

  getSupportedChains(): BridgeChain[] {
    return SUPPORTED_CHAINS;
  }

  getSupportedTokens(): BridgeToken[] {
    return SUPPORTED_TOKENS;
  }

  async initiateTransfer(params: {
    fromChainId: number;
    toChainId: number;
    tokenSymbol: string;
    amount: string;
    sender: string;
    recipient: string;
  }): Promise<BridgeTransfer> {
    const fromChain = SUPPORTED_CHAINS.find((c) => c.chainId === params.fromChainId);
    const toChain = SUPPORTED_CHAINS.find((c) => c.chainId === params.toChainId);
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === params.tokenSymbol);

    if (!fromChain || !toChain || !token) {
      throw new Error('Invalid chain or token');
    }

    const transfer: BridgeTransfer = {
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

  async getTransferStatus(transferId: string): Promise<BridgeTransfer | null> {
    return this.transfers.get(transferId) || null;
  }

  getTransferHistory(address: string): BridgeTransfer[] {
    return Array.from(this.transfers.values()).filter(
      (t) => t.sender === address || t.recipient === address
    );
  }

  async estimateFee(
    fromChainId: number,
    toChainId: number,
    amount: string
  ): Promise<string> {
    const fromChain = SUPPORTED_CHAINS.find((c) => c.chainId === fromChainId);
    if (!fromChain) throw new Error('Invalid source chain');

    const baseFee = parseFloat(amount) * this.feePercentage;
    const gasFee = 0.001;
    return (baseFee + gasFee).toFixed(6);
  }

  getValidators(): BridgeValidator[] {
    return this.validators;
  }

  addValidator(validator: BridgeValidator): void {
    this.validators.push(validator);
  }

  onStatusChange(callback: (status: BridgeStatus) => void): () => void {
    if (!this.listeners.has('status')) {
      this.listeners.set('status', new Set());
    }
    this.listeners.get('status')!.add(callback);
    return () => this.listeners.get('status')?.delete(callback);
  }

  private generateRandomHash(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data as BridgeStatus));
    }
  }
}
