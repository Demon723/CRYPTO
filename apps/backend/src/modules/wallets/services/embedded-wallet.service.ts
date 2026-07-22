// @ts-nocheck
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { Chain, WalletType, WalletEntity } from '../entities/wallet.entity';
import { CreateEmbeddedWalletDto } from '../dto/embedded-wallet.dto';
import crypto from 'crypto';

@Injectable()
export class EmbeddedWalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createEmbeddedWallet(
    userId: string,
    dto: CreateEmbeddedWalletDto,
  ): Promise<WalletEntity> {
    const seed = this.generateUserSeed(userId, dto.chain);
    const address = this.deriveAddress(seed, dto.chain);

    const existing = await this.prisma.wallet.findFirst({
      where: { userId, type: WalletType.EMBEDDED, chain: dto.chain },
    });

    if (existing) {
      throw new ConflictException('Embedded wallet already exists for this chain');
    }

    const recoveryShard = this.generateRecoveryShard(seed, dto.recoveryMethod);
    const encryptedShard = this.encryptShard(recoveryShard, userId);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        address,
        chain: dto.chain,
        label: dto.label || `${dto.chain} Embedded Wallet`,
        type: WalletType.EMBEDDED,
        isWatchOnly: false,
        recoveryMethod: dto.recoveryMethod,
        recoveryEncryptedShard: encryptedShard,
      },
    });

    return wallet;
  }

  async recoverEmbeddedWallet(userId: string, recoveryKey: string): Promise<string> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { userId, type: WalletType.EMBEDDED },
    });

    if (!wallet) {
      throw new BadRequestException('No embedded wallet found');
    }

    const decrypted = this.decryptShard(wallet.recoveryEncryptedShard!, recoveryKey);
    const recoveredAddress = this.deriveAddress(decrypted, wallet.chain);

    if (recoveredAddress !== wallet.address) {
      throw new BadRequestException('Invalid recovery key');
    }

    return wallet.address;
  }

  private generateUserSeed(userId: string, chain: Chain): Buffer {
    return crypto.createHmac('sha256', 'synex-embedded-wallet-v1')
      .update(`${userId}:${chain}`)
      .digest();
  }

  private deriveAddress(seed: Buffer, chain: Chain): string {
    if ([Chain.ETHEREUM, Chain.POLYGON, Chain.BSC, Chain.ARBITRUM, Chain.BASE, Chain.AVALANCHE, Chain.LXON].includes(chain)) {
      const hash = crypto.createHash('sha256').update(seed).digest('hex');
      return '0x' + hash.slice(0, 40);
    }
    throw new BadRequestException(`Chain ${chain} not supported for embedded wallets yet`);
  }

  private generateRecoveryShard(seed: Buffer, method: string): string {
    const shard = crypto.createHmac('sha256', method).update(seed).digest('hex');
    return shard;
  }

  private encryptShard(shard: string, userId: string): string {
    const key = crypto.scryptSync(userId, 'synex-encryption', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(shard, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decryptShard(encrypted: string, recoveryKey: string): Buffer {
    const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
    const key = crypto.scryptSync(recoveryKey, 'synex-encryption', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return Buffer.from(decrypted, 'hex');
  }
}
