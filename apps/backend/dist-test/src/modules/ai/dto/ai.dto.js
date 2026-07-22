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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAnalyzePortfolioDto = exports.AiChatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AiChatDto {
}
exports.AiChatDto = AiChatDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chat message', example: 'Analyze my portfolio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chat ID for continuing conversation', example: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional context', example: { chain: 'ETHEREUM' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiChatDto.prototype, "context", void 0);
class AiAnalyzePortfolioDto {
}
exports.AiAnalyzePortfolioDto = AiAnalyzePortfolioDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Analysis options', example: { includeRecommendations: true } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiAnalyzePortfolioDto.prototype, "options", void 0);
//# sourceMappingURL=ai.dto.js.map