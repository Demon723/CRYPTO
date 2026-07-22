"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../common/modules/prisma.module");
const logger_module_1 = require("../common/modules/logger.module");
const auth_module_1 = require("../auth/auth.module");
const referral_service_1 = require("./services/referral.service");
const referral_controller_1 = require("./controllers/referral.controller");
let ReferralModule = class ReferralModule {
};
exports.ReferralModule = ReferralModule;
exports.ReferralModule = ReferralModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule],
        controllers: [referral_controller_1.ReferralController],
        providers: [referral_service_1.ReferralService],
        exports: [referral_service_1.ReferralService],
    })
], ReferralModule);
//# sourceMappingURL=referral.module.js.map