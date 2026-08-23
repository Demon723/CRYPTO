"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OLEDDisplayDriver = void 0;
class OLEDDisplayDriver {
    constructor(enabled, width = 128, height = 64) {
        this.enabled = enabled;
        this.width = width;
        this.height = height;
    }
    async init() {
        if (!this.enabled)
            return;
        console.log('OLED: Initializing display...');
    }
    async clear() {
        if (!this.enabled)
            return;
        // On Pi: clear SSD1306 buffer
    }
    async showText(lines) {
        if (!this.enabled)
            return;
        // On Pi: render text to OLED
        console.log('OLED:', lines.join(' | '));
    }
    async showAction(action, tokenId, status) {
        await this.showText([
            `Action: ${action.toUpperCase()}`,
            `Token: #${tokenId}`,
            `Status: ${status}`,
            new Date().toLocaleTimeString(),
        ]);
    }
    async showError(message) {
        await this.showText(['ERROR', message.slice(0, 16), '', 'Press any key...']);
    }
    async turnOff() {
        if (!this.enabled)
            return;
        // On Pi: power down OLED
    }
}
exports.OLEDDisplayDriver = OLEDDisplayDriver;
//# sourceMappingURL=oled-display.js.map