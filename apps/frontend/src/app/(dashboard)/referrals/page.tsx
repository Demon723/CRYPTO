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
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface ReferralCode {
  id: string;
  code: string;
  uses: number;
  maxUses: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  totalRewards: string;
  pendingRewards: string;
  claimedRewards: string;
}

interface ReferralReward {
  id: string;
  rewardType: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [codeRes, statsRes, referralsRes] = await Promise.all([
        apiClient.get('/referral/code'),
        apiClient.get('/referral/stats'),
        apiClient.get('/referral/history'),
      ]);
      setReferralCode(codeRes.data);
      setStats(statsRes.data);
      setReferrals(referralsRes.data.referrerRewards || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Referral code copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralCode = async () => {
    if (!referralCode?.code) return;

    const shareData = {
      title: 'Join Synex',
      text: `Use my referral code ${referralCode.code} to sign up for Synex and earn rewards!`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyReferralCode();
      }
    } catch (error) {
      copyReferralCode();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Synex</h1>
        <p className="text-muted-foreground">Earn rewards by referring friends to Synex</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stats?.totalRewards || '0').toFixed(2)} LXON</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stats?.pendingRewards || '0').toFixed(2)} LXON</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn rewards when they sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-muted rounded-lg">
                  <code className="text-2xl font-bold tracking-wider">{referralCode.code}</code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={copyReferralCode}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareReferralCode}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Uses: {referralCode.uses}/{referralCode.maxUses}</span>
                {referralCode.expiresAt && (
                  <span>Expires: {new Date(referralCode.expiresAt).toLocaleDateString()}</span>
                )}
                <Badge variant={referralCode.isActive ? 'default' : 'secondary'}>
                  {referralCode.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading referral code...</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Rewards ({referrals.length})</TabsTrigger>
          <TabsTrigger value="info">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          {referrals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Share your referral code to start earning rewards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {referrals.map((reward) => (
                <Card key={reward.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        reward.status === 'CLAIMED' ? 'bg-green-100 dark:bg-green-900/20' :
                        reward.status === 'CLAIMABLE' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        <Award className={`h-4 w-4 ${
                          reward.status === 'CLAIMED' ? 'text-green-600' :
                          reward.status === 'CLAIMABLE' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{reward.rewardType}</p>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(reward.amount).toFixed(2)} {reward.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      reward.status === 'CLAIMED' ? 'default' :
                      reward.status === 'CLAIMABLE' ? 'outline' :
                      'secondary'
                    }>
                      {reward.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Synex Works</CardTitle>
              <CardDescription>Earn LXON tokens by referring friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Share your code</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your unique referral code with friends and on social media
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Friend signs up</h4>
                    <p className="text-sm text-muted-foreground">
                      Your friend creates an account using your referral code
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Earn rewards</h4>
                    <p className="text-sm text-muted-foreground">
                      Both you and your friend earn LXON tokens when they complete signup
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
