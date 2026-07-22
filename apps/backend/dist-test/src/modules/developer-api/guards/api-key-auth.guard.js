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
exports.ApiKeyAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const developer_api_service_1 = require("../services/developer-api.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ApiKeyAuthGuard = class ApiKeyAuthGuard extends (0, passport_1.AuthGuard)('api-key') {
    constructor(developerApiService, reflector) {
        super();
        this.developerApiService = developerApiService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const apiKey = authHeader.substring(7);
        const keyData = await this.developerApiService.validateApiKey(apiKey);
        if (!keyData) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const rateLimit = await this.developerApiService.checkRateLimit(keyData.userId, keyData.id);
        if (!rateLimit.allowed) {
            throw new common_1.UnauthorizedException('Rate limit exceeded');
        }
        request.apiKey = keyData;
        request.user = keyData.user;
        return true;
    }
};
exports.ApiKeyAuthGuard = ApiKeyAuthGuard;
exports.ApiKeyAuthGuard = ApiKeyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [developer_api_service_1.DeveloperApiService, core_1.Reflector])
], ApiKeyAuthGuard);
//# sourceMappingURL=api-key-auth.guard.js.map