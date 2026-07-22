import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../entities/user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      payload,
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );
  }

  validateAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  validateRefreshToken(token: string): { sub: string; type: string } {
    try {
      return this.jwtService.verify<{ sub: string; type: string }>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  decodeToken(token: string): { payload: JwtPayload | null; expired: boolean } {
    try {
      const decoded = this.jwtService.decode(token) as JwtPayload;
      return { payload: decoded, expired: false };
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        const decoded = this.jwtService.decode(token) as JwtPayload;
        return { payload: decoded, expired: true };
      }
      return { payload: null, expired: false };
    }
  }
}
