module.exports = {
  apps: [
    {
      name: 'lxon-node',
      script: './scripts/run-local-node.js',
      cwd: '/var/www/lxon/apps/contracts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8545,
      },
    },
    {
      name: 'lxon-api',
      script: './scripts/run-api-server.js',
      cwd: '/var/www/lxon/apps/contracts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
