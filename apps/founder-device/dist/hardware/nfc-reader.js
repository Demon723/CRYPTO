"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFCReader = void 0;
class NFCReader {
    constructor(enabled) {
        this.enabled = enabled;
    }
    async init() {
        if (!this.enabled)
            return;
        // On Pi: initialize PN532/RC522 via SPI/I2C
        console.log('NFC: Initializing reader...');
    }
    async readCard() {
        if (!this.enabled) {
            return { success: false, error: 'NFC not enabled' };
        }
        // On Pi: poll PN532/RC522 and return UID
        // Stub: return simulated success
        return {
            success: true,
            uid: '04:A3:2B:8C:9D',
            data: 'simulated-nfc-data',
        };
    }
    async writeCard(uid, data) {
        if (!this.enabled) {
            return { success: false, error: 'NFC not enabled' };
        }
        // On Pi: write NDEF payload to card
        console.log(`NFC: Writing to card ${uid}`);
        return { success: true, uid, data };
    }
    isEnabled() {
        return this.enabled;
    }
}
exports.NFCReader = NFCReader;
//# sourceMappingURL=nfc-reader.js.map