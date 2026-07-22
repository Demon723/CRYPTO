import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, throwError, timeout, catchError, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpService {
  private readonly axios: AxiosInstance;
  private readonly logger: LoggerService;

  constructor(
    nestHttpService: NestHttpService,
    configService: ConfigService,
    loggerService: LoggerService,
  ) {
    this.axios = nestHttpService.axiosRef;
    this.logger = loggerService;

    this.axios.defaults.timeout = 15000;
    this.axios.defaults.headers.common['User-Agent'] =
      'Synex-Backend/1.0';
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method,
      url,
      data,
    };

    return new Observable<AxiosResponse<T>>((subscriber) => {
      this.logger.debug(`HTTP ${method} ${url}`, 'HttpService');

      this.axios
        .request<T>(requestConfig)
        .then((response) => {
          subscriber.next(response);
          subscriber.complete();
        })
        .catch((error) => {
          this.logger.error(
            `HTTP ${method} ${url} failed`,
            error.response?.data || error.message,
            'HttpService',
          );
          subscriber.error(this.handleError(error));
        });
    });
  }

  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }

  private handleError(error: unknown): InternalServerErrorException {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown } };
      return new InternalServerErrorException(
        {
          message: 'External API request failed',
          statusCode: axiosError.response.status,
          data: axiosError.response.data,
        },
        'ExternalApiError',
      );
    }

    if (error && typeof error === 'object' && 'request' in error) {
      return new InternalServerErrorException({
        message: 'External API request timeout',
        data: error,
      });
    }

    return new InternalServerErrorException({
      message: 'External API request failed',
      data: error,
    });
  }
}
