export interface OLEDDisplay {
  clear(): Promise<void>;
  showText(lines: string[]): Promise<void>;
  showAction(action: string, tokenId: number, status: string): Promise<void>;
  showError(message: string): Promise<void>;
  turnOff(): Promise<void>;
}

export class OLEDDisplayDriver implements OLEDDisplay {
  private enabled: boolean;
  private width: number;
  private height: number;

  constructor(enabled: boolean, width = 128, height = 64) {
    this.enabled = enabled;
    this.width = width;
    this.height = height;
  }

  async init(): Promise<void> {
    if (!this.enabled) return;
    console.log('OLED: Initializing display...');
  }

  async clear(): Promise<void> {
    if (!this.enabled) return;
    // On Pi: clear SSD1306 buffer
  }

  async showText(lines: string[]): Promise<void> {
    if (!this.enabled) return;
    // On Pi: render text to OLED
    console.log('OLED:', lines.join(' | '));
  }

  async showAction(action: string, tokenId: number, status: string): Promise<void> {
    await this.showText([
      `Action: ${action.toUpperCase()}`,
      `Token: #${tokenId}`,
      `Status: ${status}`,
      new Date().toLocaleTimeString(),
    ]);
  }

  async showError(message: string): Promise<void> {
    await this.showText(['ERROR', message.slice(0, 16), '', 'Press any key...']);
  }

  async turnOff(): Promise<void> {
    if (!this.enabled) return;
    // On Pi: power down OLED
  }
}
