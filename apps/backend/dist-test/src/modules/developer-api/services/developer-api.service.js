"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeveloperApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperApiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const redis_service_1 = require("../../common/modules/redis.service");
const crypto = __importStar(require("crypto"));
const logger_service_1 = require("../../common/modules/logger.service");
let DeveloperApiService = DeveloperApiService_1 = class DeveloperApiService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService(DeveloperApiService_1.name);
        this.apiKeyPrefix = 'cmai_';
        this.apiKeyLength = 32;
    }
    async getUserApiKeys(userId) {
        return this.prisma.apiKey.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApiKeyById(userId, keyId) {
        const apiKey = await this.prisma.apiKey.findFirst({
            where: { id: keyId, userId },
        });
        if (!apiKey) {
            throw new common_1.NotFoundException('API key not found');
        }
        return apiKey;
    }
    async createApiKey(userId, dto) {
        const rawKey = this.generateApiKey();
        const keyHash = this.hashApiKey(rawKey);
        const apiKey = await this.prisma.apiKey.create({
            data: {
                userId,
                name: dto.name,
                keyHash,
                keyPrefix: rawKey.slice(0, 8),
                permissions: dto.permissions || { read: true },
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                isActive: true,
            },
        });
        this.logger.log(`API key created: ${apiKey.id} for user ${userId}`, 'DeveloperApiService');
        return {
            id: apiKey.id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            key: `${this.apiKeyPrefix}${rawKey}`,
            permissions: apiKey.permissions,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
        };
    }
    async revokeApiKey(userId, keyId) {
        await this.getApiKeyById(userId, keyId);
        await this.prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false },
        });
        this.logger.log(`API key revoked: ${keyId}`, 'DeveloperApiService');
    }
    async validateApiKey(rawKey) {
        const keyHash = this.hashApiKey(rawKey.replace(this.apiKeyPrefix, ''));
        const apiKey = await this.prisma.apiKey.findFirst({
            where: { keyHash, isActive: true },
            include: { user: { select: { id: true, email: true, role: true } } },
        });
        if (!apiKey) {
            return null;
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return null;
        }
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });
        return apiKey;
    }
    async checkRateLimit(userId, apiKeyId) {
        const key = `ratelimit:${apiKeyId}`;
        const limit = 1000;
        const windowSeconds = 3600;
        const current = await this.redisService.getClient().incr(key);
        if (current === 1) {
            await this.redisService.getClient().expire(key, windowSeconds);
        }
        const remaining = Math.max(0, limit - current);
        return { allowed: current <= limit, remaining };
    }
    generateApiKey() {
        return crypto.randomBytes(this.apiKeyLength).toString('hex');
    }
    hashApiKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
};
exports.DeveloperApiService = DeveloperApiService;
exports.DeveloperApiService = DeveloperApiService = DeveloperApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], DeveloperApiService);
//# sourceMappingURL=developer-api.service.js.map