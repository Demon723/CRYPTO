# Gemini Prompt for Google Cloud Setup

**Copy and paste this prompt into Gemini to set up Google Cloud Platform for LXON blockchain deployment:**

---

I need to set up a Google Cloud Platform environment to deploy a blockchain node and smart contracts. Please guide me through the complete setup process with specific commands and steps.

## Context:
- I have a blockchain project called LXON with smart contracts
- I need to deploy the blockchain node and smart contracts to production
- I have experience with AWS but AWS instances are currently unreachable due to network issues
- I want to use Google Cloud Platform as an alternative

## Requirements:
1. Create a Google Cloud project
2. Set up a Compute Engine VM instance
3. Configure SSH access
4. Install necessary dependencies (Node.js, pnpm, git)
5. Clone the LXON project repository
6. Build the blockchain package
7. Deploy smart contracts

## Technical Details:
- **Project Name**: LXON-Blockchain
- **Instance Name**: lxon-blockchain-node
- **OS**: Ubuntu 22.04 LTS
- **Machine Type**: e2-small (or similar cost-effective option)
- **Disk Size**: 20GB SSD
- **Region**: Asia-south1 (or nearest region to India)
- **Required Software**: Node.js, pnpm, git

## Project Structure:
The LXON project is located at: /Users/adikamble/LXON/LXON
It contains:
- Smart contracts in apps/contracts
- Blockchain node in apps/lxon-blockchain
- Uses pnpm for package management
- Hardhat for smart contract deployment

## Deployment Credentials:
- Deployment account address: 0x14c870D65A513d3e01e8D0Bfd4115979a9cB6976
- Private key: 0xb61156c1ec13e33b775e5f7bfb1054ed640cbe71472f6dcf0060e778db4824f8

## Smart Contract Details:
- Main contract: LXON.sol (ERC20 token)
- Token name: LXON
- Token symbol: LXON
- Initial supply: 100,000,000 LXON
- Max supply: 1,000,000,000 LXON

## Please provide:
1. Step-by-step Google Cloud Console setup instructions
2. Exact commands to run in the GCE instance terminal
3. Network configuration steps to ensure SSH access works
4. Security group/firewall rules needed
5. How to verify the setup is working
6. Commands to deploy the smart contracts

## Important Notes:
- Make sure SSH access is properly configured (this was an issue with AWS)
- Ensure the instance has public IP and internet access
- Configure proper firewall rules for SSH (port 22) and RPC (port 8545)
- Provide troubleshooting steps if SSH connection fails

Please give me a complete, actionable guide with all the commands I need to run.
