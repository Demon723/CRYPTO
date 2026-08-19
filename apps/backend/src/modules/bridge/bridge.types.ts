export interface BridgeChain {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  bridgeContractAddress: string;
  explorerUrl: string;
  isEVM: boolean;
  blockTime: number;
  confirmations: number;
}

export interface BridgeToken {
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  bridgeContractAddress?: string;
  wrappedAddress?: string;
}

export interface BridgeTransfer {
  id: string;
  fromChain: BridgeChain;
  toChain: BridgeChain;
  token: BridgeToken;
  amount: string;
  sender: string;
  recipient: string;
  status: 'pending' | 'locked' | 'minted' | 'completed' | 'failed';
  fromTxHash?: string;
  toTxHash?: string;
  timestamp: number;
  completedAt?: number;
}

export interface BridgeValidator {
  address: string;
  publicKey: string;
  active: boolean;
  bondedAmount: string;
  uptime: number;
}

export interface BridgeTransferRequest {
  fromChainId: number;
  toChainId: number;
  tokenSymbol: string;
  amount: string;
  recipient: string;
}

export type BridgeStatus = 'idle' | 'connecting' | 'locked' | 'minting' | 'completed' | 'error';
