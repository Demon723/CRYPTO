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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAlertDto = exports.CreateAlertDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const alert_entity_1 = require("../../entities/alert.entity");
class CreateAlertDto {
}
exports.CreateAlertDto = CreateAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert type', enum: alert_entity_1.AlertType }),
    (0, class_validator_1.IsEnum)(alert_entity_1.AlertType),
    __metadata("design:type", typeof (_a = typeof alert_entity_1.AlertType !== "undefined" && alert_entity_1.AlertType) === "function" ? _a : Object)
], CreateAlertDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert condition', example: { field: 'price', operator: '>', value: 3000 } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAlertDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wallet ID (optional)', example: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "walletId", void 0);
class UpdateAlertDto {
}
exports.UpdateAlertDto = UpdateAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert status', enum: alert_entity_1.AlertStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(alert_entity_1.AlertStatus),
    __metadata("design:type", typeof (_b = typeof alert_entity_1.AlertStatus !== "undefined" && alert_entity_1.AlertStatus) === "function" ? _b : Object)
], UpdateAlertDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert condition', example: { field: 'price', operator: '>', value: 3000 } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAlertDto.prototype, "condition", void 0);
//# sourceMappingURL=alert.dto.js.map