import { PrismaService } from '../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { Chain } from '../../wallets/entities/wallet.entity';
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
export declare class TokensService {
    private readonly prisma;
    private readonly httpService;
    private readonly logger;
    private readonly coinGeckoApi;
    private readonly dexScreenerApi;
    constructor(prisma: PrismaService, httpService: HttpService);
    searchTokens(query: string, chain?: Chain): Promise<TokenSearchResult[]>;
    getTokenByAddress(address: string, chain: Chain): Promise<TokenSearchResult | null>;
    getTokenPrice(address: string, chain: Chain): Promise<{
        priceUsd: string;
        change24h: string;
    } | null>;
    getTrendingTokens(chain?: Chain): Promise<TokenSearchResult[]>;
    getTopGainers(chain?: Chain): Promise<TokenSearchResult[]>;
    getTopLosers(chain?: Chain): Promise<TokenSearchResult[]>;
    private fetchExternalTokens;
    private fetchAndUpsertToken;
    private mapChain;
}
