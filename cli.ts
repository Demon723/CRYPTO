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
  build            Build all packages
  build:blockchain Build blockchain engine
  build:contracts  Compile smart contracts
  test             Run all tests
  test:blockchain  Run blockchain tests
  test:contracts   Run contract tests
  typecheck        Type-check all packages
  clean            Clean all build artifacts
  help             Show this help message
  `);
}

const command = process.argv[2];

switch (command) {
  case 'demo':
    run(`npx tsx ${BLOCKCHAIN}/src/demo.ts`);
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
