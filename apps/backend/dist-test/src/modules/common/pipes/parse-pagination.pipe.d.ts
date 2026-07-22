import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}
export declare class ParsePaginationPipe implements PipeTransform {
    private readonly DEFAULT_PAGE;
    private readonly DEFAULT_LIMIT;
    private readonly MAX_LIMIT;
    transform(value: unknown, metadata: ArgumentMetadata): PaginationParams;
    private extractString;
}
