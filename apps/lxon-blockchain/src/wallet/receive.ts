import { generateAstroWallet, deriveAddress } from '../wallet/astro-wallet';
import { encodeP2AS } from '../address';
import { encodeP2PKH } from '../address';
import { createHash } from 'crypto';

export interface ReceiveAddress {
  address: string;
  type: 'classical' | 'astro';
  publicKey: string;
  path: string;
}

export function generateReceiveAddress(wallet: ReturnType<typeof generateAstroWallet>, type: 'classical' | 'astro' = 'astro'): ReceiveAddress {
  if (type === 'astro') {
    const astroAddress = encodeP2AS(wallet.astroKeypair.classicalPublicKey, wallet.astroKeypair.arcPublicKey);
    return {
      address: astroAddress,
      type: 'astro',
      publicKey: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
      path: wallet.astroPath,
    };
  }

  const address = encodeP2PKH(wallet.astroKeypair.classicalPublicKey);
  return {
    address,
    type: 'classical',
    publicKey: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
    path: "m/44'/0'/0'/0/0",
  };
}

export function generateNewAddress(): ReceiveAddress {
  const wallet = generateAstroWallet();
  return generateReceiveAddress(wallet, 'astro');
}

export function hashMessage(message: string): string {
  return createHash('sha256').update(message).digest('hex');
}
