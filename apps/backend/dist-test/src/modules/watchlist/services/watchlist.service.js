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
var WatchlistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const logger_service_1 = require("../../common/modules/logger.service");
let WatchlistService = WatchlistService_1 = class WatchlistService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(WatchlistService_1.name);
    }
    async getUserWatchlists(userId) {
        return this.prisma.watchlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWatchlistById(userId, watchlistId) {
        const watchlist = await this.prisma.watchlist.findFirst({
            where: { id: watchlistId, userId },
        });
        if (!watchlist) {
            throw new common_1.NotFoundException('Watchlist not found');
        }
        return watchlist;
    }
    async createWatchlist(userId, dto) {
        const existing = await this.prisma.watchlist.findFirst({
            where: { userId, name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Watchlist with this name already exists');
        }
        const watchlist = await this.prisma.watchlist.create({
            data: {
                userId,
                name: dto.name,
                symbols: dto.symbols,
                isPublic: dto.isPublic || false,
            },
        });
        this.logger.log(`Watchlist created: ${watchlist.id} for user ${userId}`, 'WatchlistService');
        return watchlist;
    }
    async updateWatchlist(userId, watchlistId, dto) {
        await this.getWatchlistById(userId, watchlistId);
        const updated = await this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                name: dto.name,
                symbols: dto.symbols,
                isPublic: dto.isPublic,
            },
        });
        return updated;
    }
    async deleteWatchlist(userId, watchlistId) {
        await this.getWatchlistById(userId, watchlistId);
        await this.prisma.watchlist.delete({
            where: { id: watchlistId },
        });
        this.logger.log(`Watchlist deleted: ${watchlistId}`, 'WatchlistService');
    }
    async addToWatchlist(userId, watchlistId, symbol) {
        const watchlist = await this.getWatchlistById(userId, watchlistId);
        if (watchlist.symbols.includes(symbol)) {
            throw new common_1.BadRequestException('Symbol already in watchlist');
        }
        return this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: [...watchlist.symbols, symbol],
            },
        });
    }
    async removeFromWatchlist(userId, watchlistId, symbol) {
        const watchlist = await this.getWatchlistById(userId, watchlistId);
        if (!watchlist.symbols.includes(symbol)) {
            throw new common_1.BadRequestException('Symbol not in watchlist');
        }
        return this.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: watchlist.symbols.filter((s) => s !== symbol),
            },
        });
    }
};
exports.WatchlistService = WatchlistService;
exports.WatchlistService = WatchlistService = WatchlistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WatchlistService);
//# sourceMappingURL=watchlist.service.js.map