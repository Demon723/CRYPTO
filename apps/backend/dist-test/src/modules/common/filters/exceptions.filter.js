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
var ExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ExceptionsFilter = ExceptionsFilter_1 = class ExceptionsFilter {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.headers['x-correlation-id'] ||
            `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        let status;
        let message;
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                message = exceptionResponse.message;
            }
            else {
                message = exception.message;
            }
            error = exception.name;
            this.logger.warn(`HTTP ${status} - ${request.method} ${request.url}`, message, 'ExceptionsFilter');
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = exception.name;
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack, 'ExceptionsFilter');
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            this.logger.error('Unknown exception type', exception, 'ExceptionsFilter');
        }
        const errorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            correlationId,
        };
        if (this.configService.get('NODE_ENV') === 'development' && exception instanceof Error) {
            errorResponse.stack = exception.stack;
        }
        response.status(status).json(errorResponse);
    }
};
exports.ExceptionsFilter = ExceptionsFilter;
exports.ExceptionsFilter = ExceptionsFilter = ExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ExceptionsFilter);
//# sourceMappingURL=exceptions.filter.js.map