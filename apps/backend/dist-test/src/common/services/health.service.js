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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const prisma_service_1 = require("../../modules/common/modules/prisma.service");
const redis_service_1 = require("../../modules/common/modules/redis.service");
const logger_service_1 = require("../../modules/common/modules/logger.service");
let HealthService = HealthService_1 = class HealthService {
    constructor(health, prismaService, redisService) {
        this.health = health;
        this.prismaService = prismaService;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService(HealthService_1.name);
    }
    check() {
        const checks = {
            database: () => this.prismaService.healthCheck(),
            redis: () => this.redisService.healthCheck(),
        };
        const result = this.health.check(checks);
        return result;
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], HealthService);
//# sourceMappingURL=health.service.js.map