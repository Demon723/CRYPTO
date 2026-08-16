# LXON Founder Device

Raspberry Pi device for LXON founders and team to manage physical coin lifecycle operations.

## Features

- **Activate** physical coins (founder-gated)
- **Freeze** coins (emergency stop)
- **Deactivate** coins (permanent disable)
- **Register** premium cardholders with KYC hashes
- **Batch** operations for multiple coins
- **NFC** card reader support (PN532/RC522)
- **OLED** display for status feedback
- **Web UI** accessible from phone/laptop
- **REST API** for remote control

## Hardware Requirements

- Raspberry Pi 3B+ or 4/5
- PN532 NFC module or RC522 RFID reader
- SSD1306 128x64 OLED display (optional)
- Case with NFC antenna and display

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/adikamble/LXON/LXON/apps/founder-device
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values:
# - FOUNDER_PRIVATE_KEY: Your founder wallet private key
# - HELIOS_PBT_ADDRESS: Deployed HeliosPBTv3 address
# - HELIOS_CARD_REGISTRY_ADDRESS: Deployed card registry address
# - RPC_URL: Your RPC endpoint
```

### 3. Run CLI (Direct Terminal)

```bash
pnpm dev
```

### 4. Run API + UI (Remote Control)

```bash
# Terminal 1: API server
pnpm api

# Terminal 2: UI server
pnpm ui
```

Access the UI at `http://<pi-ip>:3002`

## CLI Commands

| Command | Description |
|---------|-------------|
| `activate` | Activate a physical coin |
| `freeze` | Freeze a coin (emergency) |
| `deactivate` | Permanently deactivate a coin |
| `status` | Check coin status |
| `register` | Register premium cardholder |
| `batch` | Batch operations |
| `quit` | Exit |

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Device health check |
| `POST` | `/api/activate` | Activate token |
| `POST` | `/api/freeze` | Freeze token |
| `POST` | `/api/deactivate` | Deactivate token |
| `GET` | `/api/status/:tokenId` | Get token status |
| `POST` | `/api/register-cardholder` | Register cardholder |
| `POST` | `/api/batch` | Batch operations |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FOUNDER_PRIVATE_KEY` | Yes | Founder wallet private key |
| `HELIOS_PBT_ADDRESS` | Yes | HeliosPBTv3 contract address |
| `HELIOS_CARD_REGISTRY_ADDRESS` | Yes | Card registry address |
| `HELIOS_CHIP_REGISTRY_ADDRESS` | No | Chip registry address |
| `RPC_URL` | Yes | RPC endpoint |
| `DEVICE_NAME` | No | Device display name |
| `PORT` | No | API port (default: 3001) |
| `UI_PORT` | No | UI port (default: 3002) |
| `NFC_ENABLED` | No | Enable NFC reader (default: false) |
| `OLED_ENABLED` | No | Enable OLED display (default: false) |

## Deployment

### Deploy to Pi

```bash
pnpm founder:install:pi
```

This will:
1. Update system packages
2. Install Node.js 20 and pnpm
3. Install NFC and OLED dependencies
4. Enable I2C and SPI interfaces
5. Build the project
6. Create a systemd service

### Start Service

```bash
sudo systemctl start lxon-founder
sudo systemctl enable lxon-founder
```

### View Logs

```bash
journalctl -u lxon-founder -f
```

## Hardware Setup

### NFC Reader (PN532)

```
PN532     Raspberry Pi
VCC   ->  3.3V
GND   ->  GND
SDA   ->  GPIO 2 (SDA)
SCL   ->  GPIO 3 (SCL)
```

### OLED Display (SSD1306)

```
OLED     Raspberry Pi
VCC   ->  3.3V
GND   ->  GND
SDA   ->  GPIO 2 (SDA)
SCL   ->  GPIO 3 (SCL)
```

## Security

- The `FOUNDER_PRIVATE_KEY` grants full control over coin lifecycle
- Store the key in a secure enclave if possible
- The device should be physically secured
- Use team member whitelisting for multi-user setups

## License

MIT
