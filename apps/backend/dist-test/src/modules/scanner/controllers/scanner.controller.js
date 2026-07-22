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
exports.ScannerController = void 0;
const common_1 = require("@nestjs/common");
const scanner_service_1 = require("../services/scanner.service");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let ScannerController = class ScannerController {
    constructor(scannerService) {
        this.scannerService = scannerService;
    }
    analyzeContract(userId, dto) {
        return this.scannerService.analyzeContract(dto);
    }
    getAnalysis(address, chain) {
        return this.scannerService.getAnalysis(address, chain);
    }
    getRecentAnalyses(limit) {
        return this.scannerService.getRecentAnalyses(limit);
    }
};
exports.ScannerController = ScannerController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a smart contract for security risks' }),
    (0, swagger_1.ApiQuery)({ name: 'includeAiExplanation', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid contract address' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "analyzeContract", null);
__decorate([
    (0, common_1.Get)('analysis/:address'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get existing contract analysis' }),
    (0, swagger_1.ApiQuery)({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Analysis not found' }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "getAnalysis", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent contract analyses' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent analyses retrieved' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScannerController.prototype, "getRecentAnalyses", null);
exports.ScannerController = ScannerController = __decorate([
    (0, swagger_1.ApiTags)('Smart Contract Analyzer'),
    (0, common_1.Controller)('scanner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scanner_service_1.ScannerService])
], ScannerController);
//# sourceMappingURL=scanner.controller.js.map