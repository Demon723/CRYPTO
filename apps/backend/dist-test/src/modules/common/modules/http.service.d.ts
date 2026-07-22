import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
export declare class HttpService {
    private readonly axios;
    private readonly logger;
    constructor(nestHttpService: NestHttpService, configService: ConfigService, loggerService: LoggerService);
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<AxiosResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<AxiosResponse<T>>;
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<AxiosResponse<T>>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>>;
    private request;
    getAxiosInstance(): AxiosInstance;
    private handleError;
}
