import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  transform(value: unknown, metadata: ArgumentMetadata): PaginationParams {
    if (metadata.type !== 'query') {
      return {
        page: this.DEFAULT_PAGE,
        limit: this.DEFAULT_LIMIT,
        offset: 0,
      };
    }

    const query = value as Record<string, unknown>;
    const page = parseInt(this.extractString(query, 'page'), 10);
    const limit = parseInt(this.extractString(query, 'limit'), 10);

    if (!isNaN(page) && page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (!isNaN(limit) && (limit < 1 || limit > this.MAX_LIMIT)) {
      throw new BadRequestException(`Limit must be between 1 and ${this.MAX_LIMIT}`);
    }

    const validPage = isNaN(page) ? this.DEFAULT_PAGE : page;
    const validLimit = isNaN(limit) ? this.DEFAULT_LIMIT : Math.min(limit, this.MAX_LIMIT);

    return {
      page: validPage,
      limit: validLimit,
      offset: (validPage - 1) * validLimit,
    };
  }

  private extractString(query: Record<string, unknown>, key: string): string {
    const value = query[key];
    if (Array.isArray(value)) {
      return String(value[0]);
    }
    return value !== undefined ? String(value) : '';
  }
}
