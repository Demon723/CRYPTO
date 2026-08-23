export interface NFCResult {
    success: boolean;
    uid?: string;
    data?: string;
    error?: string;
}
export declare class NFCReader {
    private enabled;
    constructor(enabled: boolean);
    init(): Promise<void>;
    readCard(): Promise<NFCResult>;
    writeCard(uid: string, data: string): Promise<NFCResult>;
    isEnabled(): boolean;
}
