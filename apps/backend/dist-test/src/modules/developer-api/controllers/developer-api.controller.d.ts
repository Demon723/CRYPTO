import { DeveloperApiService } from '../services/developer-api.service';
import { CreateApiKeyDto } from '../entities/api-key.entity';
export declare class DeveloperApiController {
    private readonly developerApiService;
    constructor(developerApiService: DeveloperApiService);
    getUserApiKeys(userId: string): Promise<import("../entities/api-key.entity").ApiKeyEntity[]>;
    createApiKey(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponse>;
    revokeApiKey(userId: string, keyId: string): Promise<void>;
    getPortfolio(userId: string): Promise<{
        message: string;
        userId: string;
    }>;
    searchTokens(query: string): Promise<{
        message: string;
        query: string;
    }>;
}
