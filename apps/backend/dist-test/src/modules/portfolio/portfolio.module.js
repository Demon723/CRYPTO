"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../common/modules/prisma.module");
const logger_module_1 = require("../common/modules/logger.module");
const auth_module_1 = require("../auth/auth.module");
const wallets_module_1 = require("../wallets/wallets.module");
const portfolio_service_1 = require("./services/portfolio.service");
const portfolio_controller_1 = require("./controllers/portfolio.controller");
let PortfolioModule = class PortfolioModule {
};
exports.PortfolioModule = PortfolioModule;
exports.PortfolioModule = PortfolioModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, logger_module_1.LoggerModule, auth_module_1.AuthModule, wallets_module_1.WalletsModule],
        controllers: [portfolio_controller_1.PortfolioController],
        providers: [portfolio_service_1.PortfolioService],
        exports: [portfolio_service_1.PortfolioService],
    })
], PortfolioModule);
//# sourceMappingURL=portfolio.module.js.map