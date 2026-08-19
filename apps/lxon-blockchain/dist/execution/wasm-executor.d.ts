import { WasmModule } from '../wasm-hotswap';
export interface ExecutionContext {
    moduleName: string;
    caller: string;
    gasLimit: bigint;
    gasUsed: bigint;
    input: Buffer;
    output: Buffer;
    stateReads: Map<string, Buffer>;
    stateWrites: Map<string, Buffer>;
    logs: string[];
    metadata: Record<string, any>;
}
export interface ExecutionResult {
    success: boolean;
    output: Buffer;
    gasUsed: bigint;
    logs: string[];
    error?: string;
}
export declare class WasmExecutor {
    private gasPrice;
    private maxMemoryPages;
    private executionTimeoutMs;
    private allowedImports;
    createContext(module: WasmModule, caller: string, input: Buffer): ExecutionContext;
    execute(module: WasmModule, context: ExecutionContext): ExecutionResult;
    validateModule(module: WasmModule): {
        valid: boolean;
        errors: string[];
    };
    setGasPrice(price: bigint): void;
    getGasPrice(): bigint;
    private _estimateGasCost;
}
