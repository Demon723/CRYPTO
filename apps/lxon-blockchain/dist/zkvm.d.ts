export interface zkVMReceipt {
    journal: Buffer;
    seal: Buffer;
}
export declare class RISCVzkVMProverStack {
    elfBinary: Buffer;
    constructor(elfBinary: Buffer);
    execute_and_generate_trace(inputData: Buffer): Promise<[Buffer, Buffer[]]>;
    generate_segment_starks(traceSegments: Buffer[]): Promise<Buffer[]>;
    aggregate_recursive_snark(starkProofs: Buffer[], publicJournal: Buffer): Promise<zkVMReceipt>;
    prove_state_transition(inputData: Buffer): Promise<zkVMReceipt>;
}
