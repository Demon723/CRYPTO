import React, { useState, useEffect } from 'react';
import { LXONClient } from '@lxon/sdk';

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  gasLimit: string;
}

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'success' | 'failed';
}

interface HeliosEvent {
  type: 'Tapped' | 'WalletBound' | 'TapToPay' | 'PremiumDeposit' | 'Activated' | 'Frozen' | 'Deactivated';
  tokenId: number;
  timestamp: number;
  data: any;
}

export const BlockExplorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'blocks' | 'transactions' | 'helios'>('blocks');
  const [heliosEvents, setHeliosEvents] = useState<HeliosEvent[]>([]);

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
    loadBlocks();
  }, []);

  useEffect(() => {
    if (tab === 'helios') {
      loadHeliosEvents();
    }
  }, [tab]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      await client.connect();
      const networkInfo = await client.getNetworkInfo();

      const recentBlocks: Block[] = [];
      for (let i = 0; i < 10; i++) {
        const blockNumber = networkInfo.blockNumber - i;
        recentBlocks.push({
          number: blockNumber,
          hash: `0x${blockNumber}`,
          parentHash: `0x${blockNumber - 1}`,
          timestamp: Date.now() - (i * 12000),
          transactions: Math.floor(Math.random() * 100) + 50,
          gasUsed: (Math.random() * 15e6).toString(),
          gasLimit: '15000000'
        });
      }

      setBlocks(recentBlocks);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockTransactions = async (block: Block) => {
    setLoading(true);
    try {
      const txs: Transaction[] = [];
      for (let i = 0; i < block.transactions; i++) {
        txs.push({
          hash: `0x${Math.random().toString(16).padStart(64, '0')}`,
          blockNumber: block.number,
          from: `0x${Math.random().toString(16).padStart(40, '0')}`,
          to: `0x${Math.random().toString(16).padStart(40, '0')}`,
          value: (Math.random() * 1000).toString(),
          gasUsed: (Math.random() * 100000).toString(),
          status: Math.random() > 0.1 ? 'success' : 'failed'
        });
      }

      setTransactions(txs);
      setSelectedBlock(block);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHeliosEvents = async () => {
    if (!client.getHelios()) return;

    try {
      const helios = client.getHelios();
      if (!helios) return;

      const currentBlock = await client.getNetworkInfo();
      const fromBlock = currentBlock.blockNumber - 1000;

      const events: HeliosEvent[] = [];

      try {
        const tapped = await helios.getTappedEvents(1, fromBlock, currentBlock.blockNumber);
        tapped.forEach((log) => {
          events.push({
            type: 'Tapped',
            tokenId: log.args.tokenId?.toNumber() || 0,
            timestamp: Number(log.blockTimestamp || Date.now()),
            data: log.args
          });
        });
      } catch (e) {
        // Token may not exist
      }

      try {
        const walletBound = await helios.getWalletBoundEvents(1, fromBlock, currentBlock.blockNumber);
        walletBound.forEach((log) => {
          events.push({
            type: 'WalletBound',
            tokenId: log.args.tokenId?.toNumber() || 0,
            timestamp: Number(log.blockTimestamp || Date.now()),
            data: log.args
          });
        });
      } catch (e) {
        // Token may not exist
      }

      try {
        const tapToPay = await helios.getTapToPayEvents(1, fromBlock, currentBlock.blockNumber);
        tapToPay.forEach((log) => {
          events.push({
            type: 'TapToPay',
            tokenId: log.args.tokenId?.toNumber() || 0,
            timestamp: Number(log.blockTimestamp || Date.now()),
            data: log.args
          });
        });
      } catch (e) {
        // Token may not exist
      }

      events.sort((a, b) => b.timestamp - a.timestamp);
      setHeliosEvents(events.slice(0, 50));
    } catch (error) {
      console.error('Failed to load Helios events:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      if (searchQuery.startsWith('0x') && searchQuery.length === 66) {
        const tx: Transaction = {
          hash: searchQuery,
          blockNumber: Math.floor(Math.random() * 1000000),
          from: `0x${Math.random().toString(16).padStart(40, '0')}`,
          to: `0x${Math.random().toString(16).padStart(40, '0')}`,
          value: (Math.random() * 1000).toString(),
          gasUsed: (Math.random() * 100000).toString(),
          status: 'success'
        };
        setTransactions([tx]);
        setTab('transactions');
      } else if (!isNaN(parseInt(searchQuery))) {
        const blockNumber = parseInt(searchQuery);
        const block: Block = {
          number: blockNumber,
          hash: `0x${blockNumber}`,
          parentHash: `0x${blockNumber - 1}`,
          timestamp: Date.now() - (1000000 - blockNumber) * 12000,
          transactions: Math.floor(Math.random() * 100) + 50,
          gasUsed: (Math.random() * 15e6).toString(),
          gasLimit: '15000000'
        };
        setSelectedBlock(block);
        await loadBlockTransactions(block);
        setTab('blocks');
      } else {
        setTab('transactions');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    return num.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-purple-400">LXON Explorer</h1>
            <span className="text-sm text-gray-400">Mainnet</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by address, tx hash, or block"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-96 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setTab('blocks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'blocks'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Blocks
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'transactions'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setTab('helios')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'helios'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Helios Events
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {tab === 'blocks' && !loading && (
          <div>
            {selectedBlock ? (
              <div>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="mb-4 text-purple-400 hover:text-purple-300 text-sm"
                >
                  ← Back to blocks
                </button>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Block #{selectedBlock.number}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Block Hash:</span>
                      <p className="font-mono text-purple-400">{selectedBlock.hash}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Parent Hash:</span>
                      <p className="font-mono">{selectedBlock.parentHash}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp:</span>
                      <p>{formatTimestamp(selectedBlock.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Transactions:</span>
                      <p>{selectedBlock.transactions}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Gas Used:</span>
                      <p>{selectedBlock.gasUsed} / {selectedBlock.gasLimit}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Transactions</h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Tx Hash</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">From</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">To</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Value (LXOM)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Gas Used</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.hash} className="border-t border-gray-700 hover:bg-gray-700">
                          <td className="px-4 py-3 font-mono text-purple-400 text-sm">
                            {formatAddress(tx.hash)}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {formatAddress(tx.from)}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {formatAddress(tx.to)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatValue(tx.value)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {tx.gasUsed}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.status === 'success'
                                ? 'bg-green-900 text-green-300'
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
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Block</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Timestamp</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Transactions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Gas Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map((block) => (
                      <tr
                        key={block.number}
                        onClick={() => loadBlockTransactions(block)}
                        className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-bold text-purple-400">
                          #{block.number}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {formatAddress(block.hash)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatTimestamp(block.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {block.transactions}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {block.gasUsed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'transactions' && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Block</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">To</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Value (LXOM)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300">Gas Used</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.hash} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="px-4 py-3 font-mono text-purple-400 text-sm">
                      {formatAddress(tx.hash)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      #{tx.blockNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {formatAddress(tx.from)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {formatAddress(tx.to)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatValue(tx.value)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {tx.gasUsed}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'success'
                          ? 'bg-green-900 text-green-300'
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

        {tab === 'helios' && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Helios Events</h2>
              <p className="text-gray-400 text-sm mt-1">
                Physical-bound token events: taps, bindings, payments, and lifecycle changes
              </p>
            </div>
            {heliosEvents.length === 0 ? (
              <div className="p-6 text-gray-400 text-sm">
                No Helios events found. Ensure Helios contracts are configured.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Token ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {heliosEvents.map((event, idx) => (
                    <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.type === 'TapToPay' ? 'bg-green-900 text-green-300' :
                          event.type === 'WalletBound' ? 'bg-blue-900 text-blue-300' :
                          event.type === 'Tapped' ? 'bg-purple-900 text-purple-300' :
                          event.type === 'Activated' ? 'bg-green-900 text-green-300' :
                          event.type === 'Frozen' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        #{event.tokenId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatTimestamp(event.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">
                        {JSON.stringify(event.data).slice(0, 100)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
