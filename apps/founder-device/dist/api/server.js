"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("../config");
const coin_lifecycle_service_1 = require("../services/coin-lifecycle.service");
const app = (0, express_1.default)();
const service = new coin_lifecycle_service_1.FounderCoinService();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        device: config_1.FOUNDER_CONFIG.deviceName,
        ready: service.isReady(),
        nfc: config_1.FOUNDER_CONFIG.nfcEnabled,
        oled: config_1.FOUNDER_CONFIG.oledEnabled,
    });
});
app.post('/api/activate', async (req, res) => {
    const { tokenId, reason } = req.body;
    if (!tokenId)
        return res.status(400).json({ error: 'tokenId required' });
    const result = await service.activate(tokenId, reason);
    res.json(result);
});
app.post('/api/freeze', async (req, res) => {
    const { tokenId, reason } = req.body;
    if (!tokenId)
        return res.status(400).json({ error: 'tokenId required' });
    const result = await service.freeze(tokenId, reason);
    res.json(result);
});
app.post('/api/deactivate', async (req, res) => {
    const { tokenId, reason } = req.body;
    if (!tokenId)
        return res.status(400).json({ error: 'tokenId required' });
    const result = await service.deactivate(tokenId, reason);
    res.json(result);
});
app.get('/api/status/:tokenId', async (req, res) => {
    try {
        const status = await service.getTokenStatus(parseInt(req.params.tokenId, 10));
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/register-cardholder', async (req, res) => {
    const { tokenId, nameHash, kycHash } = req.body;
    if (!tokenId || !nameHash || !kycHash) {
        return res.status(400).json({ error: 'tokenId, nameHash, and kycHash required' });
    }
    const result = await service.registerCardholder({ tokenId, nameHash, kycHash });
    res.json(result);
});
app.post('/api/batch', async (req, res) => {
    const { action, tokenIds, reason } = req.body;
    if (!action || !tokenIds || !Array.isArray(tokenIds)) {
        return res.status(400).json({ error: 'action and tokenIds array required' });
    }
    let results;
    switch (action) {
        case 'activate':
            results = await service.batchActivate(tokenIds);
            break;
        case 'freeze':
            results = await service.batchFreeze(tokenIds, reason || 'Founder freeze');
            break;
        case 'deactivate':
            results = await service.batchDeactivate(tokenIds, reason || 'Founder deactivate');
            break;
        default:
            return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    const successCount = results.filter((r) => r.success).length;
    res.json({ successCount, total: results.length, results });
});
app.listen(config_1.FOUNDER_CONFIG.port, '0.0.0.0', async () => {
    try {
        await service.init();
        console.log(`🔐 Founder Device API running on http://0.0.0.0:${config_1.FOUNDER_CONFIG.port}`);
        console.log(`📱 UI available at http://localhost:${config_1.FOUNDER_CONFIG.uiPort}`);
        console.log(`   Device: ${config_1.FOUNDER_CONFIG.deviceName}`);
        console.log(`   NFC: ${config_1.FOUNDER_CONFIG.nfcEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   OLED: ${config_1.FOUNDER_CONFIG.oledEnabled ? 'Enabled' : 'Disabled'}\n`);
    }
    catch (error) {
        console.error('❌ Failed to initialize service:', error.message);
        console.error('Set FOUNDER_PRIVATE_KEY, HELIOS_PBT_ADDRESS, and HELIOS_CARD_REGISTRY_ADDRESS\n');
    }
});
//# sourceMappingURL=server.js.map