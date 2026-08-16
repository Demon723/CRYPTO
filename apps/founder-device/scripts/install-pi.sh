#!/bin/bash
set -e

echo "🔐 LXON Founder Device - Raspberry Pi Setup"
echo "============================================\n"

# Check if running on Raspberry Pi
if [ -f /proc/device-tree/model ]; then
    MODEL=$(cat /proc/device-tree/model)
    echo "Detected: $MODEL"
else
    echo "Warning: Not running on Raspberry Pi. Some hardware features may not work."
fi

# Update system
echo "\n📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20
echo "\n📦 Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install pnpm
echo "\n📦 Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    sudo npm install -g pnpm
else
    echo "pnpm already installed: $(pnpm --version)"
fi

# Install system dependencies
echo "\n📦 Installing system dependencies..."
sudo apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    libusb-1.0-0-dev \
    libudev-dev \
    i2c-tools \
    spi-tools \
    git \
    curl \
    wget

# Install NFC dependencies
echo "\n📦 Installing NFC dependencies..."
if [ "$NFC_ENABLED" = "true" ]; then
    sudo apt-get install -y libnfc-dev libnfc-bin
    echo "NFC tools installed"
else
    echo "NFC disabled (set NFC_ENABLED=true to enable)"
fi

# Install I2C OLED dependencies
echo "\n📦 Installing OLED dependencies..."
if [ "$OLED_ENABLED" = "true" ]; then
    sudo apt-get install -y python3-pip
    pip3 install --break-system-packages luma.oled
    echo "OLED libraries installed"
else
    echo "OLED disabled (set OLED_ENABLED=true to enable)"
fi

# Enable I2C and SPI
echo "\n🔧 Enabling I2C and SPI interfaces..."
sudo raspi-config nonint do_i2c 0
sudo raspi-config nonint do_spi 0

# Add user to necessary groups
echo "\n👤 Configuring user permissions..."
sudo usermod -a -G gpio,i2c,spi,dialout $USER

# Install project dependencies
echo "\n📦 Installing project dependencies..."
cd /Users/adikamble/LXON/LXON
pnpm install

# Build founder device
echo "\n🔨 Building founder device..."
cd apps/founder-device
pnpm build

# Create environment file
echo "\n📝 Creating environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
# LXON Founder Device Configuration
FOUNDER_PRIVATE_KEY=0x
HELIOS_PBT_ADDRESS=0x
HELIOS_CARD_REGISTRY_ADDRESS=0x
HELIOS_CHIP_REGISTRY_ADDRESS=0x
RPC_URL=http://127.0.0.1:8545
DEVICE_NAME=Founder Pi
PORT=3001
UI_PORT=3002
NFC_ENABLED=false
OLED_ENABLED=false
TEAM_MEMBERS=
EOF
    echo "Created .env file. Please edit it with your configuration."
fi

# Create systemd service
echo "\n🔧 Creating systemd service..."
sudo tee /etc/systemd/system/lxon-founder.service > /dev/null << EOF
[Unit]
Description=LXON Founder Device
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/Users/adikamble/LXON/LXON/apps/founder-device
ExecStart=/usr/bin/node dist/api/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable lxon-founder.service

echo "\n✅ Setup complete!"
echo "\nNext steps:"
echo "1. Edit apps/founder-device/.env with your private key and contract addresses"
echo "2. Test the device: cd apps/founder-device && pnpm dev"
echo "3. Start the service: sudo systemctl start lxon-founder"
echo "4. Access UI at: http://$(hostname -I | awk '{print $1}'):3002"
echo "\nFor NFC/OLED support, edit .env and run: pnpm setup:nfc"
