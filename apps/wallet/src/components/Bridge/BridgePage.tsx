import React, { useState, useEffect } from 'react';
import { BridgeChain, BridgeToken, BridgeTransfer } from '../../../../apps/LXON-blockchain/src/bridge/types';
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from '../../../../apps/LXON-blockchain/src/bridge/chains';
import { bridgeService } from '../../../../apps/LXON-blockchain/src/bridge/bridge-service';
import './Bridge.css';

type BridgeStep = 'select' | 'lock' | 'mint' | 'complete';

export const BridgePage: React.FC = () => {
  const [fromChain, setFromChain] = useState<BridgeChain | null>(null);
  const [toChain, setToChain] = useState<BridgeChain | null>(null);
  const [token, setToken] = useState<BridgeToken | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState<BridgeStep>('select');
  const [transfer, setTransfer] = useState<BridgeTransfer | null>(null);
  const [fee, setFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BridgeTransfer[]>([]);

  useEffect(() => {
    const defaultFrom = SUPPORTED_CHAINS.find((c) => c.chainId === 199);
    const defaultTo = SUPPORTED_CHAINS.find((c) => c.chainId === 1);
    if (defaultFrom) setFromChain(defaultFrom);
    if (defaultTo) setToChain(defaultTo);
    if (SUPPORTED_TOKENS[0]) setToken(SUPPORTED_TOKENS[0]);

    const unsub = bridgeService.onStatusChange((status) => {
      setStep(status as BridgeStep);
    });
    return unsub;
  }, []);

  const handleEstimateFee = async () => {
    if (!fromChain || !token || !amount) return;
    try {
      const estimatedFee = await bridgeService.estimateFee(
        fromChain.chainId,
        toChain?.chainId || 1,
        amount
      );
      setFee(estimatedFee);
    } catch (err) {
      setError('Failed to estimate fee');
    }
  };

  const handleBridge = async () => {
    if (!fromChain || !toChain || !token || !amount || !recipient) return;
    setLoading(true);
    setError(null);
    try {
      const result = await bridgeService.initiateTransfer({
        fromChainId: fromChain.chainId,
        toChainId: toChain.chainId,
        tokenSymbol: token.symbol,
        amount,
        sender: '0xCurrentUser',
        recipient,
      });
      setTransfer(result);
      setHistory((prev) => [result, ...prev]);
      setStep('lock');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bridge transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bridge-page">
      <h1>Bridge Assets</h1>
      <p className="bridge-subtitle">Transfer tokens across chains securely</p>

      {error && <div className="bridge-error">{error}</div>}

      <div className="bridge-card">
        <div className="bridge-row">
          <div className="bridge-field">
            <label>From Chain</label>
            <select
              value={fromChain?.chainId || ''}
              onChange={(e) => {
                const chain = SUPPORTED_CHAINS.find((c) => c.chainId === Number(e.target.value));
                setFromChain(chain || null);
              }}
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bridge-arrow">→</div>

          <div className="bridge-field">
            <label>To Chain</label>
            <select
              value={toChain?.chainId || ''}
              onChange={(e) => {
                const chain = SUPPORTED_CHAINS.find((c) => c.chainId === Number(e.target.value));
                setToChain(chain || null);
              }}
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bridge-field">
          <label>Token</label>
          <select
            value={token?.symbol || ''}
            onChange={(e) => {
              const t = SUPPORTED_TOKENS.find((tok) => tok.symbol === e.target.value);
              setToken(t || null);
            }}
          >
            {SUPPORTED_TOKENS.map((tok) => (
              <option key={tok.symbol} value={tok.symbol}>
                {tok.name} ({tok.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="bridge-field">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.0001"
          />
        </div>

        <div className="bridge-field">
          <label>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="bridge-fee">
          <span>Estimated Fee: {fee} {token?.symbol}</span>
          <button onClick={handleEstimateFee} disabled={!amount}>
            Estimate Fee
          </button>
        </div>

        <button
          className="bridge-button"
          onClick={handleBridge}
          disabled={
            loading ||
            !fromChain ||
            !toChain ||
            !token ||
            !amount ||
            !recipient
          }
        >
          {loading ? 'Processing...' : 'Bridge Assets'}
        </button>
      </div>

      {step !== 'select' && transfer && (
        <div className="bridge-status-card">
          <h3>Transfer Status</h3>
          <div className="status-steps">
            <div className={`status-step ${step === 'lock' || step === 'mint' || step === 'complete' ? 'active' : ''}`}>
              <span className="step-icon">1</span>
              <span>Lock</span>
            </div>
            <div className={`status-step ${step === 'mint' || step === 'complete' ? 'active' : ''}`}>
              <span className="step-icon">2</span>
              <span>Confirm</span>
            </div>
            <div className={`status-step ${step === 'complete' ? 'active' : ''}`}>
              <span className="step-icon">3</span>
              <span>Mint</span>
            </div>
          </div>
          <div className="transfer-details">
            <p><strong>Transfer ID:</strong> {transfer.id}</p>
            <p><strong>Amount:</strong> {transfer.amount} {transfer.token.symbol}</p>
            <p><strong>From:</strong> {fromChain?.name}</p>
            <p><strong>To:</strong> {toChain?.name}</p>
            {transfer.fromTxHash && (
              <p><strong>Source TX:</strong> <a href={`${fromChain?.explorerUrl}/tx/${transfer.fromTxHash}`} target="_blank" rel="noreferrer">{transfer.fromTxHash.slice(0, 10)}...</a></p>
            )}
            {transfer.toTxHash && (
              <p><strong>Destination TX:</strong> <a href={`${toChain?.explorerUrl}/tx/${transfer.toTxHash}`} target="_blank" rel="noreferrer">{transfer.toTxHash.slice(0, 10)}...</a></p>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bridge-history">
          <h3>Recent Transfers</h3>
          {history.map((t) => (
            <div key={t.id} className="history-item">
              <div className="history-header">
                <span className="history-token">{t.amount} {t.token.symbol}</span>
                <span className={`history-status status-${t.status}`}>{t.status}</span>
              </div>
              <div className="history-details">
                <span>{t.fromChain.name} → {t.toChain.name}</span>
                <span>{new Date(t.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
