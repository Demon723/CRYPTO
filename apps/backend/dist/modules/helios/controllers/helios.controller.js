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
exports.HeliosController = void 0;
const common_1 = require("@nestjs/common");
const helios_service_1 = require("../services/helios.service");
const helios_dto_1 = require("../dto/helios.dto");
let HeliosController = class HeliosController {
    constructor(heliosService) {
        this.heliosService = heliosService;
    }
    async getTokenState(tokenId) {
        return this.heliosService.getTokenState(tokenId);
    }
    async isKeyValid(wallet) {
        return this.heliosService.isKeyValid(wallet);
    }
    async registerCardholder(dto) {
        return this.heliosService.registerCardholder(dto);
    }
    async getCardholder(tokenId) {
        return this.heliosService.getCardholder(tokenId);
    }
    async bindWallet(dto) {
        return this.heliosService.bindWallet(dto);
    }
    async tapToPay(dto) {
        return this.heliosService.tapToPay(dto);
    }
    async depositToTba(dto) {
        return this.heliosService.depositToTba(dto);
    }
    async founderActivate(dto) {
        return this.heliosService.founderActivate(dto);
    }
    async founderFreeze(dto) {
        return this.heliosService.founderFreeze(dto);
    }
    async founderDeactivate(dto) {
        return this.heliosService.founderDeactivate(dto);
    }
};
exports.HeliosController = HeliosController;
__decorate([
    (0, common_1.Get)('token/:tokenId/state'),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "getTokenState", null);
__decorate([
    (0, common_1.Get)('wallet/:wallet/key'),
    __param(0, (0, common_1.Param)('wallet')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "isKeyValid", null);
__decorate([
    (0, common_1.Post)('cardholder/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.RegisterCardholderDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "registerCardholder", null);
__decorate([
    (0, common_1.Get)('cardholder/:tokenId'),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "getCardholder", null);
__decorate([
    (0, common_1.Post)('bind-wallet'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.BindWalletDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "bindWallet", null);
__decorate([
    (0, common_1.Post)('tap-to-pay'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.TapToPayDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "tapToPay", null);
__decorate([
    (0, common_1.Post)('tba/deposit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.DepositToTbaDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "depositToTba", null);
__decorate([
    (0, common_1.Post)('founder/activate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.FounderActivateDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "founderActivate", null);
__decorate([
    (0, common_1.Post)('founder/freeze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.FounderFreezeDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "founderFreeze", null);
__decorate([
    (0, common_1.Post)('founder/deactivate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [helios_dto_1.FounderDeactivateDto]),
    __metadata("design:returntype", Promise)
], HeliosController.prototype, "founderDeactivate", null);
exports.HeliosController = HeliosController = __decorate([
    (0, common_1.Controller)('helios'),
    __metadata("design:paramtypes", [helios_service_1.HeliosService])
], HeliosController);
//# sourceMappingURL=helios.controller.js.map