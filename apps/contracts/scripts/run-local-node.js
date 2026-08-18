const { spawn } = require('child_process');

console.log('Starting LXON local node...');

const hardhat = spawn('npx', ['hardhat', 'node', '--hostname', '0.0.0.0', '--port', '8545'], {
  cwd: __dirname,
  stdio: 'inherit',
});

hardhat.on('error', (error) => {
  console.error('Failed to start node:', error);
  process.exit(1);
});

hardhat.on('close', (code) => {
  console.log(`Node process exited with code ${code}`);
  process.exit(code);
});
