'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Filter,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface NftData {
  id: string;
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  floorPriceUsd?: string;
  lastSalePriceUsd?: string;
  rarityRank?: number;
}

interface NftCollection {
  collectionName: string;
  contractAddress: string;
  count: number;
  floorPriceUsd?: string;
}

export default function NftsPage() {
  const [nfts, setNfts] = useState<NftData[]>([]);
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNfts();
  }, []);

  useEffect(() => {
    fetchNfts();
  }, []);

  useEffect(() => {
    fetchNfts();
  }, []);

  const fetchNfts = async () => {
    try {
      const [nftsRes, collectionsRes] = await Promise.all([
        apiClient.get('/nfts'),
        apiClient.get('/nfts/collections'),
      ]);
      setNfts(nftsRes.data);
      setCollections(collectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price?: string) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFTs</h1>
          <p className="text-muted-foreground">View and manage your NFT collection</p>
        </div>
        <Button variant="outline" onClick={fetchNfts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nfts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Floor Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${collections.reduce((sum, c) => sum + parseFloat(c.floorPriceUsd || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rare Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nfts.filter(n => n.rarityRank && n.rarityRank <= 100).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All NFTs</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {nfts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Connect a wallet with NFTs to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {nft.imageUrl ? (
                      <img
                        src={nft.imageUrl}
                        alt={nft.name || 'NFT'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate">{nft.name || `#${nft.tokenId}`}</CardTitle>
                    <CardDescription className="text-xs">{nft.collectionName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {nft.floorPriceUsd && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Floor Price</span>
                          <span className="font-medium">{formatPrice(nft.floorPriceUsd)}</span>
                        </div>
                      )}
                      {nft.rarityRank && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rarity Rank</span>
                          <Badge variant="outline">#{nft.rarityRank}</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Token ID</span>
                        <span className="font-mono text-xs">{nft.tokenId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          {collections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No collections found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your NFT collections will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{collection.collectionName}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {collection.contractAddress.slice(0, 6)}...{collection.contractAddress.slice(-4)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span className="font-medium">{collection.count}</span>
                      </div>
                      {collection.floorPriceUsd && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Floor Price</span>
                          <span className="font-medium">{formatPrice(collection.floorPriceUsd)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
