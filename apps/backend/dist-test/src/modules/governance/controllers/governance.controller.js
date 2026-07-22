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
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const governance_service_1 = require("../services/governance.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
let GovernanceController = class GovernanceController {
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    getProposals() {
        return this.governanceService.getProposals();
    }
    getProposal(proposalId) {
        return this.governanceService.getProposalById(proposalId);
    }
    castVote(userId, dto) {
        return this.governanceService.castVote(userId, dto);
    }
    getUserVotes(userId) {
        return this.governanceService.getUserVotes(userId);
    }
    getProposalResults(proposalId) {
        return this.governanceService.getProposalResults(proposalId);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Get)('proposals'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all governance proposals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposals retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getProposals", null);
__decorate([
    (0, common_1.Get)('proposals/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get proposal details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposal retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Proposal not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getProposal", null);
__decorate([
    (0, common_1.Post)('vote'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Cast a vote on a proposal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vote cast successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Already voted or invalid vote' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "castVote", null);
__decorate([
    (0, common_1.Get)('votes'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user votes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User votes retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getUserVotes", null);
__decorate([
    (0, common_1.Get)('proposals/:id/results'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get proposal voting results' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Results retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getProposalResults", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, swagger_1.ApiTags)('Governance'),
    (0, common_1.Controller)('governance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map