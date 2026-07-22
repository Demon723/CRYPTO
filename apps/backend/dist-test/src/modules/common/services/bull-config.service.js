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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BullConfigModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullConfigModule = exports.BullConfigService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let BullConfigService = class BullConfigService {
    constructor(options) {
        this.connection = options.connection;
        this.defaultJobOptions = options.defaultJobOptions;
    }
    getConnection() {
        return this.connection;
    }
    getDefaultJobOptions() {
        return this.defaultJobOptions;
    }
};
exports.BullConfigService = BullConfigService;
exports.BullConfigService = BullConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], BullConfigService);
const DEFAULT_BULL_OPTIONS = {
    connection: new ioredis_1.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    }),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            count: 100,
            age: 24 * 3600,
        },
        removeOnFail: {
            count: 50,
            age: 7 * 24 * 3600,
        },
    },
};
let BullConfigModule = BullConfigModule_1 = class BullConfigModule extends common_2.ConfigurableModuleClass {
    static register(options) {
        return {
            module: BullConfigModule_1,
            providers: [
                {
                    provide: BullConfigService,
                    useFactory: () => new BullConfigService(options || DEFAULT_BULL_OPTIONS),
                },
            ],
            exports: [BullConfigService],
        };
    }
};
exports.BullConfigModule = BullConfigModule;
exports.BullConfigModule = BullConfigModule = BullConfigModule_1 = __decorate([
    (0, common_2.Global)(),
    (0, common_1.Injectable)()
], BullConfigModule);
//# sourceMappingURL=bull-config.service.js.map