'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Search,
  ExternalLink,
  Copy,
  RefreshCw,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Transaction {
  id: string;
  hash: string;
  chain: string;
  type: string;
  fromAddress: string;
  toAddress?: string;
  value: string;
  valueUsd?: string;
  gasUsed?: string;
  feeUsd?: string;
  status: string;
  timestamp: string;
  tokenSymbol?: string;
}

interface TransactionStats {
  totalTransactions: number;
  totalVolumeUsd: string;
  totalFeesUsd: string;
  byType: Record<string, number>;
  byChain: Record<string, number>;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChain, setFilterChain] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filterChain, filterType, page]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterChain) params.append('chain', filterChain);
      if (filterType) params.append('type', filterType);
      params.append('page', page.toString());
      params.append('limit', '20');

      const [txRes, statsRes] = await Promise.all([
        apiClient.get(`/transactions?${params.toString()}`),
        apiClient.get('/transactions/stats'),
      ]);

      setTransactions(txRes.data.data || txRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Transaction hash copied to clipboard.',
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
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
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View your transaction history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTransactions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(stats?.totalVolumeUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(stats?.totalFeesUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Networks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats?.byChain || {}).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter transactions by chain or type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by hash or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Chain</Label>
              <select
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Chains</option>
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
              <Label>Type</Label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="TRANSFER">Transfer</option>
                <option value="SWAP">Swap</option>
                <option value="STAKE">Stake</option>
                <option value="UNSTAKE">Unstake</option>
                <option value="CONTRACT_CALL">Contract Call</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Showing {transactions.length} transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'TRANSFER' ? 'bg-blue-100 dark:bg-blue-900/20' : tx.type === 'SWAP' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-gray-100 dark:bg-gray-900/20'}`}>
                      {tx.type === 'TRANSFER' ? (
                        <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      ) : tx.type === 'SWAP' ? (
                        <RefreshCw className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tx.type}</p>
                        <Badge className={getChainColor(tx.chain)}>{tx.chain}</Badge>
                        <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{parseFloat(tx.value).toFixed(4)} {tx.tokenSymbol || ''}</p>
                    {tx.valueUsd && (
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(tx.valueUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {tx.feeUsd && (
                      <p className="text-xs text-muted-foreground">Fee: ${parseFloat(tx.feeUsd).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
