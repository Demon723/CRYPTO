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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let TokenService = class TokenService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
            secret: this.configService.get('JWT_SECRET'),
        });
    }
    async generateRefreshToken(userId) {
        return this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
    }
    validateAccessToken(token) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    validateRefreshToken(token) {
        try {
            return this.jwtService.verify(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    decodeToken(token) {
        try {
            const decoded = this.jwtService.decode(token);
            return { payload: decoded, expired: false };
        }
        catch (error) {
            if (error?.name === 'TokenExpiredError') {
                const decoded = this.jwtService.decode(token);
                return { payload: decoded, expired: true };
            }
            return { payload: null, expired: false };
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map