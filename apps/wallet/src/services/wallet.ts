import { ethers } from 'ethers';

export interface WalletState {
  address: string;
  balance: string;
  chainId: number;
  connected: boolean;
}

const LXON_CHAIN_ID = 723;
const LXON_RPC = 'http://localhost:8545';

export async function connectMetaMask(): Promise<WalletState> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(address);

  await addLXONChain();
  await switchToLXONChain();

  return {
    address,
    balance: ethers.formatEther(balance),
    chainId: Number(network.chainId),
    connected: true,
  };
}

export async function addLXONChain(): Promise<void> {
  if (typeof window.ethereum === 'undefined') return;

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x2d3',
      chainName: 'LXON Mainnet',
      nativeCurrency: {
        name: 'LXON',
        symbol: 'XON',
        decimals: 18,
      },
      rpcUrls: [LXON_RPC],
      blockExplorerUrls: [],
    }],
  });
}

export async function switchToLXONChain(): Promise<void> {
  if (typeof window.ethereum === 'undefined') return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2d3' }],
    });
  } catch (error) {
    await addLXONChain();
  }
}

export async function signMessage(message: string): Promise<string> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.signMessage(message);
}

export async function sendTransaction(to: string, value: string): Promise<string> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(value),
  });
  return tx.hash;
}

export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window.ethereum === 'undefined') return null;
  return new ethers.BrowserProvider(window.ethereum);
}
