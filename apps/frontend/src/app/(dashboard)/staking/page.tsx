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
  Coins,
  TrendingUp,
  Lock,
  Unlock,
  RefreshCw,
  Wallet,
  Award,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface StakingPosition {
  id: string;
  walletId: string;
  amount: string;
  apy: string;
  startDate: string;
  endDate: string;
  status: string;
  rewardClaimed: string;
  wallet?: {
    address: string;
    chain: string;
    label?: string;
  };
}

interface StakingStats {
  totalStaked: string;
  totalRewards: string;
  activePositions: number;
  completedPositions: number;
  totalPositions: number;
  avgApy: string;
}

export default function StakingPage() {
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [stakeForm, setStakeForm] = useState({ walletId: '', amount: '', lockPeriodDays: 30 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStakingData();
  }, []);

  const fetchStakingData = async () => {
    try {
      const [positionsRes, statsRes] = await Promise.all([
        apiClient.get('/staking/positions'),
        apiClient.get('/staking/stats'),
      ]);
      setPositions(positionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch staking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/staking/stake', {
        walletId: stakeForm.walletId,
        amount: stakeForm.amount,
        lockPeriodDays: parseInt(stakeForm.lockPeriodDays.toString()),
      });
      toast({
        title: 'Stake created',
        description: 'Your staking position has been created.',
      });
      setStakeForm({ walletId: '', amount: '', lockPeriodDays: 30 });
      setShowStakeForm(false);
      fetchStakingData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create stake';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnstake = async (positionId: string) => {
    try {
      await apiClient.post('/staking/unstake', { positionId });
      toast({
        title: 'Unstake requested',
        description: 'Your unstake request has been submitted.',
      });
      fetchStakingData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to request unstake';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleClaimRewards = async (positionId: string) => {
    try {
      const response = await apiClient.post('/staking/claim-rewards', { positionId });
      toast({
        title: 'Rewards claimed',
        description: `You claimed ${response.data.claimed} LXON tokens.`,
      });
      fetchStakingData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to claim rewards';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'UNSTAKING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold">Staking</h1>
          <p className="text-muted-foreground">Stake your LXON tokens and earn rewards</p>
        </div>
        <Button onClick={() => setShowStakeForm(!showStakeForm)}>
          <Coins className="mr-2 h-4 w-4" />
          New Stake
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stats?.totalStaked || '0').toFixed(2)} LXON</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stats?.totalRewards || '0').toFixed(2)} LXON</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePositions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgApy || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {showStakeForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Stake</CardTitle>
            <CardDescription>Stake LXON tokens to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStake} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Wallet</Label>
                  <select
                    value={stakeForm.walletId}
                    onChange={(e) => setStakeForm({ ...stakeForm, walletId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select wallet</option>
                    {positions.map((p) => (
                      <option key={p.walletId} value={p.walletId}>
                        {p.wallet?.label || `${p.walletId.slice(0, 6)}...${p.walletId.slice(-4)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (LXON)</Label>
                  <Input
                    type="number"
                    value={stakeForm.amount}
                    onChange={(e) => setStakeForm({ ...stakeForm, amount: e.target.value })}
                    placeholder="1000"
                    min="100"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Staking...' : 'Stake Tokens'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowStakeForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({positions.filter(p => p.status === 'ACTIVE').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({positions.filter(p => p.status === 'COMPLETED').length})</TabsTrigger>
          <TabsTrigger value="all">All ({positions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {positions.filter(p => p.status === 'ACTIVE').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active stakes</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create a new stake to start earning rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positions.filter(p => p.status === 'ACTIVE').map((position) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Stake #{position.id.slice(0, 8)}</CardTitle>
                      <Badge className={getStatusColor(position.status)}>{position.status}</Badge>
                    </div>
                    <CardDescription>
                      {position.wallet?.label || `${position.walletId.slice(0, 6)}...${position.walletId.slice(-4)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-medium">{parseFloat(position.amount).toFixed(2)} LXON</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">APY</span>
                        <span className="font-medium text-green-600">{parseFloat(position.apy).toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Start Date</span>
                        <span className="text-sm">{new Date(position.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">End Date</span>
                        <span className="text-sm">{new Date(position.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleClaimRewards(position.id)}
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Claim
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnstake(position.id)}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {positions.filter(p => p.status === 'COMPLETED').map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Stake #{position.id.slice(0, 8)}</CardTitle>
                    <Badge className={getStatusColor(position.status)}>{position.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-medium">{parseFloat(position.amount).toFixed(2)} LXON</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Rewards Claimed</span>
                    <span className="font-medium text-green-600">{parseFloat(position.rewardClaimed).toFixed(2)} LXON</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {positions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Stake #{position.id.slice(0, 8)}</CardTitle>
                    <Badge className={getStatusColor(position.status)}>{position.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-medium">{parseFloat(position.amount).toFixed(2)} LXON</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="font-medium">{parseFloat(position.apy).toFixed(2)}%</span>
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
