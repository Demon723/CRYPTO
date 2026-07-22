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
exports.WalletSyncDto = exports.WalletCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
class WalletCreateDto {
}
exports.WalletCreateDto = WalletCreateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet address', example: '0x...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletCreateDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Blockchain chain', enum: wallet_entity_1.Chain }),
    (0, class_validator_1.IsEnum)(wallet_entity_1.Chain),
    __metadata("design:type", String)
], WalletCreateDto.prototype, "chain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet label', example: 'My Wallet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletCreateDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet type', enum: ['EOA', 'SMART_CONTRACT', 'MULTISIG'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletCreateDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is watch-only wallet', default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], WalletCreateDto.prototype, "isWatchOnly", void 0);
class WalletSyncDto {
}
exports.WalletSyncDto = WalletSyncDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet ID to sync', example: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WalletSyncDto.prototype, "walletId", void 0);
//# sourceMappingURL=wallet.dto.js.map