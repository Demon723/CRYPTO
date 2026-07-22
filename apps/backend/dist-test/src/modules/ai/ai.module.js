"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../common/modules/prisma.module");
const http_module_1 = require("../common/modules/http.module");
const logger_module_1 = require("../common/modules/logger.module");
const auth_module_1 = require("../auth/auth.module");
const wallets_module_1 = require("../wallets/wallets.module");
const ai_service_1 = require("./services/ai.service");
const conversation_service_1 = require("./services/conversation.service");
const ai_controller_1 = require("./controllers/ai.controller");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, http_module_1.HttpModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, wallets_module_1.WalletsModule],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService, conversation_service_1.ConversationService],
        exports: [ai_service_1.AiService, conversation_service_1.ConversationService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map