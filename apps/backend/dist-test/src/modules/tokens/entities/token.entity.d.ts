export interface TokenSearchResult {
    address: string;
    chain: string;
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
