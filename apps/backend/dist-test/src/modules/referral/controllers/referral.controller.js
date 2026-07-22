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
exports.ReferralController = void 0;
const common_1 = require("@nestjs/common");
const referral_service_1 = require("../services/referral.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let ReferralController = class ReferralController {
    constructor(referralService) {
        this.referralService = referralService;
    }
    getReferralCode(userId) {
        return this.referralService.getOrCreateReferralCode(userId);
    }
    getStats(userId) {
        return this.referralService.getReferralStats(userId);
    }
    applyReferralCode(userId, code) {
        return this.referralService.applyReferralCode(userId, code);
    }
    getHistory(userId) {
        return this.referralService.getUserReferrals(userId);
    }
};
exports.ReferralController = ReferralController;
__decorate([
    (0, common_1.Get)('code'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get or create referral code for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral code retrieved or created' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getReferralCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a referral code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral code applied' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid referral code' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "applyReferralCode", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Referral history retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralController.prototype, "getHistory", null);
exports.ReferralController = ReferralController = __decorate([
    (0, swagger_1.ApiTags)('Referral'),
    (0, common_1.Controller)('referral'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [referral_service_1.ReferralService])
], ReferralController);
//# sourceMappingURL=referral.controller.js.map