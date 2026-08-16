import express from 'express';
import { FOUNDER_CONFIG } from '../config';
import { FounderCoinService } from '../services/coin-lifecycle.service';

const app = express();
const service = new FounderCoinService();

app.use(express.static('public'));

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    device: FOUNDER_CONFIG.deviceName,
    ready: service.isReady(),
    nfc: FOUNDER_CONFIG.nfcEnabled,
    oled: FOUNDER_CONFIG.oledEnabled,
  });
});

app.listen(FOUNDER_CONFIG.uiPort, '0.0.0.0', async () => {
  try {
    await service.init();
    console.log(`📱 Founder Device UI running on http://0.0.0.0:${FOUNDER_CONFIG.uiPort}`);
    console.log(`🔌 API available at http://0.0.0.0:${FOUNDER_CONFIG.port}\n`);
  } catch (error: any) {
    console.error('❌ Failed to initialize UI service:', error.message);
  }
});
