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
  Bell,
  Plus,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
  Shield,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Alert {
  id: string;
  type: string;
  status: string;
  condition: Record<string, unknown>;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  wallet?: {
    address: string;
    chain: string;
    label?: string;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: 'PRICE', condition: { field: 'price', operator: '>', value: 3000 }, walletId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get('/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/alerts', newAlert);
      toast({
        title: 'Alert created',
        description: 'Your alert has been successfully created.',
      });
      setNewAlert({ type: 'PRICE', condition: { field: 'price', operator: '>', value: 3000 }, walletId: '' });
      setShowCreateForm(false);
      fetchAlerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create alert';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async (alertId: string) => {
    try {
      await apiClient.patch(`/alerts/${alertId}/pause`);
      toast({
        title: 'Alert paused',
        description: 'The alert has been paused.',
      });
      fetchAlerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to pause alert';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleResume = async (alertId: string) => {
    try {
      await apiClient.patch(`/alerts/${alertId}/resume`);
      toast({
        title: 'Alert resumed',
        description: 'The alert has been resumed.',
      });
      fetchAlerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resume alert';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await apiClient.delete(`/alerts/${alertId}`);
      toast({
        title: 'Alert deleted',
        description: 'The alert has been removed.',
      });
      fetchAlerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete alert';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'PRICE':
        return <TrendingUp className="h-4 w-4" />;
      case 'WHALE_ACTIVITY':
        return <Shield className="h-4 w-4" />;
      case 'RISK':
        return <AlertTriangle className="h-4 w-4" />;
      case 'SECURITY':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'TRIGGERED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'DISABLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Manage your price and security alerts</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>Set up a new alert to monitor your assets</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PRICE">Price Alert</option>
                    <option value="WHALE_ACTIVITY">Whale Activity</option>
                    <option value="RISK">Risk Alert</option>
                    <option value="SECURITY">Security Alert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Condition Value</Label>
                  <Input
                    type="number"
                    value={String(newAlert.condition.value)}
                    onChange={(e) => setNewAlert({ ...newAlert, condition: { ...newAlert.condition, value: parseFloat(e.target.value) || 0 } })}
                    placeholder="3000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Alert'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="triggered">Triggered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create alerts to monitor your assets and get notified
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        alert.type === 'PRICE' ? 'bg-green-100 dark:bg-green-900/20' :
                        alert.type === 'RISK' ? 'bg-red-100 dark:bg-red-900/20' :
                        'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.type}</p>
                          <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Condition: {JSON.stringify(alert.condition)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Triggered {alert.triggerCount} times
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE' ? (
                        <Button variant="ghost" size="icon" onClick={() => handlePause(alert.id)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleResume(alert.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-3">
            {alerts.filter(a => a.status === 'ACTIVE').map((alert) => (
              <Card key={alert.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <div>
                      <p className="font-medium">{alert.type}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handlePause(alert.id)}>
                    <Pause className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="triggered" className="space-y-4">
          <div className="space-y-3">
            {alerts.filter(a => a.status === 'TRIGGERED').map((alert) => (
              <Card key={alert.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <div>
                      <p className="font-medium">{alert.type}</p>
                      <p className="text-sm text-muted-foreground">Triggered {alert.triggerCount} times</p>
                    </div>
                  </div>
                  <Badge variant="outline">Triggered</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
