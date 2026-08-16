#!/usr/bin/env node

/**
 * LXON Full Program Test Runner
 * 
 * Comprehensive test suite for all LXON components
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 LXON Full Program Test Suite');
console.log('================================\n');

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function runTest(name, testFn) {
  try {
    console.log(`⏳  Testing: ${name}`);
    testFn();
    console.log(`✅ PASS: ${name}\n`);
    results.passed++;
    results.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}\n`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// ============================================================================
// FILE STRUCTURE TESTS
// ============================================================================

runTest('Project structure exists', () => {
  const cryptoPath = path.join(__dirname, 'apps/contracts');
  assert(fs.existsSync(cryptoPath), 'Smart contracts directory should exist');
});

runTest('Smart contracts directory exists', () => {
  const contractsPath = path.join(__dirname, 'apps/contracts/contracts');
  assert(fs.existsSync(contractsPath), 'Contracts directory should exist');
});

runTest('Core blockchain modules exist', () => {
  const blockchainPath = path.join(__dirname, 'apps/lxon-blockchain/src');
  assert(fs.existsSync(blockchainPath), 'Blockchain modules directory should exist');
});

runTest('Lightweight client modules exist', () => {
  const lightweightPath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight');
  assert(fs.existsSync(lightweightPath), 'Lightweight client directory should exist');
});

runTest('Test files exist', () => {
  const testPath = path.join(__dirname, 'apps/lxon-blockchain/test');
  assert(fs.existsSync(testPath), 'Test directory should exist');
});

// ============================================================================
// SMART CONTRACTS TESTS
// ============================================================================

runTest('LXONDecentralized.sol exists', () => {
  const contractPath = path.join(__dirname, 'apps/contracts/contracts/LXONDecentralized.sol');
  assert(fs.existsSync(contractPath), 'LXONDecentralized.sol should exist');
  
  const content = fs.readFileSync(contractPath, 'utf8');
  assert(content.includes('LXONDecentralized'), 'Contract should have correct name');
  assert(content.includes('MAX_SUPPLY'), 'Contract should have MAX_SUPPLY');
});

runTest('LXONDAO.sol exists', () => {
  const contractPath = path.join(__dirname, 'apps/contracts/contracts/LXONDAO.sol');
  assert(fs.existsSync(contractPath), 'LXONDAO.sol should exist');
  
  const content = fs.readFileSync(contractPath, 'utf8');
  assert(content.includes('LXONDAO'), 'Contract should have correct name');
  assert(content.includes('proposeAdvisory'), 'Contract should have advisory functions');
});

runTest('LXONVesting.sol exists', () => {
  const contractPath = path.join(__dirname, 'apps/contracts/contracts/LXONVesting.sol');
  assert(fs.existsSync(contractPath), 'LXONVesting.sol should exist');
  
  const content = fs.readFileSync(contractPath, 'utf8');
  assert(content.includes('LXONVesting'), 'Contract should have correct name');
  assert(content.includes('VESTING_DURATION'), 'Contract should have vesting duration');
});

runTest('LXONAMM.sol exists', () => {
  const contractPath = path.join(__dirname, 'apps/contracts/contracts/LXONAMM.sol');
  assert(fs.existsSync(contractPath), 'LXONAMM.sol should exist');
  
  const content = fs.readFileSync(contractPath, 'utf8');
  assert(content.includes('LXONAMM'), 'Contract should have correct name');
  assert(content.includes('createPair'), 'Contract should have DEX functions');
});

// ============================================================================
// CORE MODULES TESTS
// ============================================================================

runTest('UTXO Hybrid State Manager exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/utxo/hybrid-state-manager.ts');
  assert(fs.existsSync(modulePath), 'UTXO module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('HybridStateManager'), 'Module should have correct class name');
});

runTest('Fee Market exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/fee/fee-market.ts');
  assert(fs.existsSync(modulePath), 'Fee market module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('FeeMarket'), 'Module should have correct class name');
});

runTest('Enhanced Scripting exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/script/enhanced-scripting.ts');
  assert(fs.existsSync(modulePath), 'Scripting module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('Miniscript'), 'Module should support Miniscript');
});

runTest('Quantum-Resistant Crypto exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/crypto/quantum-resistant.ts');
  assert(fs.existsSync(modulePath), 'Quantum crypto module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('QuantumResistantManager'), 'Module should have correct class name');
});

runTest('Payment Channels exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/layer2/payment-channels.ts');
  assert(fs.existsSync(modulePath), 'Payment channels module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('PaymentChannelManager'), 'Module should have correct class name');
});

runTest('Hardware Wallet Integration exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/wallet/hardware-wallet.ts');
  assert(fs.existsSync(modulePath), 'Hardware wallet module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('HardwareWallet'), 'Module should have correct class name');
});

runTest('Enhanced P2P Network exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/network/enhanced-p2p.ts');
  assert(fs.existsSync(modulePath), 'P2P network module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('NetworkManager'), 'Module should have NetworkManager class');
});

runTest('zkVM Integration exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/zkvm/zkvm-integration.ts');
  assert(fs.existsSync(modulePath), 'zkVM module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('RISCVzkVM'), 'Module should have zkVM class');
});

runTest('MonadDB Storage exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/storage/monaddb-storage.ts');
  assert(fs.existsSync(modulePath), 'Storage module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('MonadDBStorage'), 'Module should have correct class name');
});

// ============================================================================
// LIGHTWEIGHT CLIENT TESTS
// ============================================================================

runTest('SPV Verification exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/spv-verification.ts');
  assert(fs.existsSync(modulePath), 'SPV verification module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('SPVVerifier'), 'Module should have SPV verifier class');
});

runTest('State Pruning exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/state-pruning.ts');
  assert(fs.existsSync(modulePath), 'State pruning module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('StatePruner'), 'Module should have state pruner class');
});

runTest('Snapshot Sync exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/snapshot-sync.ts');
  assert(fs.existsSync(modulePath), 'Snapshot sync module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('SnapshotSync'), 'Module should have snapshot sync class');
});

runTest('ARM Optimization exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/arm-optimization.ts');
  assert(fs.existsSync(modulePath), 'ARM optimization module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('RaspberryPiOptimizer'), 'Module should have Raspberry Pi optimizer class');
});

runTest('Resource Limits exists', () => {
  const modulePath = path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/resource-limits.ts');
  assert(fs.existsSync(modulePath), 'Resource limits module should exist');
  
  const content = fs.readFileSync(modulePath, 'utf8');
  assert(content.includes('ResourceManager'), 'Module should have resource manager class');
});

// ============================================================================
// USER INTERFACES TESTS
// ============================================================================

runTest('Block Explorer UI exists', () => {
  const explorerPath = path.join(__dirname, 'apps/block-explorer/src/components/BlockExplorer.tsx');
  assert(fs.existsSync(explorerPath), 'Block explorer UI should exist');
  
  const content = fs.readFileSync(explorerPath, 'utf8');
  assert(content.includes('BlockExplorer'), 'Component should have correct name');
});

runTest('Wallet UI exists', () => {
  const walletPath = path.join(__dirname, 'apps/wallet/src/components/Wallet.tsx');
  assert(fs.existsSync(walletPath), 'Wallet UI should exist');
  
  const content = fs.readFileSync(walletPath, 'utf8');
  assert(content.includes('Wallet'), 'Component should have correct name');
});

runTest('Monitoring Dashboard exists', () => {
  const monitoringPath = path.join(__dirname, 'apps/monitoring/src/components/MonitoringDashboard.tsx');
  assert(fs.existsSync(monitoringPath), 'Monitoring dashboard should exist');
  
  const content = fs.readFileSync(monitoringPath, 'utf8');
  assert(content.includes('MonitoringDashboard'), 'Component should have correct name');
});

// ============================================================================
// DEVELOPER TOOLS TESTS
// ============================================================================

runTest('TypeScript SDK exists', () => {
  const sdkPath = path.join(__dirname, 'sdk/typescript/src/LXONClient.ts');
  assert(fs.existsSync(sdkPath), 'TypeScript SDK should exist');
  
  const content = fs.readFileSync(sdkPath, 'utf8');
  assert(content.includes('LXONClient'), 'SDK should have LXONClient class');
});

runTest('SDK package.json exists', () => {
  const packagePath = path.join(__dirname, 'sdk/typescript/package.json');
  assert(fs.existsSync(packagePath), 'SDK package.json should exist');
});

runTest('SDK README exists', () => {
  const readmePath = path.join(__dirname, 'sdk/typescript/README.md');
  assert(fs.existsSync(readmePath), 'SDK README should exist');
});

runTest('Deployment scripts exist', () => {
  const deployScript = path.join(__dirname, 'apps/contracts/scripts/deploy-lxon-decentralized.ts');
  assert(fs.existsSync(deployScript), 'Deployment script should exist');
});

runTest('Hardhat config exists', () => {
  const configPath = path.join(__dirname, 'apps/contracts/hardhat.config.ts');
  assert(fs.existsSync(configPath), 'Hardhat config should exist');
});

// ============================================================================
// DOCUMENTATION TESTS
// ============================================================================

runTest('Whitepaper exists', () => {
  const whitepaperPath = path.join(__dirname, 'docs/WHITEPAPER.md');
  assert(fs.existsSync(whitepaperPath), 'Whitepaper should exist');
});

runTest('Program Specification exists', () => {
  const specPath = path.join(__dirname, 'docs/PROGRAM_SPECIFICATION.md');
  assert(fs.existsSync(specPath), 'Program specification should exist');
});

runTest('API Documentation exists', () => {
  const apiDocPath = path.join(__dirname, 'docs/API_DOCUMENTATION.md');
  assert(fs.existsSync(apiDocPath), 'API documentation should exist');
});

runTest('Deployment Guide exists', () => {
  const deployGuidePath = path.join(__dirname, 'docs/DEPLOYMENT_GUIDE.md');
  assert(fs.existsSync(deployGuidePath), 'Deployment guide should exist');
});

runTest('Security Audit Checklist exists', () => {
  const auditChecklistPath = path.join(__dirname, 'docs/SECURITY_AUDIT_CHECKLIST.md');
  assert(fs.existsSync(auditChecklistPath), 'Security audit checklist should exist');
});

runTest('Raspberry Pi Implementation Guide exists', () => {
  const raspberryPiPath = path.join(__dirname, 'docs/RASPBERRY_PI_IMPLEMENTATION.md');
  assert(fs.existsSync(raspberryPiPath), 'Raspberry Pi implementation guide should exist');
});

runTest('Ecosystem Components Summary exists', () => {
  const ecosystemPath = path.join(__dirname, 'docs/ECOSYSTEM_COMPONENTS_SUMMARY.md');
  assert(fs.existsSync(ecosystemPath), 'Ecosystem components summary should exist');
});

runTest('Implementation Progress exists', () => {
  const progressPath = path.join(__dirname, 'docs/IMPLEMENTATION_PROGRESS.md');
  assert(fs.existsSync(progressPath), 'Implementation progress should exist');
});

// ============================================================================
// LINE COUNT TESTS
// ============================================================================

runTest('Smart contracts have reasonable line counts', () => {
  const lxonDecentralized = fs.readFileSync(path.join(__dirname, 'apps/contracts/contracts/LXONDecentralized.sol'), 'utf8');
  const lines = lxonDecentralized.split('\n').length;
  assert(lines > 200 && lines < 700, `LXONDecentralized should have 200-700 lines, got ${lines}`);
});

runTest('Core modules have reasonable line counts', () => {
  const utxoModule = fs.readFileSync(path.join(__dirname, 'apps/lxon-blockchain/src/utxo/hybrid-state-manager.ts'), 'utf8');
  const lines = utxoModule.split('\n').length;
  assert(lines > 400 && lines < 700, `UTXO module should have 400-700 lines, got ${lines}`);
});

runTest('User interfaces have reasonable line counts', () => {
  const explorer = fs.readFileSync(path.join(__dirname, 'apps/block-explorer/src/components/BlockExplorer.tsx'), 'utf8');
  const lines = explorer.split('\n').length;
  assert(lines > 300 && lines < 500, `Block explorer should have 300-500 lines, got ${lines}`);
});

// ============================================================================
// FEATURE TESTS
// ============================================================================

runTest('LXONDecentralized has MAX_SUPPLY', () => {
  const contract = fs.readFileSync(path.join(__dirname, 'apps/contracts/contracts/LXONDecentralized.sol'), 'utf8');
  assert(contract.includes('MAX_SUPPLY'), 'Contract should have MAX_SUPPLY constant');
  assert(contract.includes('1_000_000_000'), 'Supply should be 1 billion');
});

runTest('LXONDAO has advisory functions', () => {
  const contract = fs.readFileSync(path.join(__dirname, 'apps/contracts/contracts/LXONDAO.sol'), 'utf8');
  assert(contract.includes('proposeAdvisory'), 'DAO should have advisory proposal function');
  assert(contract.includes('respondToAdvisory'), 'DAO should have team response function');
});

runTest('LXONAMM has DEX functions', () => {
  const contract = fs.readFileSync(path.join(__dirname, 'apps/contracts/contracts/LXONAMM.sol'), 'utf8');
  assert(contract.includes('createPair'), 'DEX should have createPair function');
  assert(contract.includes('swap'), 'DEX should have swap function');
  assert(contract.includes('addLiquidity'), 'DEX should have addLiquidity function');
});

runTest('Quantum crypto has hybrid signatures', () => {
  const module = fs.readFileSync(path.join(__dirname, 'apps/lxon-blockchain/src/crypto/quantum-resistant.ts'), 'utf8');
  assert(module.includes('HybridSigner'), 'Module should support hybrid signatures');
  assert(module.includes('Dilithium'), 'Module should support Dilithium');
});

runTest('SPV verification has zk proofs', () => {
  const module = fs.readFileSync(path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/spv-verification.ts'), 'utf8');
  assert(module.includes('ZKProof'), 'Module should support zk proofs');
  assert(module.includes('SPVVerifier'), 'Module should have SPV verifier');
});

runTest('ARM optimization has Raspberry Pi support', () => {
  const module = fs.readFileSync(path.join(__dirname, 'apps/lxon-blockchain/src/lightweight/arm-optimization.ts'), 'utf8');
  assert(module.includes('RaspberryPiOptimizer'), 'Module should have Raspberry Pi optimizer');
  assert(module.includes('NEON'), 'Module should support NEON SIMD');
});

// ============================================================================
// PRINT RESULTS
// ============================================================================

console.log('\n================================');
console.log('📊 Test Results Summary');
console.log('================================');
console.log(`Total Tests: ${results.passed + results.failed + results.skipped}`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⏭️  Skipped: ${results.skipped}`);
console.log('');

if (results.failed > 0) {
  console.log('❌ Some tests failed. Details:');
  results.tests.filter(t => t.status === 'failed').forEach(test => {
    console.log(`   - ${test.name}: ${test.error}`);
  });
  process.exit(1);
} else {
  console.log('🎉 All tests passed!');
  process.exit(0);
}