"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmExecutor = void 0;
class WasmExecutor {
    gasPrice = BigInt(1);
    maxMemoryPages = 256;
    executionTimeoutMs = 5000;
    allowedImports = new Set([
        'env.log',
        'env.read_state',
        'env.write_state',
        'env.get_block_timestamp',
        'env.get_caller',
        'env.transfer',
    ]);
    createContext(module, caller, input) {
        return {
            moduleName: module.name,
            caller,
            gasLimit: module.metadata.gasLimit,
            gasUsed: BigInt(0),
            input,
            output: Buffer.alloc(0),
            stateReads: new Map(),
            stateWrites: new Map(),
            logs: [],
            metadata: {},
        };
    }
    execute(module, context) {
        const startTime = Date.now();
        try {
            if (context.gasUsed >= context.gasLimit) {
                return {
                    success: false,
                    output: Buffer.alloc(0),
                    gasUsed: context.gasLimit,
                    logs: [],
                    error: 'Out of gas',
                };
            }
            const gasCost = this._estimateGasCost(module, context.input);
            if (context.gasUsed + gasCost > context.gasLimit) {
                return {
                    success: false,
                    output: Buffer.alloc(0),
                    gasUsed: context.gasUsed,
                    logs: [],
                    error: 'Insufficient gas for execution',
                };
            }
            context.gasUsed += gasCost;
            const exportName = Object.keys(module.exports)[0];
            if (!exportName || !module.exports[exportName]) {
                return {
                    success: false,
                    output: Buffer.alloc(0),
                    gasUsed: context.gasUsed,
                    logs: [],
                    error: 'No exportable entry point found',
                };
            }
            const entryPoint = module.exports[exportName];
            const result = entryPoint(context.input);
            if (result instanceof Buffer) {
                context.output = result;
            }
            else if (typeof result === 'string') {
                context.output = Buffer.from(result);
            }
            else if (typeof result === 'object') {
                context.output = Buffer.from(JSON.stringify(result));
            }
            context.logs.push(`Executed ${exportName} in ${Date.now() - startTime}ms`);
            return {
                success: true,
                output: context.output,
                gasUsed: context.gasUsed,
                logs: context.logs,
            };
        }
        catch (error) {
            return {
                success: false,
                output: Buffer.alloc(0),
                gasUsed: context.gasUsed,
                logs: context.logs,
                error: error instanceof Error ? error.message : 'Unknown execution error',
            };
        }
    }
    validateModule(module) {
        const errors = [];
        if (!module.name || module.name.length === 0) {
            errors.push('Module name is required');
        }
        if (!module.version || module.version.length === 0) {
            errors.push('Module version is required');
        }
        if (!module.wasmBinary || module.wasmBinary.length === 0) {
            errors.push('WASM binary is empty');
        }
        if (module.wasmBinary.length > 10 * 1024 * 1024) {
            errors.push('WASM binary exceeds 10MB limit');
        }
        if (module.metadata.gasLimit < BigInt(10000)) {
            errors.push('Gas limit too low (minimum 10000)');
        }
        if (module.metadata.memoryPages < 1 || module.metadata.memoryPages > this.maxMemoryPages) {
            errors.push(`Memory pages out of range: ${module.metadata.memoryPages}`);
        }
        const exports = Object.keys(module.exports);
        if (exports.length === 0) {
            errors.push('Module must export at least one function');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    setGasPrice(price) {
        this.gasPrice = price;
    }
    getGasPrice() {
        return this.gasPrice;
    }
    _estimateGasCost(module, input) {
        const baseCost = BigInt(100);
        const inputCost = BigInt(input.length) * BigInt(3);
        const binarySizeCost = BigInt(Math.floor(module.wasmBinary.length / 1024)) * BigInt(10);
        return baseCost + inputCost + binarySizeCost;
    }
}
exports.WasmExecutor = WasmExecutor;
