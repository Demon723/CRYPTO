import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/modules/prisma.service';
import { AuthResponse, UserEntity } from '../entities/user.entity';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly bcryptRounds;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    validateUserByEmail(email: string, password: string): Promise<UserEntity | null>;
    validateOAuthUser(data: {
        email: string;
        name?: string;
        image?: string;
    }): Promise<AuthResponse>;
    register(data: {
        email: string;
        password: string;
        name?: string;
    }): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    refreshTokens(refreshToken: string): Promise<AuthResponse>;
    findUserById(id: string): Promise<UserEntity | null>;
    findUserByEmail(email: string): Promise<UserEntity | null>;
    private generateTokens;
    private generateRefreshToken;
    private updateLastLogin;
    private mapToEntity;
    private sanitizeUser;
}
