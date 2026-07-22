import { Reflector } from '@nestjs/core';
import { DeveloperApiService } from '../services/developer-api.service';
declare const ApiKeyAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class ApiKeyAuthGuard extends ApiKeyAuthGuard_base {
    private readonly developerApiService;
    private readonly reflector;
    constructor(developerApiService: DeveloperApiService, reflector: Reflector);
    canActivate(context: any): Promise<boolean>;
}
export {};
