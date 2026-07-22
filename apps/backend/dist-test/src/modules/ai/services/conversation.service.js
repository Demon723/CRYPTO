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
var ConversationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const logger_service_1 = require("../../common/modules/logger.service");
let ConversationService = ConversationService_1 = class ConversationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(ConversationService_1.name);
    }
    async getOrCreateConversation(userId, chatId) {
        if (chatId) {
            const conversation = await this.prisma.chat.findFirst({
                where: { id: chatId, userId },
            });
            if (conversation) {
                return conversation;
            }
        }
        return this.prisma.chat.create({
            data: {
                userId,
                title: 'New Conversation',
                isActive: true,
            },
        });
    }
    async getConversation(userId, chatId) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                },
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
    async getUserConversations(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [conversations, total] = await Promise.all([
            this.prisma.chat.findMany({
                where: { userId, isActive: true },
                orderBy: { updatedAt: 'desc' },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { messages: true } },
                },
            }),
            this.prisma.chat.count({ where: { userId, isActive: true } }),
        ]);
        return {
            data: conversations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async addMessage(chatId, role, content) {
        const message = await this.prisma.message.create({
            data: {
                chatId,
                role,
                content,
            },
        });
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });
        return message;
    }
    async getRecentMessages(chatId, limit = 20) {
        return this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async deleteConversation(userId, chatId) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { isActive: false },
        });
        this.logger.log(`Conversation deleted: ${chatId}`, 'ConversationService');
    }
    async updateConversationTitle(userId, chatId, title) {
        const conversation = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return this.prisma.chat.update({
            where: { id: chatId },
            data: { title },
        });
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map