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
exports.DeveloperApiController = void 0;
const common_1 = require("@nestjs/common");
const developer_api_service_1 = require("../services/developer-api.service");
const api_key_auth_guard_1 = require("../guards/api-key-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let DeveloperApiController = class DeveloperApiController {
    constructor(developerApiService) {
        this.developerApiService = developerApiService;
    }
    getUserApiKeys(userId) {
        return this.developerApiService.getUserApiKeys(userId);
    }
    createApiKey(userId, dto) {
        return this.developerApiService.createApiKey(userId, dto);
    }
    revokeApiKey(userId, keyId) {
        return this.developerApiService.revokeApiKey(userId, keyId);
    }
    async getPortfolio(userId) {
        return { message: 'Portfolio data would be returned here', userId };
    }
    async searchTokens(query) {
        return { message: 'Token search results would be returned here', query };
    }
};
exports.DeveloperApiController = DeveloperApiController;
__decorate([
    (0, common_1.Get)('keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user API keys' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API keys retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "getUserApiKeys", null);
__decorate([
    (0, common_1.Post)('keys'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new API key' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API key created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Delete)('keys/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke API key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API key revoked' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeveloperApiController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Get)('v1/portfolio'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Developer API: Get portfolio data (API key required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperApiController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)('v1/tokens/search'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Developer API: Search tokens (API key required)' }),
    ApiQuery({ name: 'q', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token search results' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeveloperApiController.prototype, "searchTokens", null);
exports.DeveloperApiController = DeveloperApiController = __decorate([
    (0, swagger_1.ApiTags)('Developer API'),
    (0, common_1.Controller)('developer'),
    __metadata("design:paramtypes", [developer_api_service_1.DeveloperApiService])
], DeveloperApiController);
//# sourceMappingURL=developer-api.controller.js.map