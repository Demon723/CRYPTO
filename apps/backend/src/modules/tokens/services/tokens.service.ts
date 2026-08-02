// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { Chain } from '../../wallets/entities/wallet.entity';
import { LoggerService } from '../../common/modules/logger.service';

export interface TokenSearchResult {
  address: string;
  chain: Chain;
  symbol: string;
  name: string;
  priceUsd?: string;
  change24h?: string;
  marketCapUsd?: string;
  volumeUsd24h?: string;
  riskScore?: number;
  isVerified?: boolean;
  isScam?: boolean;
}

@Injectable()
export class TokensService {
  private readonly logger = new LoggerService();
  private readonly coinGeckoApi = 'https://api.coingecko.com/api/v3';
  private readonly dexScreenerApi = 'https://api.dexscreener.com/latest/dex';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async searchTokens(query: string, chain?: Chain): Promise<TokenSearchResult[]> {
    if (!query || query.length < 2) {
      throw new BadRequestException('Query must be at least 2 characters');
    }

    const normalizedQuery = query.toLowerCase();

    const dbTokens = await this.prisma.token.findMany({
      where: {
        OR: [
          { symbol: { contains: query.toUpperCase() } },
          { name: { contains: query } },
          { address: { contains: query.toLowerCase() } },
        ],
        ...(chain && { chain }),
      },
      take: 20,
      orderBy: { marketCapUsd: 'desc' },
    });

    const externalResults = await this.fetchExternalTokens(query, chain);

    const combined = [...dbTokens, ...externalResults];

    const unique = new Map<string, TokenSearchResult>();
    for (const token of combined) {
      const key = `${token.chain}-${token.address}`;
      if (!unique.has(key)) {
        unique.set(key, token);
      }
    }

    return Array.from(unique.values()).slice(0, 50);
  }

  async getTokenByAddress(address: string, chain: Chain): Promise<TokenSearchResult | null> {
    const normalizedAddress = address.toLowerCase().replace(/^0x/, '0x');

    let token = await this.prisma.token.findUnique({
      where: { address: normalizedAddress },
    });

    if (!token) {
      token = await this.fetchAndUpsertToken(normalizedAddress, chain);
    }

    if (!token) {
      return null;
    }

    return {
      address: token.address,
      chain: token.chain,
      symbol: token.symbol,
      name: token.name,
      priceUsd: token.priceUsd?.toString(),
      change24h: token.change24h?.toString(),
      marketCapUsd: token.marketCapUsd?.toString(),
      volumeUsd24h: token.volumeUsd24h?.toString(),
      riskScore: token.riskScore || undefined,
      isVerified: token.isVerified,
      isScam: token.isScam,
    };
  }

  async getTokenPrice(address: string, chain: Chain): Promise<{ priceUsd: string; change24h: string } | null> {
    const token = await this.getTokenByAddress(address, chain);
    if (!token) {
      return null;
    }

    return {
      priceUsd: token.priceUsd || '0',
      change24h: token.change24h || '0',
    };
  }

  async getTrendingTokens(chain?: Chain): Promise<TokenSearchResult[]> {
    const tokens = await this.prisma.token.findMany({
      where: {
        ...(chain && { chain }),
        isScam: false,
      },
      orderBy: { volumeUsd24h: 'desc' },
      take: 20,
    });

    return tokens.map((t) => ({
      address: t.address,
      chain: t.chain,
      symbol: t.symbol,
      name: t.name,
      priceUsd: t.priceUsd?.toString(),
      change24h: t.change24h?.toString(),
      marketCapUsd: t.marketCapUsd?.toString(),
      volumeUsd24h: t.volumeUsd24h?.toString(),
      riskScore: t.riskScore || undefined,
      isVerified: t.isVerified,
      isScam: t.isScam,
    }));
  }

  async getTopGainers(chain?: Chain): Promise<TokenSearchResult[]> {
    const tokens = await this.prisma.token.findMany({
      where: {
        ...(chain && { chain }),
        isScam: false,
        change24h: { not: null },
      },
      orderBy: { change24h: 'desc' },
      take: 20,
    });

    return tokens.map((t) => ({
      address: t.address,
      chain: t.chain,
      symbol: t.symbol,
      name: t.name,
      priceUsd: t.priceUsd?.toString(),
      change24h: t.change24h?.toString(),
      marketCapUsd: t.marketCapUsd?.toString(),
      volumeUsd24h: t.volumeUsd24h?.toString(),
      isVerified: t.isVerified,
      isScam: t.isScam,
    }));
  }

  async getTopLosers(chain?: Chain): Promise<TokenSearchResult[]> {
    const tokens = await this.prisma.token.findMany({
      where: {
        ...(chain && { chain }),
        isScam: false,
        change24h: { not: null },
      },
      orderBy: { change24h: 'asc' },
      take: 20,
    });

    return tokens.map((t) => ({
      address: t.address,
      chain: t.chain,
      symbol: t.symbol,
      name: t.name,
      priceUsd: t.priceUsd?.toString(),
      change24h: t.change24h?.toString(),
      marketCapUsd: t.marketCapUsd?.toString(),
      volumeUsd24h: t.volumeUsd24h?.toString(),
      isVerified: t.isVerified,
      isScam: t.isScam,
    }));
  }

  private async fetchExternalTokens(query: string, chain?: Chain): Promise<TokenSearchResult[]> {
    try {
      const response = await this.httpService
        .getAxiosInstance()
        .get(`${this.dexScreenerApi}/search`, {
          params: { q: query },
        });

      if (!response || !response.data) {
        throw new Error('Empty response from DEX Screener');
      }

      const pairs = response.data.pairs || [];
      const tokens: TokenSearchResult[] = [];

      for (const pair of pairs) {
        if (chain && this.mapChain(pair.chainId) !== chain) {
          continue;
        }

        tokens.push({
          address: pair.baseToken.address,
          chain: this.mapChain(pair.chainId),
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          priceUsd: pair.priceUsd,
          change24h: pair.priceChange?.h24,
          marketCapUsd: pair.marketCap?.toString(),
          volumeUsd24h: pair.volume?.h24?.toString(),
        });
      }

      return tokens.slice(0, 20);
    } catch (error) {
      this.logger.warn(`Failed to fetch external tokens: ${error.message}`, 'TokensService');
      return [];
    }
  }

  private async fetchAndUpsertToken(address: string, chain: Chain) {
    try {
      const response = await this.httpService
        .getAxiosInstance()
        .get(`${this.dexScreenerApi}/search`, {
          params: { q: address },
        });

      if (!response || !response.data) {
        return null;
      }

      const pair = response.data.pairs?.[0];
      if (!pair) return null;

      return this.prisma.token.upsert({
        where: { address: address.toLowerCase() },
        create: {
          address: address.toLowerCase(),
          chain,
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          decimals: 18,
          priceUsd: parseFloat(pair.priceUsd || '0'),
          change24h: parseFloat(pair.priceChange?.h24 || '0'),
          marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
          volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
          lastUpdated: new Date(),
        },
        update: {
          priceUsd: parseFloat(pair.priceUsd || '0'),
          change24h: parseFloat(pair.priceChange?.h24 || '0'),
          marketCapUsd: parseFloat(pair.marketCap?.toString() || '0'),
          volumeUsd24h: parseFloat(pair.volume?.h24?.toString() || '0'),
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to fetch token from external API: ${error.message}`, 'TokensService');
      return null;
    }
  }

  private mapChain(chainId: string): Chain {
    const chainMap: Record<string, Chain> = {
      ethereum: Chain.ETHEREUM,
      polygon: Chain.POLYGON,
      bsc: Chain.BSC,
      arbitrum: Chain.ARBITRUM,
      base: Chain.BASE,
      avalanche: Chain.AVALANCHE,
      lxon: Chain.LXON,
    };
    return chainMap[chainId] || Chain.ETHEREUM;
  }
}
