import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { DeveloperApiService } from '../services/developer-api.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  constructor(private readonly developerApiService: DeveloperApiService, private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: any): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const apiKey = authHeader.substring(7);
    const keyData = await this.developerApiService.validateApiKey(apiKey);

    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    const rateLimit = await this.developerApiService.checkRateLimit(keyData.userId, keyData.id);
    if (!rateLimit.allowed) {
      throw new UnauthorizedException('Rate limit exceeded');
    }

    request.apiKey = keyData;
    request.user = (keyData as any).user;

    return true;
  }
}
