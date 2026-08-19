import { generateAstroWallet, signAstroTransaction } from '../wallet/astro-wallet';
import { TransactionPool } from '../mempool/tx-pool';
import { encodeP2AS } from '../address';

export interface SendTxRequest {
  to: string;
  amount: bigint;
  fee?: bigint;
}

export interface SendTxResult {
  hash: string;
  sender: string;
  recipient: string;
  amount: string;
  fee: string;
  status: 'pending' | 'rejected';
  reason?: string;
}

export function createTransferTransaction(
  wallet: ReturnType<typeof generateAstroWallet>,
  request: SendTxRequest
): any {
  const message = new Uint8Array(32);
  const { classicalSig, arcSigma, nonce } = signAstroTransaction(wallet, message);
  
  return {
    read_keys: ['balance'],
    write_dict: {
      from: wallet.astroKeypair.address,
      to: request.to,
      amount: request.amount.toString(),
    },
    astroProof: {
      version: 1,
      phase: 0,
      classicalSig: Buffer.from(classicalSig).toString('hex'),
      classicalPub: Buffer.from(wallet.astroKeypair.classicalPublicKey).toString('hex'),
      arcSigma: Buffer.from(arcSigma).toString('hex'),
      arcPubKey: Buffer.from(wallet.astroKeypair.arcPublicKey).toString('hex'),
      algorithmId: 0x04,
      ephemeralPubKey: Buffer.from(new Uint8Array(32)).toString('hex'),
      nonce,
    },
  };
}

export function sendTransaction(
  pool: TransactionPool,
  wallet: ReturnType<typeof generateAstroWallet>,
  request: SendTxRequest
): SendTxResult {
  const tx = createTransferTransaction(wallet, request);
  const fee = request.fee || 1000n;
  const sender = wallet.astroKeypair.address;

  const accepted = pool.addTransaction(tx as any, sender, fee);
  if (!accepted.accepted) {
    return {
      hash: '',
      sender,
      recipient: request.to,
      amount: request.amount.toString(),
      fee: fee.toString(),
      status: 'rejected',
      reason: accepted.reason,
    };
  }

  const hash = Buffer.from(JSON.stringify(tx)).toString('hex').slice(0, 64);
  return {
    hash,
    sender,
    recipient: request.to,
    amount: request.amount.toString(),
    fee: fee.toString(),
    status: 'pending',
  };
}

export function faucetRequest(
  pool: TransactionPool,
  address: string,
  amount: bigint = 1000000000000000000n
): SendTxResult {
  const tx = {
    read_keys: ['balance'],
    write_dict: {
      from: '0x0000000000000000000000000000000000000000',
      to: address,
      amount: amount.toString(),
    },
    type: 'faucet',
  };

  const accepted = pool.addTransaction(tx as any, '0x'.padEnd(40, '0'), 0n);
  if (!accepted.accepted) {
    return {
      hash: '',
      sender: '0x'.padEnd(40, '0'),
      recipient: address,
      amount: amount.toString(),
      fee: '0',
      status: 'rejected',
      reason: accepted.reason,
    };
  }

  const hash = Buffer.from(JSON.stringify(tx)).toString('hex').slice(0, 64);
  return {
    hash,
    sender: '0x'.padEnd(40, '0'),
    recipient: address,
    amount: amount.toString(),
    fee: '0',
    status: 'pending',
  };
}
