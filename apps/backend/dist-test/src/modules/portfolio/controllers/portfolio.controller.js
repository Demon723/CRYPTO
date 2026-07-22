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
exports.PortfolioController = void 0;
const common_1 = require("@nestjs/common");
const portfolio_service_1 = require("../services/portfolio.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let PortfolioController = class PortfolioController {
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }
    getSummary(userId) {
        return this.portfolioService.getPortfolioSummary(userId);
    }
    getAssetAllocation(userId) {
        return this.portfolioService.getAssetAllocation(userId);
    }
    getPerformance(userId, period) {
        return this.portfolioService.getHistoricalPerformance(userId, period);
    }
    getProfitLoss(userId) {
        return this.portfolioService.getProfitLoss(userId);
    }
    getFullReport(userId) {
        return this.portfolioService.getFullReport(userId);
    }
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get portfolio summary with totals and top performers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio summary retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('allocation'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset allocation by token and chain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset allocation retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getAssetAllocation", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get historical portfolio performance' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, type: String, description: 'Period in days (e.g., 7d, 30d, 90d, 1y)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get profit/loss breakdown' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profit/loss data retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getProfitLoss", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get full portfolio report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Full portfolio report generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortfolioController.prototype, "getFullReport", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, swagger_1.ApiTags)('Portfolio'),
    (0, common_1.Controller)('portfolio'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [portfolio_service_1.PortfolioService])
], PortfolioController);
//# sourceMappingURL=portfolio.controller.js.map