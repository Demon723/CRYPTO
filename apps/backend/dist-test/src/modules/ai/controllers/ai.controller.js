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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../services/ai.service");
const conversation_service_1 = require("../services/conversation.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const enums_1 = require("../../../common/enums");
const swagger_1 = require("@nestjs/swagger");
const parse_pagination_pipe_1 = require("../../common/pipes/parse-pagination.pipe");
let AiController = class AiController {
    constructor(aiService, conversationService) {
        this.aiService = aiService;
        this.conversationService = conversationService;
    }
    async chat(userId, body) {
        return this.aiService.chat(userId, body.message, body.chatId, body.context);
    }
    streamChat(userId, body) {
        return new Promise((resolve) => {
            const tokens = [];
            this.aiService.streamChat(userId, body.message, body.chatId, (token) => {
                tokens.push(token);
            }, body.context);
            resolve({
                async *[Symbol.asyncIterator]() {
                    for (const token of tokens) {
                        yield `data: ${token}\n\n`;
                    }
                    yield 'data: [DONE]\n\n';
                },
            });
        });
    }
    getConversations(userId, query) {
        return this.conversationService.getUserConversations(userId, query.page, query.limit);
    }
    getConversation(userId, chatId) {
        return this.conversationService.getConversation(userId, chatId);
    }
    deleteConversation(userId, chatId) {
        return this.conversationService.deleteConversation(userId, chatId);
    }
    analyzePortfolio(userId) {
        return this.aiService.analyzePortfolio(userId);
    }
    explainTransaction(userId, hash) {
        return this.aiService.explainTransaction(userId, hash);
    }
    detectScam(body) {
        return this.aiService.detectScam(body.address, body.chain);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to AI assistant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI response generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Sse)('chat/stream'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Stream AI chat responses (Server-Sent Events)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streaming AI response', content: { 'text/event-stream': {} } }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(parse_pagination_pipe_1.ParsePaginationPipe),
    (0, swagger_1.ApiOperation)({ summary: 'Get user conversation history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:chatId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific conversation with messages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:chatId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete conversation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation deleted' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('analyze-portfolio'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'AI-powered portfolio analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio analysis generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzePortfolio", null);
__decorate([
    (0, common_1.Post)('explain-transaction/:hash'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'AI explanation of a transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction explanation generated' }),
    __param(0, (0, current_user_decorator_1.CurrentUserId)()),
    __param(1, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "explainTransaction", null);
__decorate([
    (0, common_1.Post)('detect-scam'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.USER, enums_1.UserRole.ADMIN, enums_1.UserRole.SUPER_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'AI scam detection for an address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scam analysis generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "detectScam", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        conversation_service_1.ConversationService])
], AiController);
//# sourceMappingURL=ai.controller.js.map