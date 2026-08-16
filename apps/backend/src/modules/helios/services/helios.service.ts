import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { BindWalletDto, TapToPayDto, RegisterCardholderDto, DepositToTbaDto, FounderActivateDto, FounderFreezeDto, FounderDeactivateDto } from '../dto/helios.dto';

@Injectable()
export class HeliosService {
  private provider: ethers.JsonRpcProvider;
  private pbt!: ethers.Contract;
  private cardRegistry!: ethers.Contract;
  private chipRegistry!: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
  }

  setContracts(pbtAddress: string, cardRegistryAddress: string, chipRegistryAddress: string, pbtAbi: any, cardAbi: any, chipAbi: any) {
    this.pbt = new ethers.Contract(pbtAddress, pbtAbi, this.provider);
    this.cardRegistry = new ethers.Contract(cardRegistryAddress, cardAbi, this.provider);
    this.chipRegistry = new ethers.Contract(chipRegistryAddress, chipAbi, this.provider);
  }

  async getTokenState(tokenId: number): Promise<any> {
    this.ensurePbt();
    try {
      return await this.pbt.getTokenState(tokenId);
    } catch (error) {
      throw new NotFoundException('Token not found');
    }
  }

  async isKeyValid(wallet: string): Promise<{ valid: boolean; tokenId: number }> {
    this.ensurePbt();
    const [valid, tokenId] = await this.pbt.isKeyValid(wallet);
    return { valid, tokenId: Number(tokenId) };
  }

  async getCardholder(tokenId: number): Promise<any> {
    this.ensureCardRegistry();
    try {
      return await this.cardRegistry.getCardholder(tokenId);
    } catch (error) {
      throw new NotFoundException('Cardholder not found');
    }
  }

  async registerCardholder(dto: RegisterCardholderDto): Promise<any> {
    this.ensureCardRegistry();
    // Founder-only endpoint - in production, verify caller is founder
    const tx = await this.cardRegistry.registerCardholder(
      dto.tokenId,
      dto.nameHash,
      dto.kycHash
    );
    return { txHash: tx.hash };
  }

  async bindWallet(dto: BindWalletDto): Promise<any> {
    this.ensurePbt();
    // Verify chip signature first
    const valid = await this.chipRegistry.verifyChipSignature(
      dto.tokenId,
      ethers.keccak256(ethers.toUtf8Bytes(dto.chipSignature)),
      dto.chipSignature
    );
    if (!valid) {
      throw new BadRequestException('Invalid chip signature');
    }

    const tx = await this.pbt.bindWallet(
      dto.tokenId,
      dto.wallet,
      dto.nonce,
      dto.chipSignature
    );
    return { txHash: tx.hash };
  }

  async tapToPay(dto: TapToPayDto): Promise<any> {
    this.ensurePbt();
    const dataHash = ethers.keccak256(dto.data);
    const hash = ethers.solidityPackedKeccak256(
      ['string', 'uint256', 'address', 'uint256', 'bytes32', 'uint256', 'uint256'],
      ['PAY', dto.tokenId, dto.to, dto.value, dataHash, dto.nonce, (await this.provider.getNetwork()).chainId]
    );
    const ethHash = ethers.hashMessage(ethers.getBytes(hash));

    const valid = await this.chipRegistry.verifyChipSignature(dto.tokenId, ethHash, dto.chipSignature);
    if (!valid) {
      throw new BadRequestException('Invalid chip signature');
    }

    const tx = await this.pbt.tapToPay(
      dto.tokenId,
      dto.to,
      dto.value,
      dto.data,
      dto.nonce,
      dto.chipSignature
    );
    return { txHash: tx.hash };
  }

  async depositToTba(dto: DepositToTbaDto): Promise<any> {
    this.ensurePbt();
    const tx = await this.pbt.depositToTBA(dto.tokenId, { value: dto.amount });
    return { txHash: tx.hash };
  }

  async founderActivate(dto: FounderActivateDto): Promise<any> {
    this.ensurePbt();
    const tx = await this.pbt.activate(dto.tokenId);
    return { txHash: tx.hash };
  }

  async founderFreeze(dto: FounderFreezeDto): Promise<any> {
    this.ensurePbt();
    const tx = await this.pbt.freeze(dto.tokenId, dto.reason);
    return { txHash: tx.hash };
  }

  async founderDeactivate(dto: FounderDeactivateDto): Promise<any> {
    this.ensurePbt();
    const tx = await this.pbt.deactivate(dto.tokenId, dto.reason);
    return { txHash: tx.hash };
  }

  private ensurePbt(): void {
    if (!this.pbt) throw new NotFoundException('PBT contract not configured');
  }

  private ensureCardRegistry(): void {
    if (!this.cardRegistry) throw new NotFoundException('Card registry not configured');
  }
}
