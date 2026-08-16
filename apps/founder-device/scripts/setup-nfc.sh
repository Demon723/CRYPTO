#!/bin/bash
set -e

echo "🔧 Setting up NFC hardware for LXON Founder Device..."

# Detect NFC hardware
if lsusb | grep -q "PN532"; then
    echo "Detected PN532 NFC module (USB)"
    NFC_DRIVER="pn532"
elif [ -f /dev/spidev0.0 ]; then
    echo "Detected SPI device (likely RC522)"
    NFC_DRIVER="rc522"
else
    echo "No NFC hardware detected. Please connect PN532 or RC522."
    exit 1
fi

# Install libnfc if not present
if ! command -v nfc-list &> /dev/null; then
    echo "Installing libnfc..."
    sudo apt-get install -y libnfc-dev libnfc-bin
fi

# Configure libnfc
echo "\nConfiguring libnfc for $NFC_DRIVER..."
sudo tee /etc/nfc/libnfc.conf > /dev/null << EOF
# LXON Founder Device NFC Configuration
device.connection_string = "$NFC_DRIVER"
device.pn53x_spi_bus = 0
device.pn53x_ss = 0
log.level = INFO
EOF

# Test NFC
echo "\nTesting NFC..."
nfc-list || echo "NFC test failed - check connections"

echo "\n✅ NFC setup complete!"
echo "Test with: nfc-poll"
