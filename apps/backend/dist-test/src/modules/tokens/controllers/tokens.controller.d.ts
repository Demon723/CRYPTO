import { TokensService } from '../services/tokens.service';
import { Chain } from '../../wallets/entities/wallet.entity';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    searchTokens(query: string, chain?: Chain): Promise<import("../services/tokens.service").TokenSearchResult[]>;
    getTokenByAddress(address: string, chain: Chain): Promise<import("../services/tokens.service").TokenSearchResult>;
    getTokenPrice(address: string, chain: Chain): Promise<{
        priceUsd: string;
        change24h: string;
    }>;
    getTrendingTokens(chain?: Chain): Promise<import("../services/tokens.service").TokenSearchResult[]>;
    getTopGainers(chain?: Chain): Promise<import("../services/tokens.service").TokenSearchResult[]>;
    getTopLosers(chain?: Chain): Promise<import("../services/tokens.service").TokenSearchResult[]>;
}
