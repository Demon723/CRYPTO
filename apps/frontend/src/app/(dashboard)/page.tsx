'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  TrendingUp,
  BarChart3,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ExternalLink,
  Activity,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface WalletSummary {
  id: string;
  address: string;
  chain: string;
  label?: string;
  balances: Array<{
    symbol: string;
    name: string;
    balance: string;
    balanceUsd?: string;
    priceUsd?: string;
    change24h?: string;
  }>;
}

interface TransactionSummary {
  totalTransactions: number;
  totalVolumeUsd: string;
  totalFeesUsd: string;
  byType: Record<string, number>;
  byChain: Record<string, number>;
}

export default function DashboardPage() {
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [stats, setStats] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [walletsRes, statsRes] = await Promise.all([
        apiClient.get('/wallets'),
        apiClient.get('/transactions/stats'),
      ]);

      setWallets(walletsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + wallet.balances.reduce((balSum, b) => balSum + parseFloat(b.balanceUsd || '0'), 0);
  }, 0);

  const recentTransactions = wallets.flatMap((w) => w.balances).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your crypto command center</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/wallets">
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {wallets.length} wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${parseFloat(stats?.totalVolumeUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wallet.label || 'Wallet'}</CardTitle>
                    <Badge variant="outline">{wallet.chain}</Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    {wallet.balances.length === 0 && (
                      <p className="text-sm text-muted-foreground">No balances</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {wallets.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No wallets yet</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Add your first wallet to start tracking your crypto assets
                  </p>
                  <Button asChild>
                    <Link href="/wallets">Add Wallet</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions across all wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.change24h && parseFloat(tx.change24h) >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                          {tx.change24h && parseFloat(tx.change24h) >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.symbol}</p>
                          <p className="text-sm text-muted-foreground">{tx.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{parseFloat(tx.balance).toFixed(4)}</p>
                        {tx.balanceUsd && (
                          <p className="text-sm text-muted-foreground">
                            ${parseFloat(tx.balanceUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your portfolio performance over time with advanced analytics.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/portfolio">View Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI-powered market insights and trend analysis.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ai">Chat with AI</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
