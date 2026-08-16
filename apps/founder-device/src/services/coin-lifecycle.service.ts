import { ethers } from 'ethers';
import { FOUNDER_CONFIG, LIFECYCLE_ACTIONS } from '../config';
import HeliosPBTv3Abi from '../../../../sdk/typescript/abis/HeliosPBTv3.abi.json';
import HeliosCardRegistryAbi from '../../../../sdk/typescript/abis/HeliosCardRegistry.abi.json';

export interface CoinLifecycleResult {
  success: boolean;
  txHash?: string;
  action: string;
  tokenId: number;
  error?: string;
}

export interface CardholderRegistration {
  tokenId: number;
  nameHash: string;
  kycHash: string;
}

export class FounderCoinService {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private pbt?: ethers.Contract;
  private cardRegistry?: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(FOUNDER_CONFIG.rpcUrl);
    if (FOUNDER_CONFIG.privateKey) {
      this.signer = new ethers.Wallet(FOUNDER_CONFIG.privateKey, this.provider);
    }
  }

  async init() {
    if (!this.signer) {
      throw new Error('Founder private key not configured');
    }
    if (!FOUNDER_CONFIG.pbtAddress) {
      throw new Error('HELIOS_PBT_ADDRESS not configured');
    }
    if (!FOUNDER_CONFIG.cardRegistryAddress) {
      throw new Error('HELIOS_CARD_REGISTRY_ADDRESS not configured');
    }

    this.pbt = new ethers.Contract(
      FOUNDER_CONFIG.pbtAddress,
      HeliosPBTv3Abi,
      this.signer
    );
    this.cardRegistry = new ethers.Contract(
      FOUNDER_CONFIG.cardRegistryAddress,
      HeliosCardRegistryAbi,
      this.signer
    );
  }

  isReady(): boolean {
    return !!this.signer && !!this.pbt && !!this.cardRegistry;
  }

  async activate(tokenId: number, reason?: string): Promise<CoinLifecycleResult> {
    if (!this.pbt) throw new Error('Service not initialized');
    try {
      const tx = await this.pbt.activate(tokenId);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        action: LIFECYCLE_ACTIONS.ACTIVATE,
        tokenId,
      };
    } catch (error: any) {
      return {
        success: false,
        action: LIFECYCLE_ACTIONS.ACTIVATE,
        tokenId,
        error: error.message || 'Activation failed',
      };
    }
  }

  async freeze(tokenId: number, reason: string = 'Founder freeze'): Promise<CoinLifecycleResult> {
    if (!this.pbt) throw new Error('Service not initialized');
    try {
      const tx = await this.pbt.freeze(tokenId, reason);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        action: LIFECYCLE_ACTIONS.FREEZE,
        tokenId,
      };
    } catch (error: any) {
      return {
        success: false,
        action: LIFECYCLE_ACTIONS.FREEZE,
        tokenId,
        error: error.message || 'Freeze failed',
      };
    }
  }

  async deactivate(tokenId: number, reason: string = 'Founder deactivate'): Promise<CoinLifecycleResult> {
    if (!this.pbt) throw new Error('Service not initialized');
    try {
      const tx = await this.pbt.deactivate(tokenId, reason);
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        action: LIFECYCLE_ACTIONS.DEACTIVATE,
        tokenId,
      };
    } catch (error: any) {
      return {
        success: false,
        action: LIFECYCLE_ACTIONS.DEACTIVATE,
        tokenId,
        error: error.message || 'Deactivation failed',
      };
    }
  }

  async registerCardholder(dto: CardholderRegistration): Promise<CoinLifecycleResult> {
    if (!this.cardRegistry) throw new Error('Service not initialized');
    try {
      const tx = await this.cardRegistry.registerCardholder(
        dto.tokenId,
        dto.nameHash,
        dto.kycHash
      );
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        action: 'register_cardholder',
        tokenId: dto.tokenId,
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'register_cardholder',
        tokenId: dto.tokenId,
        error: error.message || 'Cardholder registration failed',
      };
    }
  }

  async getTokenStatus(tokenId: number): Promise<{ status: string; boundWallet: string; isPremium: boolean }> {
    if (!this.pbt) throw new Error('Service not initialized');
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

  async batchActivate(tokenIds: number[]): Promise<CoinLifecycleResult[]> {
    const results: CoinLifecycleResult[] = [];
    for (const tokenId of tokenIds) {
      results.push(await this.activate(tokenId));
    }
    return results;
  }

  async batchFreeze(tokenIds: number[], reason: string): Promise<CoinLifecycleResult[]> {
    const results: CoinLifecycleResult[] = [];
    for (const tokenId of tokenIds) {
      results.push(await this.freeze(tokenId, reason));
    }
    return results;
  }

  async batchDeactivate(tokenIds: number[], reason: string): Promise<CoinLifecycleResult[]> {
    const results: CoinLifecycleResult[] = [];
    for (const tokenId of tokenIds) {
      results.push(await this.deactivate(tokenId, reason));
    }
    return results;
  }
}
