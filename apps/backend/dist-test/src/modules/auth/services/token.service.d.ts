import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../entities/user.entity';
export declare class TokenService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateAccessToken(payload: JwtPayload): string;
    generateRefreshToken(userId: string): Promise<string>;
    validateAccessToken(token: string): JwtPayload;
    validateRefreshToken(token: string): {
        sub: string;
        type: string;
    };
    decodeToken(token: string): {
        payload: JwtPayload | null;
        expired: boolean;
    };
}
