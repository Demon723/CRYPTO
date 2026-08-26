import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: 'cancun'
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    lxon: {
      url: 'http://3.110.221.224:8545',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 723
    },
    lxonnative: {
      url: 'http://3.110.221.224:8545',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 723
    },
    lxonMainnet: {
      url: process.env.LXON_RPC_URL || 'http://3.110.221.224:8545',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 723
    },
    gce: {
      url: process.env.GCE_RPC_URL || 'http://3.110.221.224:8545',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 723
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1
    },
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        (process.env.INFURA_API_KEY
          ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
          : 'https://ethereum-sepolia-rpc.publicnode.com'),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120_000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    currency: 'USD'
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  }
};

export default config;