// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { WalletEntity, WalletWithBalance, WalletCreateDto, Chain, WalletType } from '../entities/wallet.entity';
import { isValidEthereumAddress, normalizeAddress, truncateAddress } from '../../common/utils/app.utils';
import { TokenBalance } from '@prisma/client';

@Injectable()
export class WalletsService {
  private readonly logger = new LoggerService();
  private readonly rpcUrls: Record<Chain, string> = {
    [Chain.ETHEREUM]: process.env.ETHEREUM_RPC_URL || '',
    [Chain.POLYGON]: process.env.POLYGON_RPC_URL || '',
    [Chain.BSC]: process.env.BSC_RPC_URL || '',
    [Chain.ARBITRUM]: process.env.ARBITRUM_RPC_URL || '',
    [Chain.BASE]: process.env.BASE_RPC_URL || '',
    [Chain.AVALANCHE]: process.env.AVALANCHE_RPC_URL || '',
    [Chain.LXON]: process.env.LXON_RPC_URL || 'https://rpc.lxonevm.com',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getUserWallets(userId: string): Promise<WalletEntity[]> {
    return this.prisma.wallet.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWalletById(userId: string, walletId: string): Promise<WalletEntity> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async createWallet(userId: string, dto: WalletCreateDto): Promise<WalletEntity> {
    const normalizedAddress = normalizeAddress(dto.address);

    if (!isValidEthereumAddress(normalizedAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    const existing = await this.prisma.wallet.findFirst({
      where: {
        userId,
        address: normalizedAddress,
        chain: dto.chain,
      },
    });

    if (existing) {
      throw new ConflictException('Wallet already added for this chain');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        address: normalizedAddress,
        chain: dto.chain,
        label: dto.label || truncateAddress(normalizedAddress),
        type: dto.type || WalletType.EOA,
        isWatchOnly: dto.isWatchOnly || false,
      },
    });

    this.logger.log(`Wallet created: ${normalizedAddress} for user ${userId}`, 'WalletsService');

    return wallet;
  }

  async deleteWallet(userId: string, walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.prisma.wallet.update({
      where: { id: walletId },
      data: { isActive: false },
    });

    this.logger.log(`Wallet deactivated: ${wallet.address}`, 'WalletsService');
  }

  async syncWalletBalances(walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    this.logger.log(`Syncing balances for wallet: ${wallet.address}`, 'WalletsService');

    try {
      const balances = await this.fetchTokenBalances(wallet.address, wallet.chain);
      await this.prisma.tokenBalance.deleteMany({ where: { walletId } });
      await this.prisma.tokenBalance.createMany({
        data: balances.map((b) => ({
          ...b,
          walletId,
        })),
      });

      await this.prisma.wallet.update({
        where: { id: walletId },
        data: { lastSyncAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`Failed to sync balances for wallet ${walletId}`, error, 'WalletsService');
      throw new BadRequestException('Failed to sync wallet balances');
    }
  }

  async getWalletWithBalances(userId: string, walletId: string): Promise<WalletWithBalance> {
    const wallet = await this.getWalletById(userId, walletId);
    const balances = await this.prisma.tokenBalance.findMany({
      where: { walletId },
      orderBy: { balanceUsd: 'desc' },
    });

    const nfts = await this.prisma.nft.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...wallet,
      balances: balances.map((b: TokenBalance) => ({
        symbol: b.symbol,
        name: b.name,
        balance: b.balance,
        balanceUsd: b.balanceUsd?.toString(),
        priceUsd: b.priceUsd?.toString(),
        change24h: b.change24h?.toString(),
      })),
      nfts: nfts.map((nft) => ({
        id: nft.id,
        name: nft.name,
        collectionName: nft.collectionName,
        imageUrl: nft.imageUrl,
        floorPriceUsd: nft.floorPriceUsd?.toString(),
      })),
    };
  }

  private async fetchTokenBalances(address: string, chain: Chain): Promise<Partial<TokenBalance>[]> {
    const rpcUrl = this.rpcUrls[chain];
    if (!rpcUrl) {
      this.logger.warn(`No RPC URL configured for chain ${chain}`, 'WalletsService');
      return [];
    }

    const balances: Partial<TokenBalance>[] = [];

    try {
      const nativeBalance = await this.getNativeBalance(rpcUrl, address, chain);
      balances.push(nativeBalance);
    } catch (error) {
      this.logger.warn(`Failed to fetch native balance: ${error.message}`, 'WalletsService');
    }

    return balances;
  }

  private async getNativeBalance(rpcUrl: string, address: string, chain: Chain): Promise<Partial<TokenBalance>> {
    const response = await this.httpService.getAxiosInstance().post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    });

    const rawBalance = BigInt(response.data.result);
    const decimals = chain === Chain.BSC ? 18 : 18;
    const balance = Number(rawBalance) / 10 ** decimals;

    return {
      tokenAddress: 'native',
      symbol: this.getNativeSymbol(chain),
      name: this.getNativeName(chain),
      decimals,
      balance: balance.toFixed(18),
      balanceUsd: null,
      priceUsd: null,
      change24h: null,
    };
  }

  private getNativeSymbol(chain: Chain): string {
    const symbols: Record<Chain, string> = {
      [Chain.ETHEREUM]: 'ETH',
      [Chain.POLYGON]: 'MATIC',
      [Chain.BSC]: 'BNB',
      [Chain.ARBITRUM]: 'ETH',
      [Chain.BASE]: 'ETH',
      [Chain.AVALANCHE]: 'AVAX',
      [Chain.LXON]: 'LXON',
    };
    return symbols[chain];
  }

  private getNativeName(chain: Chain): string {
    const names: Record<Chain, string> = {
      [Chain.ETHEREUM]: 'Ethereum',
      [Chain.POLYGON]: 'Polygon',
      [Chain.BSC]: 'BNB',
      [Chain.ARBITRUM]: 'Ethereum',
      [Chain.BASE]: 'Ethereum',
      [Chain.AVALANCHE]: 'Avalanche',
      [Chain.LXON]: 'LXON Chain',
    };
    return names[chain];
  }
}
