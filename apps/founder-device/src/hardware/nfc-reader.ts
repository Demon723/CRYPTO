export interface NFCResult {
  success: boolean;
  uid?: string;
  data?: string;
  error?: string;
}

export class NFCReader {
  private enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  async init(): Promise<void> {
    if (!this.enabled) return;
    // On Pi: initialize PN532/RC522 via SPI/I2C
    console.log('NFC: Initializing reader...');
  }

  async readCard(): Promise<NFCResult> {
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

  async writeCard(uid: string, data: string): Promise<NFCResult> {
    if (!this.enabled) {
      return { success: false, error: 'NFC not enabled' };
    }

    // On Pi: write NDEF payload to card
    console.log(`NFC: Writing to card ${uid}`);
    return { success: true, uid, data };
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
