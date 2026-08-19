import { ethers } from 'ethers';
import { TokenState, Cardholder, TokenStatus, TokenTier } from '@lxon/helios-types';
import HeliosPBTv3Abi from '../../abis/HeliosPBTv3.abi.json';
import HeliosCardRegistryAbi from '../../abis/HeliosCardRegistry.abi.json';
import HeliosChipRegistryAbi from '../../abis/HeliosChipRegistry.abi.json';
import HeliosTBAccountAbi from '../../abis/HeliosTBAccount.abi.json';
import HeliosFactoryAbi from '../../abis/HeliosFactory.abi.json';

export interface HeliosConfig {
  pbtAddress: string;
  cardRegistryAddress: string;
  chipRegistryAddress: string;
  rpcUrl: string;
  signer?: ethers.Signer;
}

export class HeliosModule {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Signer | null;
  private pbt: ethers.Contract;
  private cardRegistry: ethers.Contract;
  private chipRegistry: ethers.Contract;

  constructor(config: HeliosConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = config.signer || null;
    this.pbt = new ethers.Contract(config.pbtAddress, HeliosPBTv3Abi, this.provider);
    this.cardRegistry = new ethers.Contract(config.cardRegistryAddress, HeliosCardRegistryAbi, this.provider);
    this.chipRegistry = new ethers.Contract(config.chipRegistryAddress, HeliosChipRegistryAbi, this.provider);
  }

  async connect(): Promise<void> {
    await this.provider.getNetwork();
  }

  isConnected(): boolean {
    return this.provider !== null;
  }

  // ============================================================
  // PBT Methods
  // ============================================================

  async getTokenState(tokenId: number): Promise<TokenState> {
    const state = await this.pbt.getTokenState(tokenId);
    return {
      tokenId: BigInt(state.tokenId),
      tapCount: BigInt(state.tapCount),
      lastTapTime: BigInt(state.lastTapTime),
      tier: Number(state.tier) as TokenTier,
      minted: state.minted,
      status: this.mapStatus(state.status),
      boundWallet: state.boundWallet,
      boundAt: BigInt(state.boundAt),
      tba: state.tba,
      isPremium: state.isPremium
    };
  }

  async isKeyValid(wallet: string): Promise<{ valid: boolean; tokenId: bigint }> {
    const [valid, tokenId] = await this.pbt.isKeyValid(wallet);
    return { valid, tokenId: BigInt(tokenId) };
  }

  async getBoundWallet(tokenId: number): Promise<string> {
    return await this.pbt.getBoundWallet(tokenId);
  }

  async getTBA(tokenId: number): Promise<string> {
    return await this.pbt.getTBA(tokenId);
  }

  async isPremium(tokenId: number): Promise<boolean> {
    return await this.pbt.isPremium(tokenId);
  }

  async getTokenStatus(tokenId: number): Promise<TokenStatus> {
    const status = await this.pbt.getTokenStatus(tokenId);
    return this.mapStatus(status);
  }

  // ============================================================
  // Card Registry Methods
  // ============================================================

  async getCardholder(tokenId: number): Promise<Cardholder> {
    const cardholder = await this.cardRegistry.getCardholder(tokenId);
    return {
      cardNumber: cardholder.cardNumber,
      nameHash: cardholder.nameHash,
      kycHash: cardholder.kycHash,
      registeredAt: BigInt(cardholder.registeredAt),
      registered: cardholder.registered
    };
  }

  async isRegistered(tokenId: number): Promise<boolean> {
    return await this.cardRegistry.isRegistered(tokenId);
  }

  async getTokenByCard(cardNumber: string): Promise<bigint> {
    const tokenId = await this.cardRegistry.getTokenByCard(cardNumber);
    return BigInt(tokenId);
  }

  // ============================================================
  // Chip Registry Methods
  // ============================================================

  async verifyChipSignature(tokenId: number, hash: string, signature: string): Promise<boolean> {
    return await this.chipRegistry.verifyChipSignature(tokenId, hash, signature);
  }

  async isNonceUsed(chipPublicKey: string, nonce: number): Promise<boolean> {
    return await this.chipRegistry.isNonceUsed(chipPublicKey, nonce);
  }

  // ============================================================
  // TBA Methods
  // ============================================================

  async getTBABalance(tokenId: number): Promise<bigint> {
    const tbaAddress = await this.pbt.getTBA(tokenId);
    if (tbaAddress === ethers.ZeroAddress) return 0n;
    const balance = await this.provider.getBalance(tbaAddress);
    return balance;
  }

  async getTBAContract(tokenId: number): Promise<ethers.Contract> {
    const tbaAddress = await this.pbt.getTBA(tokenId);
    if (tbaAddress === ethers.ZeroAddress) {
      throw new Error('No TBA for this token');
    }
    return new ethers.Contract(tbaAddress, HeliosTBAccountAbi, this.provider);
  }

  // ============================================================
  // Transaction Builders
  // ============================================================

  buildBindWalletMessage(tokenId: number, wallet: string, nonce: number, chainId: number): string {
    const hash = ethers.solidityPackedKeccak256(
      ['uint256', 'address', 'uint256', 'uint256'],
      [tokenId, wallet, nonce, chainId]
    );
    return ethers.hashMessage(ethers.getBytes(hash));
  }

  buildTapToPayMessage(
    tokenId: number,
    to: string,
    value: bigint,
    data: string,
    nonce: number,
    chainId: number
  ): string {
    const dataHash = ethers.keccak256(data);
    const hash = ethers.solidityPackedKeccak256(
      ['string', 'uint256', 'address', 'uint256', 'bytes32', 'uint256', 'uint256'],
      ['PAY', tokenId, to, value, dataHash, nonce, chainId]
    );
    return ethers.hashMessage(ethers.getBytes(hash));
  }

  buildTransferMessage(tokenId: number, to: string, nonce: number, chainId: number): string {
    const hash = ethers.solidityPackedKeccak256(
      ['uint256', 'address', 'uint256', 'uint256'],
      [tokenId, to, nonce, chainId]
    );
    return ethers.hashMessage(ethers.getBytes(hash));
  }

  // ============================================================
  // Event Queries
  // ============================================================

  async queryEvents(eventName: string, fromBlock: number, toBlock: number, args?: any[]): Promise<ethers.Log[]> {
    const filter = this.pbt.getFilter(eventName, ...(args || []));
    return await this.provider.getLogs({
      ...filter,
      fromBlock,
      toBlock
    });
  }

  async getTappedEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]> {
    return this.queryEvents('Tapped', fromBlock, toBlock, [tokenId]);
  }

  async getWalletBoundEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]> {
    return this.queryEvents('WalletBound', fromBlock, toBlock, [tokenId]);
  }

  async getTapToPayEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]> {
    return this.queryEvents('TapToPay', fromBlock, toBlock, [tokenId]);
  }

  async getPremiumDepositEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]> {
    return this.queryEvents('PremiumDeposit', fromBlock, toBlock, [tokenId]);
  }

  // ============================================================
  // Helpers
  // ============================================================

  private mapStatus(status: number): TokenStatus {
    switch (status) {
      case 0: return 'INACTIVE';
      case 1: return 'ACTIVE';
      case 2: return 'FROZEN';
      case 3: return 'DEACTIVATED';
      default: return 'INACTIVE';
    }
  }
}
