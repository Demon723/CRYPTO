'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ExternalLink,
  RefreshCw,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface TokenData {
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

export default function TokensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState('ETHEREUM');
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [trending, setTrending] = useState<TokenData[]>([]);
  const [gainers, setGainers] = useState<TokenData[]>([]);
  const [losers, setLosers] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [showBackDesign, setShowBackDesign] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, [selectedChain]);

  const fetchMarketData = async () => {
    try {
      const [trendingRes, gainersRes, losersRes] = await Promise.all([
        apiClient.get(`/tokens/trending?chain=${selectedChain}`),
        apiClient.get(`/tokens/gainers?chain=${selectedChain}`),
        apiClient.get(`/tokens/losers?chain=${selectedChain}`),
      ]);

      setTrending(trendingRes.data);
      setGainers(gainersRes.data);
      setLosers(losersRes.data);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await apiClient.get(`/tokens/search?q=${encodeURIComponent(searchQuery)}&chain=${selectedChain}`);
      setTokens(response.data);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ETHEREUM: 'bg-blue-100 text-blue-800',
      POLYGON: 'bg-purple-100 text-purple-800',
      BSC: 'bg-yellow-100 text-yellow-800',
      ARBITRUM: 'bg-cyan-100 text-cyan-800',
      BASE: 'bg-blue-100 text-blue-800',
      AVALANCHE: 'bg-red-100 text-red-800',
      LXON: 'bg-indigo-100 text-indigo-800',
    };
    return colors[chain] || 'bg-gray-100 text-gray-800';
  };

  const TokenCard = ({ token }: { token: TokenData }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {token.symbol === 'LXON' ? (
              <img 
                src={showBackDesign ? "/lxon-coin-back.png" : "/lxon-coin.png"} 
                alt="LXON" 
                className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setShowBackDesign(!showBackDesign)}
                title="Click to flip coin"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {token.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <CardTitle className="text-base">{token.symbol}</CardTitle>
              <CardDescription className="text-xs">{token.name}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {token.isVerified && <Star className="h-4 w-4 text-blue-500" />}
            {token.isScam && <Badge variant="destructive">Scam</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-medium">${parseFloat(token.priceUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 4 })}</span>
          </div>
          {token.change24h && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">24h Change</span>
              <div className={`flex items-center gap-1 ${parseFloat(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(token.change24h) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="font-medium">{Math.abs(parseFloat(token.change24h)).toFixed(2)}%</span>
              </div>
            </div>
          )}
          {token.marketCapUsd && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Cap</span>
              <span className="font-medium">${parseFloat(token.marketCapUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {token.volumeUsd24h && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volume 24h</span>
              <span className="font-medium">${parseFloat(token.volumeUsd24h).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <Badge className={getChainColor(token.chain)}>{token.chain}</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Token Research</h1>
          <p className="text-muted-foreground">Search and analyze tokens across multiple chains</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="ETHEREUM">Ethereum</option>
            <option value="POLYGON">Polygon</option>
            <option value="BSC">BNB Chain</option>
            <option value="ARBITRUM">Arbitrum</option>
            <option value="BASE">Base</option>
            <option value="AVALANCHE">Avalanche</option>
            <option value="LXON">LXON Chain</option>
          </select>
          <Button variant="outline" onClick={fetchMarketData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol, name, or address..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Results {tokens.length > 0 && `(${tokens.length})`}</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
          <TabsTrigger value="losers">Top Losers</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {tokens.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Try searching for a token symbol, name, or contract address
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => (
                <TokenCard key={`${token.chain}-${token.address}`} token={token} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trending.map((token) => (
                <TokenCard key={`${token.chain}-${token.address}`} token={token} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gainers" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gainers.map((token) => (
                <TokenCard key={`${token.chain}-${token.address}`} token={token} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="losers" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {losers.map((token) => (
                <TokenCard key={`${token.chain}-${token.address}`} token={token} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
