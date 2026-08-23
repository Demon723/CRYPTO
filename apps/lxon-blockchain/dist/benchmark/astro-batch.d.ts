export interface BatchVerificationResult {
    total: number;
    valid: number;
    invalid: number;
    durationMs: number;
    perSignatureUs: number;
}
export declare function runBatchARCBenchmark(count?: number): Promise<BatchVerificationResult>;
export declare function runBatchARCSimulation(): Promise<void>;
