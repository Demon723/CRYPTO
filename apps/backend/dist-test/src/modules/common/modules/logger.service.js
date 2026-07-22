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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = __importStar(require("winston"));
const DailyRotateFile = __importStar(require("winston-daily-rotate-file"));
const path = __importStar(require("path"));
let LoggerService = class LoggerService {
    constructor(context) {
        this.context = context;
        const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const contextStr = context || this.context || 'Application';
            let metaStr = '';
            if (Object.keys(meta).length > 0) {
                metaStr = `\n${JSON.stringify(meta, null, 2)}`;
            }
            return `${timestamp} [${contextStr}] ${level.toUpperCase()}: ${message}${metaStr}`;
        }));
        const transports = [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), logFormat),
            }),
        ];
        if (process.env.NODE_ENV !== 'test') {
            transports.push(new DailyRotateFile({
                filename: path.join('logs', 'application-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            }));
            transports.push(new DailyRotateFile({
                filename: path.join('logs', 'error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            }));
        }
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            transports,
            exitOnError: false,
        });
    }
    log(message, context) {
        this.logger.info(message, { context: context || this.context });
    }
    error(message, trace, context) {
        this.logger.error(message, { context: context || this.context, trace });
    }
    warn(message, context) {
        this.logger.warn(message, { context: context || this.context });
    }
    debug(message, context) {
        this.logger.debug(message, { context: context || this.context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context: context || this.context });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], LoggerService);
//# sourceMappingURL=logger.service.js.map