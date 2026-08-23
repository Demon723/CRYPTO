/**
 * ARM Architecture Optimization
 *
 * Optimizations specifically for ARM-based devices like Raspberry Pi.
 * Compiles with ARM-specific optimizations for better performance.
 */
export interface ARMOptimizationConfig {
    enableNEON: boolean;
    enableVFP: boolean;
    enableCryptoExtensions: boolean;
    targetARMVersion: number;
    enableThumbMode: boolean;
}
export declare class ARMOptimizer {
    private config;
    private detectedFeatures;
    constructor(config: ARMOptimizationConfig);
    /**
     * Detect ARM CPU features
     */
    private detectARMFeatures;
    /**
     * Check if feature is available
     */
    hasFeature(feature: string): boolean;
    /**
     * Get optimal configuration for current hardware
     */
    getOptimalConfig(): ARMOptimizationConfig;
    /**
     * Optimize memory operations using NEON
     */
    neonOptimizedMemcpy(dest: string, src: string, size: number): void;
    /**
     * Standard memcpy fallback
     */
    private standardMemcpy;
    /**
     * Optimize hash operations using ARM crypto extensions
     */
    cryptoOptimizedHash(data: string): string;
    /**
     * Standard hash fallback
     */
    private standardHash;
    /**
     * Optimize for ARMv8 (64-bit ARM)
     */
    optimizeForARMv8(): string[];
    /**
     * Optimize for ARMv7 (32-bit ARM)
     */
    optimizeForARMv7(): string[];
    /**
     * Get compiler flags for ARM
     */
    getCompilerFlags(): string[];
    /**
     * Benchmark NEON vs standard operations
     */
    benchmarkNEON(): Promise<{
        neonTime: number;
        standardTime: number;
        speedup: number;
    }>;
    /**
     * Get memory bandwidth optimization tips
     */
    getMemoryOptimizationTips(): string[];
}
/**
 * Raspberry Pi Specific Optimizations
 */
export declare class RaspberryPiOptimizer extends ARMOptimizer {
    private piModel;
    private piVersion;
    constructor(config: ARMOptimizationConfig, piModel?: string, piVersion?: number);
    /**
     * Get Raspberry Pi specific optimizations
     */
    getPiOptimizations(): string[];
    /**
     * Get thermal optimization settings
     */
    getThermalOptimizations(): {
        maxCpuFrequency: number;
        thermalThrottlingEnabled: boolean;
        underVoltageProtection: boolean;
    };
    /**
     * Get power optimization settings
     */
    getPowerOptimizations(): {
        enablePowerSaving: boolean;
        cpuGovernor: string;
        maxPowerDraw: number;
    };
    /**
     * Optimize for Raspberry Pi 4B specifically
     */
    optimizeForPi4B(): string[];
    /**
     * Get SD card optimization tips
   */
    getSDCardOptimizations(): string[];
    /**
     * Get GPIO optimization for external devices
     */
    getGPIOOptimizations(): string[];
}
/**
 * ARM-specific performance monitoring
 */
export declare class ARMPerformanceMonitor {
    private cpuCycles;
    private cacheMisses;
    private branchMispredictions;
    constructor();
    /**
     * Start performance monitoring
     */
    startMonitoring(): void;
    /**
     * Stop monitoring and get results
     */
    stopMonitoring(): {
        cpuCycles: number;
        cacheMisses: number;
        branchMispredictions: number;
        cacheMissRate: number;
        branchMispredictionRate: number;
    };
    /**
     * Get ARM-specific performance tips
     */
    getPerformanceTips(): string[];
}
/**
 * ARM Configuration for different Raspberry Pi models
 */
export declare const ARM_CONFIGS: {
    PI_ZERO_2_W: {
        targetARMVersion: number;
        enableNEON: boolean;
        enableVFP: boolean;
        enableCryptoExtensions: boolean;
        enableThumbMode: boolean;
    };
    'PI_3B+': {
        targetARMVersion: number;
        enableNEON: boolean;
        enableVFP: boolean;
        enableCryptoExtensions: boolean;
        enableThumbMode: boolean;
    };
    PI_4B: {
        targetARMVersion: number;
        enableNEON: boolean;
        enableVFP: boolean;
        enableCryptoExtensions: boolean;
        enableThumbMode: boolean;
    };
    PI_5: {
        targetARMVersion: number;
        enableNEON: boolean;
        enableVFP: boolean;
        enableCryptoExtensions: boolean;
        enableThumbMode: boolean;
    };
};
