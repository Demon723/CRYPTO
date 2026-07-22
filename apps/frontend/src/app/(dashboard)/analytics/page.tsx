'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown, DollarSign, Activity, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface AnalyticsData {
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  bestPerformer: { symbol: string; change: number };
  worstPerformer: { symbol: string; change: number };
  allocation: Array<{ symbol: string; percentage: number; value: number }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  useEffect(() => {
    loadAnalytics();
    loadTransactions();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.get('/analytics/portfolio');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await apiClient.get('/analytics/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed portfolio analytics and insights</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalValue.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.change24h >= 0 ? '+' : ''}{analytics.change24h}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">7d Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.change7d >= 0 ? '+' : ''}{analytics.change7d}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">30d Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.change30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.change30d >= 0 ? '+' : ''}{analytics.change30d}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Best Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.bestPerformer.symbol}</div>
                <p className="text-green-500">+{analytics.bestPerformer.change}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Worst Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.worstPerformer.symbol}</div>
                <p className="text-red-500">+{analytics.worstPerformer.change}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Current asset distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.allocation.map(asset => (
                <div key={asset.symbol} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{asset.symbol}</span>
                    <span>{asset.percentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">${asset.value.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Trading performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions found</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{tx.type || 'Transaction'}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.fromAddress} → {tx.toAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tx.value} {tx.symbol || ''}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
