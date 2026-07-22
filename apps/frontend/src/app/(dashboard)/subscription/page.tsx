'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Zap,
  CheckCircle,
  XCircle,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Key,
  Headphones,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
  aiQueryLimit: number;
  aiQueriesUsed: number;
  features: Record<string, boolean>;
}

interface PlanFeature {
  name: string;
  free: boolean | string | number;
  basic: boolean | string | number;
  pro: boolean | string | number;
  enterprise: boolean | string | number;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await apiClient.get('/subscriptions/current');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setIsUpgrading(true);
    try {
      await apiClient.post('/subscriptions/upgrade', null, { params: { plan } });
      toast({
        title: 'Subscription updated',
        description: `You have been upgraded to ${plan} plan.`,
      });
      fetchSubscription();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await apiClient.post('/subscriptions/cancel');
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription will not renew.',
      });
      fetchSubscription();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const plans = [
    {
      name: 'FREE',
      label: 'Free',
      price: '$0',
      period: 'forever',
      icon: Gift,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      features: ['10 AI queries/day', '3 Wallets', '5 Alerts', 'Basic analytics'],
    },
    {
      name: 'BASIC',
      label: 'Basic',
      price: '$19',
      period: 'month',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      features: ['100 AI queries/day', '10 Wallets', '20 Alerts', 'Advanced analytics', 'Email support'],
    },
    {
      name: 'PRO',
      label: 'Pro',
      price: '$49',
      period: 'month',
      icon: Crown,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      features: ['500 AI queries/day', '50 Wallets', '100 Alerts', 'Advanced analytics', 'API access', 'Priority support'],
    },
    {
      name: 'ENTERPRISE',
      label: 'Enterprise',
      price: '$199',
      period: 'month',
      icon: Users,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      features: ['Unlimited AI queries', 'Unlimited Wallets', 'Unlimited Alerts', 'Advanced analytics', 'API access', 'White-label', 'Dedicated support'],
    },
  ];

  const featureComparison: PlanFeature[] = [
    { name: 'AI Queries/Day', free: 10, basic: 100, pro: 500, enterprise: 'Unlimited' },
    { name: 'Max Wallets', free: 3, basic: 10, pro: 50, enterprise: 'Unlimited' },
    { name: 'Max Alerts', free: 5, basic: 20, pro: 100, enterprise: 'Unlimited' },
    { name: 'Advanced Analytics', free: false, basic: true, pro: true, enterprise: true },
    { name: 'API Access', free: false, basic: false, pro: true, enterprise: true },
    { name: 'Priority Support', free: false, basic: false, pro: true, enterprise: true },
    { name: 'White-label', free: false, basic: false, pro: false, enterprise: true },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Current Plan: {subscription.plan}
            </CardTitle>
            <CardDescription>
              Status: <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>{subscription.status}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Queries Used</p>
                <p className="font-medium">{subscription.aiQueriesUsed} / {subscription.aiQueryLimit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto Renew</p>
                <p className="font-medium">{subscription.cancelAtPeriodEnd ? 'No' : 'Yes'}</p>
              </div>
            </div>
            {subscription.plan !== 'FREE' && (
              <div className="mt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative hover:shadow-lg transition-shadow ${
                subscription?.plan === plan.name ? 'ring-2 ring-primary' : ''
              }`}
            >
              {subscription?.plan === plan.name && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={plan.color}>Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${plan.color}`}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{plan.label}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={subscription?.plan === plan.name ? 'outline' : 'default'}
                  disabled={subscription?.plan === plan.name || isUpgrading}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {subscription?.plan === plan.name ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare features across all plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Feature</th>
                  <th className="text-center py-2 px-4">Free</th>
                  <th className="text-center py-2 px-4">Basic</th>
                  <th className="text-center py-2 px-4">Pro</th>
                  <th className="text-center py-2 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-4 font-medium">{feature.name}</td>
                    <td className="text-center py-2 px-4">{String(feature.free)}</td>
                    <td className="text-center py-2 px-4">{String(feature.basic)}</td>
                    <td className="text-center py-2 px-4">{String(feature.pro)}</td>
                    <td className="text-center py-2 px-4">{String(feature.enterprise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
