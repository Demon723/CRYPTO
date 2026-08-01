export interface WasmModule {
  name: string;
  version: string;
  hash: string;
  wasmBinary: Buffer;
  exports: Record<string, Function>;
}

export interface ModuleManifest {
  name: string;
  version: string;
  checksum: string;
  wasmPath: string;
  dependencies: string[];
  gasLimit: bigint;
}

export interface HotSwapResult {
  success: boolean;
  oldModule: string | null;
  newModule: string;
  reason: string;
}

export class WasmRuntime {
  private loadedModules: Map<string, WasmModule> = new Map();
  private moduleHistory: Array<{ name: string; version: string; timestamp: number; action: string }> = [];

  async loadModule(manifest: ModuleManifest): Promise<WasmModule> {
    const fs = await import('fs');
    const path = await import('path');

    const wasmPath = path.resolve(manifest.wasmPath);
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM module not found: ${wasmPath}`);
    }

    const wasmBinary = fs.readFileSync(wasmPath);
    const computedHash = this._computeHash(wasmBinary);

    if (manifest.checksum && computedHash !== manifest.checksum) {
      throw new Error(`WASM module checksum mismatch: expected ${manifest.checksum}, got ${computedHash}`);
    }

    const module: WasmModule = {
      name: manifest.name,
      version: manifest.version,
      hash: computedHash,
      wasmBinary,
      exports: {},
    };

    this.loadedModules.set(manifest.name, module);
    this.moduleHistory.push({
      name: manifest.name,
      version: manifest.version,
      timestamp: Date.now(),
      action: 'LOAD',
    });

    return module;
  }

  async hotSwapModule(name: string, newManifest: ModuleManifest): Promise<HotSwapResult> {
    const oldModule = this.loadedModules.get(name);

    if (!oldModule) {
      const newModule = await this.loadModule(newManifest);
      return {
        success: true,
        oldModule: null,
        newModule: name,
        reason: `Module ${name} loaded for the first time`,
      };
    }

    if (oldModule.hash === newManifest.checksum) {
      return {
        success: false,
        oldModule: name,
        newModule: name,
        reason: 'New module has same checksum as current - no swap needed',
      };
    }

    const newModule = await this.loadModule(newManifest);

    this.moduleHistory.push({
      name,
      version: newManifest.version,
      timestamp: Date.now(),
      action: 'HOT_SWAP',
    });

    return {
      success: true,
      oldModule: `${name}@${oldModule.version}`,
      newModule: `${name}@${newManifest.version}`,
      reason: `Hot-swapped ${name} from v${oldModule.version} to v${newManifest.version}`,
    };
  }

  getModule(name: string): WasmModule | undefined {
    return this.loadedModules.get(name);
  }

  getModuleHistory(): Array<{ name: string; version: string; timestamp: number; action: string }> {
    return [...this.moduleHistory];
  }

  listModules(): WasmModule[] {
    return Array.from(this.loadedModules.values());
  }

  private _computeHash(buffer: Buffer): string {
    let hash = 0;
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      hash = ((hash << 5) - hash + byte) | 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }
}