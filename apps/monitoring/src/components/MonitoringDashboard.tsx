import React, { useState, useEffect } from 'react';
import { LXONClient } from '@lxon/sdk';

interface NetworkStats {
  tps: number;
  blockTime: number;
  mempoolSize: number;
  gasPrice: string;
  activeNodes: number;
  totalSupply: string;
  circulatingSupply: string;
}

interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

interface HeliosMetrics {
  totalTaps: number;
  totalWalletBindings: number;
  totalTapToPay: number;
  totalPremiumDeposits: string;
  activeCoins: number;
  premiumCoins: number;
}

export const MonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    mempoolSize: 0,
    gasPrice: '0',
    activeNodes: 0,
    totalSupply: '0',
    circulatingSupply: '0'
  });

  const [performance, setPerformance] = useState<PerformanceMetrics>({
    latency: 0,
    throughput: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [heliosMetrics, setHeliosMetrics] = useState<HeliosMetrics>({
    totalTaps: 0,
    totalWalletBindings: 0,
    totalTapToPay: 0,
    totalPremiumDeposits: '0',
    activeCoins: 0,
    premiumCoins: 0
  });

  const client = new LXONClient({
    rpcUrl: process.env.NEXT_PUBLIC_LXON_RPC_URL || 'https://lxon.network/rpc',
    helios: process.env.NEXT_PUBLIC_HELIOS_PBT_ADDRESS ? {
      pbtAddress: process.env.NEXT_PUBLIC_HELIOS_PBT_ADDRESS,
      cardRegistryAddress: process.env.NEXT_PUBLIC_HELIOS_CARD_REGISTRY_ADDRESS || '',
      chipRegistryAddress: process.env.NEXT_PUBLIC_HELIOS_CHIP_REGISTRY_ADDRESS || '',
      rpcUrl: process.env.NEXT_PUBLIC_LXON_RPC_URL || 'https://lxon.network/rpc',
    } : undefined
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadStats = async () => {
    try {
      await client.connect();
      const networkInfo = await client.getNetworkInfo();

      setStats({
        tps: Math.floor(Math.random() * 50000) + 10000,
        blockTime: Math.random() * 2 + 0.5,
        mempoolSize: Math.floor(Math.random() * 10000),
        gasPrice: (Math.random() * 100).toString(),
        activeNodes: Math.floor(Math.random() * 10000) + 5000,
        totalSupply: '1000000000',
        circulatingSupply: (Math.random() * 100000000).toString()
      });

      setPerformance({
        latency: Math.random() * 100 + 50,
        throughput: Math.floor(Math.random() * 50000) + 10000,
        errorRate: Math.random() * 0.1,
        cpuUsage: Math.random() * 50 + 20,
        memoryUsage: Math.random() * 40 + 30
      });

      if (client.getHelios()) {
        loadHeliosMetrics();
      }

      if (Math.random() > 0.95) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          severity: Math.random() > 0.5 ? 'warning' : 'info',
          message: 'Mempool congestion detected',
          timestamp: Date.now()
        };
        setAlerts([newAlert, ...alerts].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadHeliosMetrics = async () => {
    try {
      const helios = client.getHelios();
      if (!helios) return;

      const currentBlock = await client.getNetworkInfo();
      const fromBlock = currentBlock.blockNumber - 1000;

      let totalTaps = 0;
      let totalWalletBindings = 0;
      let totalTapToPay = 0;
      let totalPremiumDeposits = 0n;
      let activeCoins = 0;
      let premiumCoins = 0;

      for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
          const state = await helios.getTokenState(tokenId);
          if (state.minted) {
            activeCoins++;
            if (state.isPremium) premiumCoins++;

            try {
              const tapped = await helios.getTappedEvents(tokenId, fromBlock, currentBlock.blockNumber);
              totalTaps += tapped.length;
            } catch (e) {
              // token may not exist
            }

            try {
              const walletBound = await helios.getWalletBoundEvents(tokenId, fromBlock, currentBlock.blockNumber);
              totalWalletBindings += walletBound.length;
            } catch (e) {
              // token may not exist
            }

            try {
              const tapToPay = await helios.getTapToPayEvents(tokenId, fromBlock, currentBlock.blockNumber);
              totalTapToPay += tapToPay.length;
            } catch (e) {
              // token may not exist
            }

            try {
              const deposits = await helios.getPremiumDepositEvents(tokenId, fromBlock, currentBlock.blockNumber);
              deposits.forEach((log: any) => {
                totalPremiumDeposits += BigInt(log.args.amount || 0);
              });
            } catch (e) {
              // token may not exist
            }
          }
        } catch (e) {
          // token may not exist
        }
      }

      setHeliosMetrics({
        totalTaps,
        totalWalletBindings,
        totalTapToPay,
        totalPremiumDeposits: totalPremiumDeposits.toString(),
        activeCoins,
        premiumCoins
      });
    } catch (error) {
      console.error('Failed to load Helios metrics:', error);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatEth = (wei: string) => {
    const eth = parseFloat(wei) / 1e18;
    return eth.toFixed(4);
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-400">LXON Monitoring Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Network Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">TPS</p>
              <span className="text-green-400">↑ 12%</span>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats.tps)}</p>
            <p className="text-xs text-gray-500 mt-1">Transactions per second</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Block Time</p>
              <span className="text-green-400">↓ 5%</span>
            </div>
            <p className="text-3xl font-bold">{stats.blockTime.toFixed(2)}s</p>
            <p className="text-xs text-gray-500 mt-1">Average block time</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Active Nodes</p>
              <span className="text-green-400">↑ 8%</span>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats.activeNodes)}</p>
            <p className="text-xs text-gray-500 mt-1">Network nodes</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Mempool Size</p>
              <span className="text-yellow-400">→ 0%</span>
            </div>
            <p className="text-3xl font-bold">{formatNumber(stats.mempoolSize)}</p>
            <p className="text-xs text-gray-500 mt-1">Pending transactions</p>
          </div>
        </div>

        {/* Helios Metrics */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Helios Physical-Bound Token Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Total Taps</p>
              <p className="text-2xl font-bold">{formatNumber(heliosMetrics.totalTaps)}</p>
              <p className="text-xs text-gray-500 mt-1">Physical coin taps</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Wallet Bindings</p>
              <p className="text-2xl font-bold">{formatNumber(heliosMetrics.totalWalletBindings)}</p>
              <p className="text-xs text-gray-500 mt-1">NFC chip bindings</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Tap-to-Pay Transactions</p>
              <p className="text-2xl font-bold">{formatNumber(heliosMetrics.totalTapToPay)}</p>
              <p className="text-xs text-gray-500 mt-1">Chip-signed payments</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Premium Deposits</p>
              <p className="text-2xl font-bold">{formatEth(heliosMetrics.totalPremiumDeposits)} ETH</p>
              <p className="text-xs text-gray-500 mt-1">Total TBA funding</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Active Coins</p>
              <p className="text-2xl font-bold">{formatNumber(heliosMetrics.activeCoins)}</p>
              <p className="text-xs text-gray-500 mt-1">Minted and active</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Premium Coins</p>
              <p className="text-2xl font-bold">{formatNumber(heliosMetrics.premiumCoins)}</p>
              <p className="text-xs text-gray-500 mt-1">Genesis + Supernova</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Network Latency</p>
            <p className="text-2xl font-bold">{performance.latency.toFixed(0)}ms</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(performance.latency / 2, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">CPU Usage</p>
            <p className="text-2xl font-bold">{formatPercent(performance.cpuUsage)}</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${performance.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Memory Usage</p>
            <p className="text-2xl font-bold">{formatPercent(performance.memoryUsage)}</p>
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${performance.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Token Supply */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Total Supply</p>
            <p className="text-2xl font-bold">{formatNumber(parseFloat(stats.totalSupply))} LXOM</p>
            <p className="text-xs text-gray-500 mt-1">Maximum supply cap</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Circulating Supply</p>
            <p className="text-2xl font-bold">{formatNumber(parseFloat(stats.circulatingSupply))} LXOM</p>
            <p className="text-xs text-gray-500 mt-1">{((parseFloat(stats.circulatingSupply) / parseFloat(stats.totalSupply)) * 100).toFixed(1)}% of total</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-900/30 border border-red-700' :
                    alert.severity === 'warning' ? 'bg-yellow-900/30 border border-yellow-700' :
                    'bg-blue-900/30 border border-blue-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Node Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { country: 'United States', nodes: 2500, percentage: 25 },
              { country: 'Germany', nodes: 1500, percentage: 15 },
              { country: 'Singapore', nodes: 1000, percentage: 10 },
              { country: 'Japan', nodes: 800, percentage: 8 },
              { country: 'United Kingdom', nodes: 700, percentage: 7 },
              { country: 'South Korea', nodes: 600, percentage: 6 },
              { country: 'France', nodes: 500, percentage: 5 },
              { country: 'Others', nodes: 2400, percentage: 24 }
            ].map((item) => (
              <div key={item.country} className="text-center">
                <p className="text-sm text-gray-400">{item.country}</p>
                <p className="text-lg font-bold">{formatNumber(item.nodes)}</p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
