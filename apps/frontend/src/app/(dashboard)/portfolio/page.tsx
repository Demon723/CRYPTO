'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface PortfolioSummary {
  totalValueUsd: string;
  totalChange24h: string;
  totalChangePercentage24h: string;
  totalRealizedPnl: string;
  totalUnrealizedPnl: string;
  totalPnl: string;
  walletCount: number;
  topGainers: Array<{
    symbol: string;
    name: string;
    valueUsd: string;
    change24h: string;
    percentage: string;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    valueUsd: string;
    change24h: string;
    percentage: string;
  }>;
}

interface AssetAllocation {
  tokens: Array<{
    symbol: string;
    name: string;
    valueUsd: string;
    percentage: string;
    change24h: string;
  }>;
  chains: Array<{
    chain: string;
    valueUsd: string;
    percentage: string;
    walletCount: number;
  }>;
}

interface ProfitLoss {
  realizedPnl: string;
  unrealizedPnl: string;
  totalPnl: string;
  realizedPnlPercentage: string;
  unrealizedPnlPercentage: string;
  totalPnlPercentage: string;
  byToken: Array<{
    symbol: string;
    realizedPnl: string;
    unrealizedPnl: string;
    totalPnl: string;
    totalPnlPercentage: string;
  }>;
}

export default function PortfolioPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [allocation, setAllocation] = useState<AssetAllocation | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchPortfolioData();
  }, [period]);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, allocationRes, profitLossRes, riskRes] = await Promise.all([
        apiClient.get('/portfolio/summary'),
        apiClient.get('/portfolio/allocation'),
        apiClient.get('/portfolio/profit-loss'),
        apiClient.get('/portfolio/risk-score'),
      ]);

      setSummary(summaryRes.data);
      setAllocation(allocationRes.data);
      setProfitLoss(profitLossRes.data);
      setRiskData(riskRes.data);
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Report generated',
      description: 'Your portfolio report is being downloaded.',
    });
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Track your crypto assets and performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
          <Button variant="outline" onClick={fetchPortfolioData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(summary?.totalValueUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1">
              {parseFloat(summary?.totalChange24h || '0') >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${parseFloat(summary?.totalChange24h || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {summary?.totalChangePercentage24h}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Realized P/L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(summary?.totalRealizedPnl || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">From closed positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Unrealized P/L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(summary?.totalUnrealizedPnl || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Open positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.walletCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Connected wallets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit/Loss</TabsTrigger>
          <TabsTrigger value="gainers">Top Movers</TabsTrigger>
          <TabsTrigger value="risk">Risk Score</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Portfolio distribution by token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allocation?.tokens.slice(0, 10).map((token, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(token.valueUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">{token.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chain Distribution</CardTitle>
                <CardDescription>Portfolio distribution by chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allocation?.chains.map((chain, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{chain.chain}</p>
                        <p className="text-xs text-muted-foreground">{chain.walletCount} wallets</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(chain.valueUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">{chain.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit/Loss Breakdown</CardTitle>
              <CardDescription>Realized and unrealized gains/losses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
                  <p className="text-sm text-green-600 dark:text-green-400">Realized P/L</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${parseFloat(profitLoss?.realizedPnl || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Unrealized P/L</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    ${parseFloat(profitLoss?.unrealizedPnl || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5">
                  <p className="text-sm text-primary">Total P/L</p>
                  <p className="text-2xl font-bold">
                    ${parseFloat(profitLoss?.totalPnl || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">By Token</h4>
                {profitLoss?.byToken.map((token, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{token.symbol}</span>
                    <div className="text-right">
                      <p className={`font-medium ${parseFloat(token.totalPnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${parseFloat(token.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{token.totalPnlPercentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gainers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.topGainers.map((gainer, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{gainer.symbol}</p>
                        <p className="text-xs text-muted-foreground">{gainer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{gainer.percentage}</p>
                        <p className="text-xs text-muted-foreground">${parseFloat(gainer.valueUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.topLosers.map((loser, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{loser.symbol}</p>
                        <p className="text-xs text-muted-foreground">{loser.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{loser.percentage}</p>
                        <p className="text-xs text-muted-foreground">${parseFloat(loser.valueUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
