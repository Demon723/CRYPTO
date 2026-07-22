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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../common/modules/prisma.service");
const logger_service_1 = require("../../common/modules/logger.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new logger_service_1.LoggerService(AuthService_1.name);
        this.bcryptRounds = this.configService.get('BCRYPT_ROUNDS', 12);
    }
    async validateUserByEmail(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Account is deactivated');
        }
        return this.mapToEntity(user);
    }
    async validateOAuthUser(data) {
        let user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    image: data.image,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    password: null,
                },
            });
        }
        else if (!user.emailVerified) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    name: data.name || user.name,
                    image: data.image || user.image,
                },
            });
        }
        const tokens = await this.generateTokens(this.mapToEntity(user));
        await this.updateLastLogin(user.id);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async register(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });
        const tokens = await this.generateTokens(this.mapToEntity(user));
        this.logger.log(`New user registered: ${user.email}`, 'AuthService');
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async login(email, password) {
        const user = await this.validateUserByEmail(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user);
        await this.updateLastLogin(user.id);
        this.logger.log(`User logged in: ${user.email}`, 'AuthService');
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return {
                accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'), secret: this.configService.get('JWT_SECRET') }),
                refreshToken: await this.generateRefreshToken(user.id),
                user: this.sanitizeUser(user),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async findUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async findUserByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return null;
        }
        return this.mapToEntity(user);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
                secret: this.configService.get('JWT_SECRET'),
            }),
            this.generateRefreshToken(user.id),
        ]);
        return { accessToken, refreshToken };
    }
    async generateRefreshToken(userId) {
        return this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
    }
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    mapToEntity(user) {
        return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            emailVerifiedAt: user.emailVerifiedAt,
            name: user.name,
            image: user.image,
            password: user.password,
            role: user.role,
            isActive: user.isActive,
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            twoFactorSecret: user.twoFactorSecret,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    sanitizeUser(user) {
        const { password, twoFactorSecret, ...sanitized } = this.mapToEntity(user);
        return sanitized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map