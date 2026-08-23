"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const coin_lifecycle_service_1 = require("../services/coin-lifecycle.service");
const app = (0, express_1.default)();
const service = new coin_lifecycle_service_1.FounderCoinService();
app.use(express_1.default.static('public'));
app.get('/api/health', async (req, res) => {
    res.json({
        status: 'ok',
        device: config_1.FOUNDER_CONFIG.deviceName,
        ready: service.isReady(),
        nfc: config_1.FOUNDER_CONFIG.nfcEnabled,
        oled: config_1.FOUNDER_CONFIG.oledEnabled,
    });
});
app.listen(config_1.FOUNDER_CONFIG.uiPort, '0.0.0.0', async () => {
    try {
        await service.init();
        console.log(`📱 Founder Device UI running on http://0.0.0.0:${config_1.FOUNDER_CONFIG.uiPort}`);
        console.log(`🔌 API available at http://0.0.0.0:${config_1.FOUNDER_CONFIG.port}\n`);
    }
    catch (error) {
        console.error('❌ Failed to initialize UI service:', error.message);
    }
});
//# sourceMappingURL=server.js.map