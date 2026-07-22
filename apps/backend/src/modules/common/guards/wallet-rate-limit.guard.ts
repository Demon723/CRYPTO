import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

@Injectable()
export class WalletRateLimitGuard implements CanActivate {
  private readonly config: RateLimitConfig;
  private readonly redis: Redis;

  constructor(config: Partial<RateLimitConfig> = {}, redis?: Redis) {
    this.config = {
      windowMs: config.windowMs || 60_000, // 1 minute
      maxRequests: config.maxRequests || 20,
      keyPrefix: config.keyPrefix || 'x402:ratelimit',
    };
    this.redis = redis;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract wallet address from request (set by auth guard or header)
    const walletAddress = this.extractWalletAddress(request);
    if (!walletAddress) {
      return true; // allow non-wallet requests (guarded by auth separately)
    }

    const key = `${this.config.keyPrefix}:${walletAddress.toLowerCase()}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (this.redis) {
      const count = await this.redis.zcard(key);
      if (count >= this.config.maxRequests) {
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldest.length > 0 ? parseInt(oldest[0].split(':')[1]) : now + this.config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        response.setHeader('Retry-After', retryAfter.toString());
        throw new HttpException(
          `Rate limit exceeded: ${this.config.maxRequests} requests per ${this.config.windowMs / 1000}s`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.redis.zadd(key, now, `${walletAddress}:${now}`);
      await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));
    }

    response.setHeader('X-RateLimit-Limit', this.config.maxRequests.toString());
    response.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - 1).toString());
    response.setHeader('X-RateLimit-Reset', Math.ceil((now + this.config.windowMs) / 1000).toString());

    return true;
  }

  private extractWalletAddress(request: any): string | null {
    // Priority: authenticated user -> request body -> header
    if (request.user?.walletAddress) {
      return request.user.walletAddress;
    }
    if (request.body?.walletAddress) {
      return request.body.walletAddress;
    }
    if (request.headers['x-wallet-address']) {
      return request.headers['x-wallet-address'];
    }
    return null;
  }
}
