import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message }) => {
              return timestamp + ' ' + level.toUpperCase() + ': ' + message;
            }),
          ),
        }),
      ],
      exitOnError: false,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || 'Application' });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context: context || 'Application', trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || 'Application' });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || 'Application' });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || 'Application' });
  }
}
