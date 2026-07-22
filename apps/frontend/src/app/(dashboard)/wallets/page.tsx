'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import {
  Wallet,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface WalletData {
  id: string;
  address: string;
  chain: string;
  label?: string;
  type: string;
  isActive: boolean;
  isWatchOnly: boolean;
  lastSyncAt?: string;
  balances: Array<{
    symbol: string;
    name: string;
    balance: string;
    balanceUsd?: string;
    priceUsd?: string;
    change24h?: string;
  }>;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWallet, setNewWallet] = useState({ address: '', chain: 'ETHEREUM', label: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await apiClient.get('/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/wallets', newWallet);
      toast({
        title: 'Wallet added',
        description: 'Your wallet has been successfully added.',
      });
      setNewWallet({ address: '', chain: 'ETHEREUM', label: '' });
      setShowAddForm(false);
      fetchWallets();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add wallet';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async (walletId: string) => {
    setSyncingId(walletId);
    try {
      await apiClient.post(`/wallets/${walletId}/sync`);
      toast({
        title: 'Wallet synced',
        description: 'Balances updated successfully.',
      });
      fetchWallets();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sync wallet';
      toast({
        title: 'Sync failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (walletId: string) => {
    try {
      await apiClient.delete(`/wallets/${walletId}`);
      toast({
        title: 'Wallet removed',
        description: 'Wallet has been deactivated.',
      });
      fetchWallets();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove wallet';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard.',
    });
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ETHEREUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      POLYGON: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      BSC: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      ARBITRUM: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      BASE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      AVALANCHE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    LXON: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    };
    return colors[chain] || 'bg-gray-100 text-gray-800';
  };

  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + wallet.balances.reduce((balSum, b) => balSum + parseFloat(b.balanceUsd || '0'), 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">Manage your connected wallets</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {wallets.length} wallets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.filter(w => w.isActive).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Of {wallets.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(wallets.map(w => w.chain)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Different networks</p>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Wallet</CardTitle>
            <CardDescription>Connect a new wallet to track</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={newWallet.address}
                    onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                    placeholder="0x..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chain</label>
                  <select
                    value={newWallet.chain}
                    onChange={(e) => setNewWallet({ ...newWallet, chain: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="ETHEREUM">Ethereum</option>
                    <option value="POLYGON">Polygon</option>
                    <option value="BSC">BNB Chain</option>
                    <option value="ARBITRUM">Arbitrum</option>
                    <option value="BASE">Base</option>
                    <option value="AVALANCHE">Avalanche</option>
                  <option value="LXON">LXON Chain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Label (optional)</label>
                  <input
                    type="text"
                    value={newWallet.label}
                    onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                    placeholder="My Wallet"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Wallet'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Wallets</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="watch">Watch Only</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {wallets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No wallets yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Add your first wallet to start tracking your crypto assets
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{wallet.label || 'Wallet'}</CardTitle>
                      <div className="flex items-center gap-2">
                        {wallet.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge className={getChainColor(wallet.chain)}>{wallet.chain}</Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2 font-mono text-xs">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {wallet.balances.length > 0 ? (
                        <div className="space-y-2">
                          {wallet.balances.slice(0, 3).map((balance, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {balance.symbol.slice(0, 2)}
                                </div>
                                <span>{balance.symbol}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{parseFloat(balance.balance).toFixed(4)}</div>
                                {balance.balanceUsd && (
                                  <div className="text-xs text-muted-foreground">
                                    ${parseFloat(balance.balanceUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No balances</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSync(wallet.id)}
                          disabled={syncingId === wallet.id}
                        >
                          {syncingId === wallet.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(wallet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.filter(w => w.isActive).map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wallet.label || 'Wallet'}</CardTitle>
                    <Badge className={getChainColor(wallet.chain)}>{wallet.chain}</Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {wallet.balances.length} tokens
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="watch" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.filter(w => w.isWatchOnly).map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wallet.label || 'Watch Only'}</CardTitle>
                    <Badge variant="outline">Watch Only</Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Read-only wallet
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
