#!/usr/bin/env tsx

import { execSync } from 'child_process';

const BLOCKCHAIN = 'apps/lxon-blockchain';
const CONTRACTS = 'apps/contracts';
const SHARED = 'packages/shared';

function run(cmd: string, cwd: string = process.cwd()): void {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

function help(): void {
  console.log(`
LXON Cryptocurrency Program

Usage: lxon <command>

Commands:
  demo             Run blockchain performance benchmarks
  crypto:encode    Convert transactions and users to cryptographic data
  astro:demo       Run astro-resistant cryptography demo
  astro:benchmark  Run batch ARC signature verification benchmark
  genesis          Generate genesis block configuration
  node             Start JSON-RPC node server
  wallet:send      Send transaction
  wallet:receive   Generate receive address
  wallet:faucet    Request testnet funds
  build            Build all packages
  build:blockchain Build blockchain engine
  build:contracts  Compile smart contracts
  test             Run all tests
  test:blockchain  Run blockchain tests
  test:contracts   Run contract tests
  typecheck        Type-check all packages
  clean            Clean all build artifacts
  docker           Build Docker image
  compose          Start Docker Compose stack
  help             Show this help message
  `);
}

const command = process.argv[2];

switch (command) {
  case 'demo':
    run(`npx tsx ${BLOCKCHAIN}/src/demo.ts`);
    break;
  case 'crypto:encode':
    run(`npx tsx ${BLOCKCHAIN}/src/crypto-encode-demo.ts`);
    break;
  case 'astro:demo':
    run(`npx tsx ${BLOCKCHAIN}/src/astro-demo.ts`);
    break;
  case 'astro:benchmark':
    run(`npx tsx ${BLOCKCHAIN}/src/benchmark/astro-batch.ts`);
    break;
  case 'genesis':
    run(`npx tsx ${BLOCKCHAIN}/src/genesis-demo.ts`);
    break;
  case 'node':
    run(`npx tsx ${BLOCKCHAIN}/src/rpc/node.ts`);
    break;
  case 'wallet:send':
    run(`npx tsx ${BLOCKCHAIN}/src/wallet/send.ts`);
    break;
  case 'wallet:receive':
    run(`npx tsx ${BLOCKCHAIN}/src/wallet/receive.ts`);
    break;
  case 'wallet:faucet':
    run(`npx tsx ${BLOCKCHAIN}/src/wallet/faucet.ts`);
    break;
  case 'docker':
    run('docker build -t lxon-node .');
    break;
  case 'compose':
    run('docker-compose up -d');
    break;
  case 'build':
    run('pnpm run build:blockchain');
    run('pnpm run build:contracts');
    break;
  case 'build:blockchain':
    run(`pnpm --filter lxon-blockchain build`);
    break;
  case 'build:contracts':
    run(`pnpm --filter lxon-contracts compile`);
    break;
  case 'test':
    run('pnpm run test:blockchain');
    run('pnpm run test:contracts');
    break;
  case 'test:blockchain':
    run(`pnpm --filter lxon-blockchain test`);
    break;
  case 'test:contracts':
    run(`pnpm --filter lxon-contracts test`);
    break;
  case 'test:new':
    run(`npx tsx ${BLOCKCHAIN}/src/test/new-modules.test.ts`);
    break;
  case 'test:storage':
    run(`npx tsx ${BLOCKCHAIN}/src/test/storage-engine.test.ts`);
    break;
  case 'typecheck':
    run('pnpm run -r typecheck');
    break;
  case 'clean':
    run('pnpm run -r clean');
    break;
  case 'help':
  default:
    help();
    break;
}
