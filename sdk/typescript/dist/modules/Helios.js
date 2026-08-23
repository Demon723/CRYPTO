"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeliosModule = void 0;
const ethers_1 = require("ethers");
const HeliosPBTv3_abi_json_1 = __importDefault(require("../../abis/HeliosPBTv3.abi.json"));
const HeliosCardRegistry_abi_json_1 = __importDefault(require("../../abis/HeliosCardRegistry.abi.json"));
const HeliosChipRegistry_abi_json_1 = __importDefault(require("../../abis/HeliosChipRegistry.abi.json"));
const HeliosTBAccount_abi_json_1 = __importDefault(require("../../abis/HeliosTBAccount.abi.json"));
class HeliosModule {
    constructor(config) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config.rpcUrl);
        this.signer = config.signer || null;
        this.pbt = new ethers_1.ethers.Contract(config.pbtAddress, HeliosPBTv3_abi_json_1.default, this.provider);
        this.cardRegistry = new ethers_1.ethers.Contract(config.cardRegistryAddress, HeliosCardRegistry_abi_json_1.default, this.provider);
        this.chipRegistry = new ethers_1.ethers.Contract(config.chipRegistryAddress, HeliosChipRegistry_abi_json_1.default, this.provider);
    }
    async connect() {
        await this.provider.getNetwork();
    }
    isConnected() {
        return this.provider !== null;
    }
    // ============================================================
    // PBT Methods
    // ============================================================
    async getTokenState(tokenId) {
        const state = await this.pbt.getTokenState(tokenId);
        return {
            tokenId: BigInt(state.tokenId),
            tapCount: BigInt(state.tapCount),
            lastTapTime: BigInt(state.lastTapTime),
            tier: Number(state.tier),
            minted: state.minted,
            status: this.mapStatus(state.status),
            boundWallet: state.boundWallet,
            boundAt: BigInt(state.boundAt),
            tba: state.tba,
            isPremium: state.isPremium
        };
    }
    async isKeyValid(wallet) {
        const [valid, tokenId] = await this.pbt.isKeyValid(wallet);
        return { valid, tokenId: BigInt(tokenId) };
    }
    async getBoundWallet(tokenId) {
        return await this.pbt.getBoundWallet(tokenId);
    }
    async getTBA(tokenId) {
        return await this.pbt.getTBA(tokenId);
    }
    async isPremium(tokenId) {
        return await this.pbt.isPremium(tokenId);
    }
    async getTokenStatus(tokenId) {
        const status = await this.pbt.getTokenStatus(tokenId);
        return this.mapStatus(status);
    }
    // ============================================================
    // Card Registry Methods
    // ============================================================
    async getCardholder(tokenId) {
        const cardholder = await this.cardRegistry.getCardholder(tokenId);
        return {
            cardNumber: cardholder.cardNumber,
            nameHash: cardholder.nameHash,
            kycHash: cardholder.kycHash,
            registeredAt: BigInt(cardholder.registeredAt),
            registered: cardholder.registered
        };
    }
    async isRegistered(tokenId) {
        return await this.cardRegistry.isRegistered(tokenId);
    }
    async getTokenByCard(cardNumber) {
        const tokenId = await this.cardRegistry.getTokenByCard(cardNumber);
        return BigInt(tokenId);
    }
    // ============================================================
    // Chip Registry Methods
    // ============================================================
    async verifyChipSignature(tokenId, hash, signature) {
        return await this.chipRegistry.verifyChipSignature(tokenId, hash, signature);
    }
    async isNonceUsed(chipPublicKey, nonce) {
        return await this.chipRegistry.isNonceUsed(chipPublicKey, nonce);
    }
    // ============================================================
    // TBA Methods
    // ============================================================
    async getTBABalance(tokenId) {
        const tbaAddress = await this.pbt.getTBA(tokenId);
        if (tbaAddress === ethers_1.ethers.ZeroAddress)
            return 0n;
        const balance = await this.provider.getBalance(tbaAddress);
        return balance;
    }
    async getTBAContract(tokenId) {
        const tbaAddress = await this.pbt.getTBA(tokenId);
        if (tbaAddress === ethers_1.ethers.ZeroAddress) {
            throw new Error('No TBA for this token');
        }
        return new ethers_1.ethers.Contract(tbaAddress, HeliosTBAccount_abi_json_1.default, this.provider);
    }
    // ============================================================
    // Transaction Builders
    // ============================================================
    buildBindWalletMessage(tokenId, wallet, nonce, chainId) {
        const hash = ethers_1.ethers.solidityPackedKeccak256(['uint256', 'address', 'uint256', 'uint256'], [tokenId, wallet, nonce, chainId]);
        return ethers_1.ethers.hashMessage(ethers_1.ethers.getBytes(hash));
    }
    buildTapToPayMessage(tokenId, to, value, data, nonce, chainId) {
        const dataHash = ethers_1.ethers.keccak256(data);
        const hash = ethers_1.ethers.solidityPackedKeccak256(['string', 'uint256', 'address', 'uint256', 'bytes32', 'uint256', 'uint256'], ['PAY', tokenId, to, value, dataHash, nonce, chainId]);
        return ethers_1.ethers.hashMessage(ethers_1.ethers.getBytes(hash));
    }
    buildTransferMessage(tokenId, to, nonce, chainId) {
        const hash = ethers_1.ethers.solidityPackedKeccak256(['uint256', 'address', 'uint256', 'uint256'], [tokenId, to, nonce, chainId]);
        return ethers_1.ethers.hashMessage(ethers_1.ethers.getBytes(hash));
    }
    // ============================================================
    // Event Queries
    // ============================================================
    async queryEvents(eventName, fromBlock, toBlock, args) {
        const filter = this.pbt.getFilter(eventName, ...(args || []));
        return await this.provider.getLogs({
            ...filter,
            fromBlock,
            toBlock
        });
    }
    async getTappedEvents(tokenId, fromBlock, toBlock) {
        return this.queryEvents('Tapped', fromBlock, toBlock, [tokenId]);
    }
    async getWalletBoundEvents(tokenId, fromBlock, toBlock) {
        return this.queryEvents('WalletBound', fromBlock, toBlock, [tokenId]);
    }
    async getTapToPayEvents(tokenId, fromBlock, toBlock) {
        return this.queryEvents('TapToPay', fromBlock, toBlock, [tokenId]);
    }
    async getPremiumDepositEvents(tokenId, fromBlock, toBlock) {
        return this.queryEvents('PremiumDeposit', fromBlock, toBlock, [tokenId]);
    }
    // ============================================================
    // Helpers
    // ============================================================
    mapStatus(status) {
        switch (status) {
            case 0: return 'INACTIVE';
            case 1: return 'ACTIVE';
            case 2: return 'FROZEN';
            case 3: return 'DEACTIVATED';
            default: return 'INACTIVE';
        }
    }
}
exports.HeliosModule = HeliosModule;
//# sourceMappingURL=Helios.js.map