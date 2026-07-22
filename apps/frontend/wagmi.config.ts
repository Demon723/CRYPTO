const { createConfig } = require('@wagmi/core');

const config = createConfig({
  chains: [],
  transports: {},
});

module.exports = config;
