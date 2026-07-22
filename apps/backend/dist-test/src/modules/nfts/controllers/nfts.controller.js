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
exports.NftsController = void 0;
const common_1 = require("@nestjs/common");
const nfts_service_1 = require("../services/nfts.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let NftsController = class NftsController {
    constructor(nftsService) {
        this.nftsService = nftsService;
    }
    getUserNfts(userId) {
        return this.nftsService.getUserNfts(userId);
    }
    getWalletNfts(userId, walletId) {
        return this.nftsService.getWalletNfts(userId, walletId);
    }
    getNft(userId, nftId) {
        return this.nftsService.getNftById(userId, nftId);
    }
    getCollections(userId) {
        return this.nftsService.getCollections(userId);
    }
    syncNfts(userId, walletId) {
        return this.nftsService.syncNftsForWallet(userId, walletId);
    }
};
exports.NftsController = NftsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all NFTs for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFTs retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getUserNfts", null);
__decorate([
    (0, common_1.Get)('wallet/:walletId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFTs for specific wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet NFTs retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Wallet not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getWalletNfts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'NFT not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getNft", null);
__decorate([
    (0, common_1.Get)('collections'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT collections for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Collections retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "getCollections", null);
__decorate([
    (0, common_1.Post)('wallet/:walletId/sync'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Sync NFTs from blockchain for wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFTs synced' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NftsController.prototype, "syncNfts", null);
exports.NftsController = NftsController = __decorate([
    (0, swagger_1.ApiTags)('NFTs'),
    (0, common_1.Controller)('nfts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [nfts_service_1.NftsService])
], NftsController);
//# sourceMappingURL=nfts.controller.js.map