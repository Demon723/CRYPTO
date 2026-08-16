import React, { useState, useEffect } from 'react';
import { LXONClient } from '@lxon/sdk';
import { isPremiumTier, tierLabel, validateCardNumber } from '@lxon/helios-types';

interface WalletState {
  address: string;
  balance: string;
  utxoBalance: string;
  totalBalance: string;
  connected: boolean;
}

interface HeliosCoin {
  tokenId: number;
  tier: number;
  status: string;
  boundWallet: string;
  tba: string;
  isPremium: boolean;
  tapCount: number;
  cardNumber?: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export const Wallet: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: '',
    balance: '0',
    utxoBalance: '0',
    totalBalance: '0',
    connected: false
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'send' | 'receive' | 'history' | 'utxo' | 'helios'>('send');
  const [heliosCoins, setHeliosCoins] = useState<HeliosCoin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<HeliosCoin | null>(null);
  const [tbaBalance, setTbaBalance] = useState('0');

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
    connectWallet();
  }, []);

  useEffect(() => {
    if (tab === 'helios' && walletState.connected) {
      loadHeliosCoins();
    }
  }, [tab, walletState.connected]);

  const connectWallet = async () => {
    setLoading(true);
    try {
      await client.connect();

      const address = '0x' + Math.random().toString(16).padStart(40, '0');

      const balanceInfo = await client.getBalance(address);

      setWalletState({
        address,
        balance: balanceInfo.accountBalance.toString(),
        utxoBalance: balanceInfo.utxoBalance.toString(),
        totalBalance: balanceInfo.totalBalance.toString(),
        connected: true
      });

      loadTransactionHistory(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async (address: string) => {
    const txs: Transaction[] = [];
    for (let i = 0; i < 10; i++) {
      txs.push({
        hash: '0x' + Math.random().toString(16).padStart(64, '0'),
        from: address,
        to: '0x' + Math.random().toString(16).padStart(40, '0'),
        value: (Math.random() * 1000).toString(),
        timestamp: Date.now() - (i * 86400000),
        status: i === 0 ? 'pending' : 'confirmed'
      });
    }
    setTransactions(txs);
  };

  const loadHeliosCoins = async () => {
    if (!client.getHelios()) return;

    try {
      const helios = client.getHelios();
      if (!helios) return;

      // In production, query events to find tokens owned by this wallet
      // For now, show placeholder data
      const coins: HeliosCoin[] = [
        {
          tokenId: 1,
          tier: 0,
          status: 'ACTIVE',
          boundWallet: walletState.address,
          tba: '0x' + Math.random().toString(16).padStart(40, '0'),
          isPremium: true,
          tapCount: 42,
          cardNumber: 'H-3001-0001-4829-3'
        }
      ];

      setHeliosCoins(coins);

      if (coins.length > 0) {
        setSelectedCoin(coins[0]);
        const balance = await helios.getTBABalance(coins[0].tokenId);
        setTbaBalance(balance.toString());
      }
    } catch (error) {
      console.error('Failed to load Helios coins:', error);
    }
  };

  const sendTransaction = async () => {
    if (!recipient || !amount) return;

    setLoading(true);
    try {
      const tx = await client.createTransaction({
        to: recipient,
        value: amount
      });

      const response = await client.sendTransaction(tx);

      const newTx: Transaction = {
        hash: response.hash,
        from: walletState.address,
        to: recipient,
        value: amount,
        timestamp: Date.now(),
        status: 'pending'
      };

      setTransactions([newTx, ...transactions]);

      setRecipient('');
      setAmount('');

      alert(`Transaction sent! Hash: ${response.hash}`);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      alert('Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) / 1e18;
    return num.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-400">LXON Wallet</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Connected as</p>
              <p className="font-mono text-purple-400">{formatAddress(walletState.address)}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-200">Total Balance</p>
              <p className="text-3xl font-bold">{formatBalance(walletState.totalBalance)} LXOM</p>
            </div>
            <div>
              <p className="text-sm text-purple-200">Account Balance</p>
              <p className="text-xl font-semibold">{formatBalance(walletState.balance)} LXOM</p>
            </div>
            <div>
              <p className="text-sm text-purple-200">UTXO Balance</p>
              <p className="text-xl font-semibold">{formatBalance(walletState.utxoBalance)} LXOM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex space-x-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setTab('send')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'send'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setTab('receive')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'receive'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Receive
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'history'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setTab('utxo')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'utxo'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            UTXOs
          </button>
          <button
            onClick={() => setTab('helios')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'helios'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Helios Coins
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        {loading && tab !== 'helios' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {tab === 'send' && !loading && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Send LXOM</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (LXOM)</label>
                <input
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Available</p>
                  <p className="font-semibold">{formatBalance(walletState.totalBalance)} LXOM</p>
                </div>
                <button
                  onClick={sendTransaction}
                  disabled={!recipient || !amount}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'receive' && !loading && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Receive LXOM</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Address</label>
                <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <code className="font-mono text-purple-400">{walletState.address}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletState.address);
                      alert('Address copied to clipboard');
                    }}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">QR Code</label>
                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-800">
                    QR Code
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold p-6 pb-4">Transaction History</h2>
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">To</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Value (LXOM)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="border-t border-gray-700">
                    <td className="px-4 py-3 font-mono text-purple-400 text-sm">
                      {formatAddress(tx.hash)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {formatAddress(tx.to)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatBalance(tx.value)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'confirmed'
                          ? 'bg-green-900 text-green-300'
                          : tx.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'utxo' && !loading && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">UTXOs</h2>
            <div className="text-gray-400 text-sm mb-4">
              Your unspent transaction outputs
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-purple-400 text-sm">
                      0x{Math.random().toString(16).padStart(64, '0')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Output {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(Math.random() * 100).toFixed(2)} LXOM</p>
                    <p className="text-xs text-gray-400">
                      {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'helios' && !loading && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Helios Physical-Bound Coins</h2>
              <p className="text-gray-400 text-sm mb-4">
                Your physical acrylic coins bonded to NFC chips
              </p>

              {heliosCoins.length === 0 ? (
                <p className="text-gray-500 text-sm">No Helios coins found for this wallet</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {heliosCoins.map((coin) => (
                    <div
                      key={coin.tokenId}
                      onClick={() => setSelectedCoin(coin)}
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer border-2 ${
                        selectedCoin?.tokenId === coin.tokenId
                          ? 'border-purple-500'
                          : 'border-transparent hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg">#{coin.tokenId}</p>
                          <p className="text-sm text-gray-400">{tierLabel(coin.tier)}</p>
                          {coin.cardNumber && (
                            <p className="text-sm text-purple-400 font-mono">{coin.cardNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            coin.status === 'ACTIVE'
                              ? 'bg-green-900 text-green-300'
                              : coin.status === 'FROZEN'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {coin.status}
                          </span>
                          {coin.isPremium && (
                            <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-900 text-purple-300">
                              PREMIUM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCoin && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Coin #{selectedCoin.tokenId} Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Tier</p>
                    <p className="font-semibold">{tierLabel(selectedCoin.tier)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="font-semibold">{selectedCoin.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tap Count</p>
                    <p className="font-semibold">{selectedCoin.tapCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Bound Wallet</p>
                    <p className="font-mono text-sm">{formatAddress(selectedCoin.boundWallet)}</p>
                  </div>
                  {selectedCoin.isPremium && (
                    <>
                      <div>
                        <p className="text-sm text-gray-400">TBA Address</p>
                        <p className="font-mono text-sm">{formatAddress(selectedCoin.tba)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">TBA Balance</p>
                        <p className="font-semibold">{formatBalance(tbaBalance)} ETH</p>
                      </div>
                      {selectedCoin.cardNumber && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-400">Card Number</p>
                          <p className="font-mono text-purple-400">{selectedCoin.cardNumber}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
