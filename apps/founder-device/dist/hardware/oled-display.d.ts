export interface OLEDDisplay {
    clear(): Promise<void>;
    showText(lines: string[]): Promise<void>;
    showAction(action: string, tokenId: number, status: string): Promise<void>;
    showError(message: string): Promise<void>;
    turnOff(): Promise<void>;
}
export declare class OLEDDisplayDriver implements OLEDDisplay {
    private enabled;
    private width;
    private height;
    constructor(enabled: boolean, width?: number, height?: number);
    init(): Promise<void>;
    clear(): Promise<void>;
    showText(lines: string[]): Promise<void>;
    showAction(action: string, tokenId: number, status: string): Promise<void>;
    showError(message: string): Promise<void>;
    turnOff(): Promise<void>;
}
