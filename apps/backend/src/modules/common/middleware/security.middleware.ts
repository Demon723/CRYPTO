import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Reject requests with unexpected content-type for JSON endpoints
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      next(new BadRequestException('Content-Type must be application/json'));
      return;
    }
  }

  next();
}

// Keep the class for NestJS module compatibility if needed elsewhere
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    securityMiddleware(req, res, next);
  }
}
