"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeliosModule = void 0;
const common_1 = require("@nestjs/common");
const helios_controller_1 = require("./controllers/helios.controller");
const helios_service_1 = require("./services/helios.service");
let HeliosModule = class HeliosModule {
};
exports.HeliosModule = HeliosModule;
exports.HeliosModule = HeliosModule = __decorate([
    (0, common_1.Module)({
        controllers: [helios_controller_1.HeliosController],
        providers: [helios_service_1.HeliosService],
        exports: [helios_service_1.HeliosService],
    })
], HeliosModule);
//# sourceMappingURL=helios.module.js.map