"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsePaginationPipe = void 0;
const common_1 = require("@nestjs/common");
let ParsePaginationPipe = class ParsePaginationPipe {
    constructor() {
        this.DEFAULT_PAGE = 1;
        this.DEFAULT_LIMIT = 20;
        this.MAX_LIMIT = 100;
    }
    transform(value, metadata) {
        if (metadata.type !== 'query') {
            return {
                page: this.DEFAULT_PAGE,
                limit: this.DEFAULT_LIMIT,
                offset: 0,
            };
        }
        const query = value;
        const page = parseInt(this.extractString(query, 'page'), 10);
        const limit = parseInt(this.extractString(query, 'limit'), 10);
        if (!isNaN(page) && page < 1) {
            throw new common_1.BadRequestException('Page must be a positive integer');
        }
        if (!isNaN(limit) && (limit < 1 || limit > this.MAX_LIMIT)) {
            throw new common_1.BadRequestException(`Limit must be between 1 and ${this.MAX_LIMIT}`);
        }
        const validPage = isNaN(page) ? this.DEFAULT_PAGE : page;
        const validLimit = isNaN(limit) ? this.DEFAULT_LIMIT : Math.min(limit, this.MAX_LIMIT);
        return {
            page: validPage,
            limit: validLimit,
            offset: (validPage - 1) * validLimit,
        };
    }
    extractString(query, key) {
        const value = query[key];
        if (Array.isArray(value)) {
            return String(value[0]);
        }
        return value !== undefined ? String(value) : '';
    }
};
exports.ParsePaginationPipe = ParsePaginationPipe;
exports.ParsePaginationPipe = ParsePaginationPipe = __decorate([
    (0, common_1.Injectable)()
], ParsePaginationPipe);
//# sourceMappingURL=parse-pagination.pipe.js.map