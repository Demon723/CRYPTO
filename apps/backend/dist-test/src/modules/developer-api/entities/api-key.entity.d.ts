export interface ApiKeyEntity {
    id: string;
    userId: string;
    name: string;
    keyHash: string;
    keyPrefix: string;
    permissions: Record<string, boolean>;
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
}
export interface CreateApiKeyDto {
    name: string;
    permissions?: Record<string, boolean>;
    expiresAt?: string;
}
export interface ApiKeyResponse {
    id: string;
    name: string;
    keyPrefix: string;
    key?: string;
    permissions: Record<string, boolean>;
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
}
