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
var UsersService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../../common/modules/prisma.service");
const logger_service_1 = require("../../common/modules/logger.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(UsersService_1.name);
        this.bcryptRounds = 12;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                name: true,
                image: true,
                role: true,
                isActive: true,
                isTwoFactorEnabled: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: dto.name,
                image: dto.image,
            },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                name: true,
                image: true,
                role: true,
                isActive: true,
                isTwoFactorEnabled: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User profile updated: ${user.email}`, 'UsersService');
        return user;
    }
    async changePassword(userId, dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new common_1.BadRequestException('New password and confirm password do not match');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { password: true, email: true },
        });
        if (!user || !user.password) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.ForbiddenException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        this.logger.log(`Password changed for user: ${user.email}`, 'UsersService');
    }
    async enable2FA(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isTwoFactorEnabled) {
            throw new common_1.BadRequestException('2FA is already enabled');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: dto.secret,
                isTwoFactorEnabled: true,
            },
        });
        this.logger.log(`2FA enabled for user: ${user.email}`, 'UsersService');
    }
    async disable2FA(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isTwoFactorEnabled) {
            throw new common_1.BadRequestException('2FA is not enabled');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: null,
                isTwoFactorEnabled: false,
            },
        });
        this.logger.log(`2FA disabled for user: ${user.email}`, 'UsersService');
    }
    async deleteAccount(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallets: true,
                subscriptions: true,
                stakingPositions: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                email: `deleted_${Date.now()}_${user.email}`,
                name: 'Deleted User',
                image: null,
                password: null,
            },
        });
        this.logger.log(`Account deactivated: ${user.email}`, 'UsersService');
    }
    async getUsers(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], UsersService);
//# sourceMappingURL=users.service.js.map