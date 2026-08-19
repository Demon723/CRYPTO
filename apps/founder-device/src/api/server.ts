import express from 'express';
import cors from 'cors';
import { FOUNDER_CONFIG } from '../config';
import { FounderCoinService } from '../services/coin-lifecycle.service';

const app = express();
const service = new FounderCoinService();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    device: FOUNDER_CONFIG.deviceName,
    ready: service.isReady(),
    nfc: FOUNDER_CONFIG.nfcEnabled,
    oled: FOUNDER_CONFIG.oledEnabled,
  });
});

app.post('/api/activate', async (req, res) => {
  const { tokenId, reason } = req.body;
  if (!tokenId) return res.status(400).json({ error: 'tokenId required' });
  const result = await service.activate(tokenId, reason);
  res.json(result);
});

app.post('/api/freeze', async (req, res) => {
  const { tokenId, reason } = req.body;
  if (!tokenId) return res.status(400).json({ error: 'tokenId required' });
  const result = await service.freeze(tokenId, reason);
  res.json(result);
});

app.post('/api/deactivate', async (req, res) => {
  const { tokenId, reason } = req.body;
  if (!tokenId) return res.status(400).json({ error: 'tokenId required' });
  const result = await service.deactivate(tokenId, reason);
  res.json(result);
});

app.get('/api/status/:tokenId', async (req, res) => {
  try {
    const status = await service.getTokenStatus(parseInt(req.params.tokenId, 10));
    res.json(status);
  } catch (error: any) {
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

app.listen(FOUNDER_CONFIG.port, '0.0.0.0', async () => {
  try {
    await service.init();
    console.log(`🔐 Founder Device API running on http://0.0.0.0:${FOUNDER_CONFIG.port}`);
    console.log(`📱 UI available at http://localhost:${FOUNDER_CONFIG.uiPort}`);
    console.log(`   Device: ${FOUNDER_CONFIG.deviceName}`);
    console.log(`   NFC: ${FOUNDER_CONFIG.nfcEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   OLED: ${FOUNDER_CONFIG.oledEnabled ? 'Enabled' : 'Disabled'}\n`);
  } catch (error: any) {
    console.error('❌ Failed to initialize service:', error.message);
    console.error('Set FOUNDER_PRIVATE_KEY, HELIOS_PBT_ADDRESS, and HELIOS_CARD_REGISTRY_ADDRESS\n');
  }
});
