"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeliosService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
let HeliosService = class HeliosService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
    }
    setContracts(pbtAddress, cardRegistryAddress, chipRegistryAddress, pbtAbi, cardAbi, chipAbi) {
        this.pbt = new ethers_1.ethers.Contract(pbtAddress, pbtAbi, this.provider);
        this.cardRegistry = new ethers_1.ethers.Contract(cardRegistryAddress, cardAbi, this.provider);
        this.chipRegistry = new ethers_1.ethers.Contract(chipRegistryAddress, chipAbi, this.provider);
    }
    async getTokenState(tokenId) {
        this.ensurePbt();
        try {
            return await this.pbt.getTokenState(tokenId);
        }
        catch (error) {
            throw new common_1.NotFoundException('Token not found');
        }
    }
    async isKeyValid(wallet) {
        this.ensurePbt();
        const [valid, tokenId] = await this.pbt.isKeyValid(wallet);
        return { valid, tokenId: Number(tokenId) };
    }
    async getCardholder(tokenId) {
        this.ensureCardRegistry();
        try {
            return await this.cardRegistry.getCardholder(tokenId);
        }
        catch (error) {
            throw new common_1.NotFoundException('Cardholder not found');
        }
    }
    async registerCardholder(dto) {
        this.ensureCardRegistry();
        const tx = await this.cardRegistry.registerCardholder(dto.tokenId, dto.nameHash, dto.kycHash);
        return { txHash: tx.hash };
    }
    async bindWallet(dto) {
        this.ensurePbt();
        const valid = await this.chipRegistry.verifyChipSignature(dto.tokenId, ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(dto.chipSignature)), dto.chipSignature);
        if (!valid) {
            throw new common_1.BadRequestException('Invalid chip signature');
        }
        const tx = await this.pbt.bindWallet(dto.tokenId, dto.wallet, dto.nonce, dto.chipSignature);
        return { txHash: tx.hash };
    }
    async tapToPay(dto) {
        this.ensurePbt();
        const dataHash = ethers_1.ethers.keccak256(dto.data);
        const hash = ethers_1.ethers.solidityPackedKeccak256(['string', 'uint256', 'address', 'uint256', 'bytes32', 'uint256', 'uint256'], ['PAY', dto.tokenId, dto.to, dto.value, dataHash, dto.nonce, (await this.provider.getNetwork()).chainId]);
        const ethHash = ethers_1.ethers.hashMessage(ethers_1.ethers.getBytes(hash));
        const valid = await this.chipRegistry.verifyChipSignature(dto.tokenId, ethHash, dto.chipSignature);
        if (!valid) {
            throw new common_1.BadRequestException('Invalid chip signature');
        }
        const tx = await this.pbt.tapToPay(dto.tokenId, dto.to, dto.value, dto.data, dto.nonce, dto.chipSignature);
        return { txHash: tx.hash };
    }
    async depositToTba(dto) {
        this.ensurePbt();
        const tx = await this.pbt.depositToTBA(dto.tokenId, { value: dto.amount });
        return { txHash: tx.hash };
    }
    async founderActivate(dto) {
        this.ensurePbt();
        const tx = await this.pbt.activate(dto.tokenId);
        return { txHash: tx.hash };
    }
    async founderFreeze(dto) {
        this.ensurePbt();
        const tx = await this.pbt.freeze(dto.tokenId, dto.reason);
        return { txHash: tx.hash };
    }
    async founderDeactivate(dto) {
        this.ensurePbt();
        const tx = await this.pbt.deactivate(dto.tokenId, dto.reason);
        return { txHash: tx.hash };
    }
    ensurePbt() {
        if (!this.pbt)
            throw new common_1.NotFoundException('PBT contract not configured');
    }
    ensureCardRegistry() {
        if (!this.cardRegistry)
            throw new common_1.NotFoundException('Card registry not configured');
    }
};
exports.HeliosService = HeliosService;
exports.HeliosService = HeliosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HeliosService);
//# sourceMappingURL=helios.service.js.map