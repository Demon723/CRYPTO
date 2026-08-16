#!/usr/bin/env node

import { FounderCoinService } from '../services/coin-lifecycle.service';
import { FOUNDER_CONFIG, LIFECYCLE_ACTIONS } from '../config';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const service = new FounderCoinService();

async function main() {
  console.log('\n🔐 LXON Founder Device');
  console.log('======================\n');

  try {
    await service.init();
    console.log('✅ Connected to blockchain');
    console.log(`   RPC: ${FOUNDER_CONFIG.rpcUrl}`);
    console.log(`   PBT: ${FOUNDER_CONFIG.pbtAddress}`);
    console.log(`   Card Registry: ${FOUNDER_CONFIG.cardRegistryAddress}\n`);
  } catch (error: any) {
    console.error('❌ Failed to initialize:', error.message);
    console.error('\nEnsure these env vars are set:');
    console.error('  FOUNDER_PRIVATE_KEY=0x...');
    console.error('  HELIOS_PBT_ADDRESS=0x...');
    console.error('  HELIOS_CARD_REGISTRY_ADDRESS=0x...');
    console.error('  RPC_URL=http://...\n');
    process.exit(1);
  }

  showMenu();

  rl.on('line', async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    switch (trimmed.toLowerCase()) {
      case '1':
      case 'activate':
        await handleActivate();
        break;
      case '2':
      case 'freeze':
        await handleFreeze();
        break;
      case '3':
      case 'deactivate':
        await handleDeactivate();
        break;
      case '4':
      case 'status':
        await handleStatus();
        break;
      case '5':
      case 'register':
        await handleRegisterCardholder();
        break;
      case '6':
      case 'batch':
        await handleBatch();
        break;
      case 'q':
      case 'quit':
        rl.close();
        process.exit(0);
      default:
        console.log('Unknown command. Use 1-6 or q.\n');
        showMenu();
    }
  });
}

function showMenu() {
  console.log('Available commands:');
  console.log('  1) activate   - Activate a physical coin');
  console.log('  2) freeze     - Freeze a coin (stops all usage)');
  console.log('  3) deactivate - Permanently deactivate a coin');
  console.log('  4) status     - Check coin status');
  console.log('  5) register   - Register premium cardholder');
  console.log('  6) batch      - Batch activate/freeze/deactivate');
  console.log('  q) quit       - Exit\n');
}

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function handleActivate() {
  const tokenIdStr = await ask('Token ID to activate: ');
  const tokenId = parseInt(tokenIdStr, 10);
  if (isNaN(tokenId)) {
    console.log('Invalid token ID\n');
    return;
  }
  console.log(`Activating token #${tokenId}...`);
  const result = await service.activate(tokenId);
  console.log(result.success ? `✅ Activated: ${result.txHash}` : `❌ Failed: ${result.error}\n`);
}

async function handleFreeze() {
  const tokenIdStr = await ask('Token ID to freeze: ');
  const reason = await ask('Reason (optional): ');
  const tokenId = parseInt(tokenIdStr, 10);
  if (isNaN(tokenId)) {
    console.log('Invalid token ID\n');
    return;
  }
  console.log(`Freezing token #${tokenId}...`);
  const result = await service.freeze(tokenId, reason || 'Founder freeze');
  console.log(result.success ? `✅ Frozen: ${result.txHash}` : `❌ Failed: ${result.error}\n`);
}

async function handleDeactivate() {
  const tokenIdStr = await ask('Token ID to deactivate: ');
  const reason = await ask('Reason (optional): ');
  const tokenId = parseInt(tokenIdStr, 10);
  if (isNaN(tokenId)) {
    console.log('Invalid token ID\n');
    return;
  }
  console.log(`Deactivating token #${tokenId}...`);
  const result = await service.deactivate(tokenId, reason || 'Founder deactivate');
  console.log(result.success ? `✅ Deactivated: ${result.txHash}` : `❌ Failed: ${result.error}\n`);
}

async function handleStatus() {
  const tokenIdStr = await ask('Token ID to check: ');
  const tokenId = parseInt(tokenIdStr, 10);
  if (isNaN(tokenId)) {
    console.log('Invalid token ID\n');
    return;
  }
  try {
    const status = await service.getTokenStatus(tokenId);
    console.log(`\nToken #${tokenId}:`);
    console.log(`  Status: ${status.status}`);
    console.log(`  Bound Wallet: ${status.boundWallet || 'None'}`);
    console.log(`  Premium: ${status.isPremium ? 'Yes' : 'No'}\n`);
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}\n`);
  }
}

async function handleRegisterCardholder() {
  const tokenIdStr = await ask('Token ID for cardholder: ');
  const nameHash = await ask('Name hash (keccak256 of full name): ');
  const kycHash = await ask('KYC hash: ');
  const tokenId = parseInt(tokenIdStr, 10);
  if (isNaN(tokenId)) {
    console.log('Invalid token ID\n');
    return;
  }
  console.log(`Registering cardholder for token #${tokenId}...`);
  const result = await service.registerCardholder({ tokenId, nameHash, kycHash });
  console.log(result.success ? `✅ Registered: ${result.txHash}` : `❌ Failed: ${result.error}\n`);
}

async function handleBatch() {
  const action = await ask('Action (activate/freeze/deactivate): ');
  const countStr = await ask('How many tokens? ');
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count <= 0) {
    console.log('Invalid count\n');
    return;
  }

  const tokenIds: number[] = [];
  for (let i = 0; i < count; i++) {
    const idStr = await ask(`Token ID #${i + 1}: `);
    const id = parseInt(idStr, 10);
    if (!isNaN(id)) tokenIds.push(id);
  }

  if (tokenIds.length === 0) {
    console.log('No valid token IDs provided\n');
    return;
  }

  console.log(`Batch ${action} on ${tokenIds.length} tokens...`);
  let results;
  switch (action.toLowerCase()) {
    case 'activate':
      results = await service.batchActivate(tokenIds);
      break;
    case 'freeze':
      const reason = await ask('Reason: ');
      results = await service.batchFreeze(tokenIds, reason);
      break;
    case 'deactivate':
      const deactReason = await ask('Reason: ');
      results = await service.batchDeactivate(tokenIds, deactReason);
      break;
    default:
      console.log('Unknown action\n');
      return;
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n✅ ${successCount}/${results.length} succeeded\n`);
}

main();
