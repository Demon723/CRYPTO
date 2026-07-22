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
exports.TokensController = void 0;
const common_1 = require("@nestjs/common");
const tokens_service_1 = require("../services/tokens.service");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let TokensController = class TokensController {
    constructor(tokensService) {
        this.tokensService = tokensService;
    }
    searchTokens(query, chain) {
        return this.tokensService.searchTokens(query, chain);
    }
    getTokenByAddress(address, chain) {
        return this.tokensService.getTokenByAddress(address, chain);
    }
    getTokenPrice(address, chain) {
        return this.tokensService.getTokenPrice(address, chain);
    }
    getTrendingTokens(chain) {
        return this.tokensService.getTrendingTokens(chain);
    }
    getTopGainers(chain) {
        return this.tokensService.getTopGainers(chain);
    }
    getTopLosers(chain) {
        return this.tokensService.getTopLosers(chain);
    }
};
exports.TokensController = TokensController;
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Search tokens by symbol, name, or address' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String, description: 'Search query (symbol, name, or address)' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "searchTokens", null);
__decorate([
    (0, common_1.Get)(':address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get token details by address' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Token not found' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTokenByAddress", null);
__decorate([
    (0, common_1.Get)('price/:address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get token price' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token price retrieved' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTokenPrice", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending tokens' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trending tokens retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTrendingTokens", null);
__decorate([
    (0, common_1.Get)('gainers'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get top gainers' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top gainers retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTopGainers", null);
__decorate([
    (0, common_1.Get)('losers'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get top losers' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top losers retrieved' }),
    __param(0, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TokensController.prototype, "getTopLosers", null);
exports.TokensController = TokensController = __decorate([
    (0, swagger_1.ApiTags)('Tokens'),
    (0, common_1.Controller)('tokens'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tokens_service_1.TokensService])
], TokensController);
//# sourceMappingURL=tokens.controller.js.map