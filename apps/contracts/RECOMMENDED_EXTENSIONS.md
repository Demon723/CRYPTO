# Recommended Extensions for LXON Blockchain Development

## 🖥️ VS Code Extensions

### Blockchain Development
```bash
# Solidity Extension (Essential)
# Extension ID: JuanBlanco.solidity
# Features: Syntax highlighting, code completion, linting for Solidity
code --install-extension JuanBlanco.solidity

# Hardhat Extension
# Extension ID: NomicFoundation.hardhat-solidity
# Features: Hardhat integration, task running, debugging
code --install-extension NomicFoundation.hardhat-solidity

# Ethereum Remix Extension
# Extension ID: RemixProject.remix-ide
# Features: Full Remix IDE integration in VS Code
code --install-extension RemixProject.remix-ide
```

### Git & Version Control
```bash
# GitLens (Enhanced Git)
# Extension ID: eamodio.gitlens
# Features: Git supercharged, blame annotations, file history
code --install-extension eamodio.gitlens

# GitHub Pull Requests
# Extension ID: GitHub.vscode-pull-request-github
# Features: PR management, review, merge in VS Code
code --install-extension GitHub.vscode-pull-request-github

# Git Graph
# Extension ID: mhutchie.git-graph
# Features: Visual Git commit graph, branch visualization
code --install-extension mhutchie.git-graph
```

### Remote Development
```bash
# Remote - SSH
# Extension ID: ms-vscode-remote.remote-ssh
# Features: Connect to remote servers via SSH
code --install-extension ms-vscode-remote.remote-ssh

# Remote - Containers
# Extension ID: ms-vscode-remote.remote-containers
# Features: Develop inside Docker containers
code --install-extension ms-vscode-remote.remote-containers
```

### Terminal & Shell
```bash
# ShellCheck
# Extension ID: timonwong.shellcheck
# Features: Shell script linting and error detection
code --install-extension timonwong.shellcheck

# Shell-format
# Extension ID: foxundermoon.shell-format
# Features: Shell script formatting
code --install-extension foxundermoon.shell-format
```

### Code Quality
```bash
# ESLint
# Extension ID: dbaeumer.vscode-eslint
# Features: JavaScript/TypeScript linting
code --install-extension dbaeumer.vscode-eslint

# Prettier
# Extension ID: esbenp.prettier-vscode
# Features: Code formatter for multiple languages
code --install-extension esbenp.prettier-vscode

# Error Lens
# Extension ID: usernamehw.errorlens
# Features: Inline error and warning display
code --install-extension usernamehw.errorlens
```

---

## 🌐 Browser Extensions

### Essential Blockchain Extensions
```bash
# MetaMask (Required)
# Chrome Web Store: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
# Features: Ethereum wallet, DApp interaction, network switching

# Rabby Wallet (Alternative)
# Chrome Web Store: https://chrome.google.com/webstore/detail/rabby-wallet/acmacfkjfidmmfdifllnloijbkokmdeg
# Features: Multi-chain wallet, better UX than MetaMask

# WalletConnect
# Chrome Web Store: https://chrome.google.com/webstore/detail/walletconnect/kncchdigobghppddbfolckgmcdmdhmh
# Features: Connect mobile wallets to DApps
```

### Development Tools
```bash
# OpenZeppelin Defender
# Chrome Web Store: https://chrome.google.com/webstore/detail/openzeppelin-defender/kljhejmmjhnoognlnddgkagmkfjgjgjo
# Features: Smart contract monitoring, security tools

# Tenderly
# Chrome Web Store: https://chrome.google.com/webstore/detail/tenderly/bjfhmglcgoohhagkobadbbbdpmljfhki
# Features: Transaction debugging, contract simulation

# Blockscan Chat
# Chrome Web Store: https://chrome.google.com/webstore/detail/blockscan-chat/fnnagnphjhjpmkooijpmnffhacmjdmmj
# Features: ENS messaging, blockchain communication
```

### Network Tools
```bash
# Arbitrum Bridge
# Chrome Web Store: https://chrome.google.com/webstore/detail/arbitrum-bridge/ffbahbkiaiabjoknnfgmelmkfpkmlgmp
# Features: Bridge assets between Ethereum and Arbitrum

# Polygon Bridge
# Chrome Web Store: https://chrome.google.com/webstore/detail/polygon-bridge/poolkjgabepbnjbgdopfmhphbdkjgjgj
# Features: Bridge assets between Ethereum and Polygon
```

---

## 🔧 Terminal Tools & CLI Extensions

### Essential CLI Tools
```bash
# Install Homebrew (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and npm
brew install node

# Install Hardhat
npm install --global hardhat

# Install Ganache (local blockchain)
npm install --global ganache

# Install Truffle (alternative to Hardhat)
npm install --global truffle

# Install Foundry (Rust-based Ethereum toolkit)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### GCE & Cloud Tools
```bash
# Install Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Initialize gcloud
gcloud init

# Install SSH keys for GCE
gcloud compute ssh --project=PROJECT_ID --zone=ZONE INSTANCE_NAME

# Install kubectl (if using Kubernetes)
brew install kubectl
```

### Git Tools
```bash
# Install GitHub CLI
brew install gh

# Authenticate GitHub CLI
gh auth login

# Install Git LFS (Large File Storage)
brew install git-lfs

# Install lazygit (terminal UI for git)
brew install lazygit
```

---

## 📱 Mobile Apps

### Wallet Apps
```bash
# MetaMask Mobile
# iOS: https://apps.apple.com/app/metamask/id1438147502
# Android: https://play.google.com/store/apps/details?id=io.metamask

# Trust Wallet
# iOS: https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409
# Android: https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp

# Coinbase Wallet
# iOS: https://apps.apple.com/app/coinbase-wallet/id1278383455
# Android: https://play.google.com/store/apps/details?id=com.coinbase.wallet
```

### Blockchain Explorers
```bash
# Blockscan
# iOS: https://apps.apple.com/app/blockscan/id1515709276
# Android: https://play.google.com/store/apps/details?id=com.blockscan

# Etherscan
# Web: https://etherscan.io
# Features: Transaction explorer, contract verification
```

---

## 🎯 Quick Installation Commands

### Install All VS Code Extensions (macOS/Linux)
```bash
# Blockchain Development
code --install-extension JuanBlanco.solidity
code --install-extension NomicFoundation.hardhat-solidity
code --install-extension RemixProject.remix-ide

# Git & Version Control
code --install-extension eamodio.gitlens
code --install-extension GitHub.vscode-pull-request-github
code --install-extension mhutchie.git-graph

# Remote Development
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension ms-vscode-remote.remote-containers

# Terminal & Shell
code --install-extension timonwong.shellcheck
code --install-extension foxundermoon.shell-format

# Code Quality
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
```

### Install CLI Tools (macOS)
```bash
# Update Homebrew
brew update

# Install development tools
brew install node git gh lazygit kubectl

# Install blockchain tools
npm install --global hardhat ganache truffle

# Install GCE tools
brew install google-cloud-sdk

# Initialize tools
gcloud init
gh auth login
```

---

## 🔍 Verification Commands

### Check Installed Extensions
```bash
# List VS Code extensions
code --list-extensions

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Hardhat version
npx hardhat --version

# Check gcloud version
gcloud --version

# Check gh version
gh --version
```

---

## 📋 Recommended Setup Order

1. **Install VS Code Extensions First**
   - Solidity extension for smart contract development
   - GitLens for version control
   - Remote SSH for GCE server access

2. **Install Browser Extensions**
   - MetaMask for wallet functionality
   - Network-specific bridge extensions

3. **Install CLI Tools**
   - Node.js and npm for package management
   - Hardhat for contract deployment
   - gcloud for GCE server management

4. **Configure Tools**
   - Initialize gcloud with GCE credentials
   - Set up GitHub CLI authentication
   - Configure MetaMask with testnet networks

---

**Last Updated:** September 2, 2026
**Purpose:** Complete development environment setup for LXON blockchain project
