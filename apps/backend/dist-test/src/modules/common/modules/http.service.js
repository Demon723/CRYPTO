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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("./logger.service");
let HttpService = class HttpService {
    constructor(nestHttpService, configService, loggerService) {
        this.axios = nestHttpService.axiosRef;
        this.logger = loggerService;
        this.axios.defaults.timeout = 15000;
        this.axios.defaults.headers.common['User-Agent'] =
            'Synex-Backend/1.0';
    }
    get(url, config) {
        return this.request('GET', url, undefined, config);
    }
    post(url, data, config) {
        return this.request('POST', url, data, config);
    }
    put(url, data, config) {
        return this.request('PUT', url, data, config);
    }
    patch(url, data, config) {
        return this.request('PATCH', url, data, config);
    }
    delete(url, config) {
        return this.request('DELETE', url, undefined, config);
    }
    request(method, url, data, config) {
        const requestConfig = {
            ...config,
            method,
            url,
            data,
        };
        return new rxjs_1.Observable((subscriber) => {
            this.logger.debug(`HTTP ${method} ${url}`, 'HttpService');
            this.axios
                .request(requestConfig)
                .then((response) => {
                subscriber.next(response);
                subscriber.complete();
            })
                .catch((error) => {
                this.logger.error(`HTTP ${method} ${url} failed`, error.response?.data || error.message, 'HttpService');
                subscriber.error(this.handleError(error));
            });
        });
    }
    getAxiosInstance() {
        return this.axios;
    }
    handleError(error) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error;
            return new common_1.InternalServerErrorException({
                message: 'External API request failed',
                statusCode: axiosError.response.status,
                data: axiosError.response.data,
            }, 'ExternalApiError');
        }
        if (error && typeof error === 'object' && 'request' in error) {
            return new common_1.InternalServerErrorException({
                message: 'External API request timeout',
                data: error,
            });
        }
        return new common_1.InternalServerErrorException({
            message: 'External API request failed',
            data: error,
        });
    }
};
exports.HttpService = HttpService;
exports.HttpService = HttpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        logger_service_1.LoggerService])
], HttpService);
//# sourceMappingURL=http.service.js.map