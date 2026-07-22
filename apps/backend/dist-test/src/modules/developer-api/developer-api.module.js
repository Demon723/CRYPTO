"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperApiModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("../common/modules/prisma.module");
const redis_module_1 = require("../common/modules/redis.module");
const logger_module_1 = require("../common/modules/logger.module");
const auth_module_1 = require("../auth/auth.module");
const developer_api_service_1 = require("./services/developer-api.service");
const developer_api_controller_1 = require("./controllers/developer-api.controller");
const api_key_auth_guard_1 = require("./guards/api-key-auth.guard");
let DeveloperApiModule = class DeveloperApiModule {
};
exports.DeveloperApiModule = DeveloperApiModule;
exports.DeveloperApiModule = DeveloperApiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisService, logger_module_1.LoggerModule, auth_module_1.AuthModule, passport_1.PassportModule],
        controllers: [developer_api_controller_1.DeveloperApiController],
        providers: [developer_api_service_1.DeveloperApiService, api_key_auth_guard_1.ApiKeyAuthGuard],
        exports: [developer_api_service_1.DeveloperApiService, api_key_auth_guard_1.ApiKeyAuthGuard],
    })
], DeveloperApiModule);
//# sourceMappingURL=developer-api.module.js.map