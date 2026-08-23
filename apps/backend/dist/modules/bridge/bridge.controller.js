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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeController = void 0;
const common_1 = require("@nestjs/common");
const bridge_service_1 = require("./bridge.service");
let BridgeController = class BridgeController {
    constructor(bridgeService) {
        this.bridgeService = bridgeService;
    }
    getSupportedChains() {
        return this.bridgeService.getSupportedChains();
    }
    getSupportedTokens() {
        return this.bridgeService.getSupportedTokens();
    }
    async initiateTransfer(req, body) {
        const userId = req.user?.id || 'anonymous';
        return this.bridgeService.initiateTransfer({
            fromChainId: body.fromChainId,
            toChainId: body.toChainId,
            tokenSymbol: body.tokenSymbol,
            amount: body.amount,
            recipient: body.recipient,
            sender: userId,
        });
    }
    async getTransferStatus(id) {
        return this.bridgeService.getTransferStatus(id);
    }
    async getTransferHistory(address) {
        return this.bridgeService.getTransferHistory(address);
    }
    async estimateFee(body) {
        const fee = await this.bridgeService.estimateFee(body.fromChainId, body.toChainId, body.amount);
        return { fee };
    }
};
exports.BridgeController = BridgeController;
__decorate([
    (0, common_1.Get)('chains'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], BridgeController.prototype, "getSupportedChains", null);
__decorate([
    (0, common_1.Get)('tokens'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], BridgeController.prototype, "getSupportedTokens", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "initiateTransfer", null);
__decorate([
    (0, common_1.Get)('transfer/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "getTransferStatus", null);
__decorate([
    (0, common_1.Get)('history/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "getTransferHistory", null);
__decorate([
    (0, common_1.Post)('estimate-fee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BridgeController.prototype, "estimateFee", null);
exports.BridgeController = BridgeController = __decorate([
    (0, common_1.Controller)('bridge'),
    __metadata("design:paramtypes", [bridge_service_1.BridgeService])
], BridgeController);
//# sourceMappingURL=bridge.controller.js.map