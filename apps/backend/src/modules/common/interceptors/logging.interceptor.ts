import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface RequestLog {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - startTime;
        const statusCode = (response as any).statusCode || 200;

        const log: RequestLog = {
          method,
          url,
          statusCode,
          responseTime,
          userAgent: request.headers['user-agent'],
          ip: (request as any).ip || (request as any).connection?.remoteAddress,
        };

        if (statusCode >= 500) {
          this.logger.error(`${method} ${url} ${statusCode} ${responseTime}ms`, log);
        } else if (statusCode >= 400) {
          this.logger.warn(`${method} ${url} ${statusCode} ${responseTime}ms`, log);
        } else {
          this.logger.log(`${method} ${url} ${statusCode} ${responseTime}ms`);
        }

        return data;
      }),
      tap({
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${error.status || 500} ${responseTime}ms`,
            error.message,
            'LoggingInterceptor',
          );
        },
      }),
    );
  }
}
