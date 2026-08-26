import { ethers } from 'hardhat';
import * as https from 'https';
import * as http from 'http';

async function requestFaucet(url: string, address: string, amount: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ address, amount });
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid faucet response: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const network = process.argv.includes('--network') ? process.argv[process.argv.indexOf('--network') + 1] : 'lxon';
  
  let rpcUrl: string;
  if (network === 'localhost') {
    rpcUrl = 'http://127.0.0.1:8545';
  } else if (network === 'lxon') {
    rpcUrl = process.env.LXON_RPC_URL || 'http://34.44.174.4:8545';
  } else {
    console.error('❌ Unsupported network for faucet funding. Use --network lxon or --network localhost');
    process.exit(1);
  }

  const faucetUrl = rpcUrl.replace(/\/$/, '') + '/faucet';
  console.log('🚰 LXON Faucet Funding\n');
  console.log('  Network:', network);
  console.log('  RPC URL:', rpcUrl);
  console.log('  Faucet URL:', faucetUrl);
  console.log();

  const [deployer] = await ethers.getSigners();
  console.log('📋 Target Account:', deployer.address);

  // Check current balance
  try {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('  Current Balance:', ethers.formatEther(balance), 'ETH');
    if (balance > 0n) {
      console.log('  ⏭️  Account already has funds');
      return;
    }
  } catch (e) {
    console.log('  ⚠️  Could not check balance');
  }

  // Request from faucet
  console.log('\n🚰 Requesting funds from faucet...');
  try {
    const result = await requestFaucet(faucetUrl, deployer.address, '1000000000000000000');
    if (result.status === 'pending' || result.txHash) {
      console.log('✅ Faucet request submitted');
      console.log('  TxHash:', result.txHash || result.hash);
      console.log('  Amount: 1 ETH');
      console.log('\n💡 Wait a few seconds, then verify with:');
      console.log(`   npx hardhat run scripts/fund-lxon.ts --network ${network}`);
    } else if (result.error) {
      console.error('❌ Faucet error:', result.error.message || result.error);
      process.exit(1);
    } else {
      console.log('✅ Faucet request result:', result);
    }
  } catch (error) {
    console.error('❌ Faucet request failed:', error);
    console.error('\n💡 Possible reasons:');
    console.error('  - Faucet endpoint not available on remote node');
    console.error('  - Node needs to be rebuilt with faucet support');
    console.error('  - Use localhost for development: npx hardhat node');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Funding failed:', error);
    process.exit(1);
  });
