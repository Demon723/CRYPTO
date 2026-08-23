/**
 * Configurable Resource Limits
 *
 * Allows users to configure memory, storage, CPU, and bandwidth limits
 * for running LXON nodes on resource-constrained devices.
 */
export interface ResourceLimits {
    maxMemoryMB: number;
    maxStorageMB: number;
    maxCPUPercent: number;
    maxBandwidthKBps: number;
    maxConnections: number;
}
export interface ResourceUsage {
    memoryMB: number;
    storageMB: number;
    cpuPercent: number;
    bandwidthKBps: number;
    connections: number;
}
export declare class ResourceManager {
    private limits;
    private currentUsage;
    private alertsEnabled;
    private autoThrottle;
    constructor(limits: ResourceLimits);
    /**
     * Update current resource usage
     */
    updateUsage(usage: Partial<ResourceUsage>): void;
    /**
     * Check if within limits
     */
    isWithinLimits(): boolean;
    /**
     * Get current limits
     */
    getLimits(): ResourceLimits;
    /**
     * Set new limits
     */
    setLimits(newLimits: Partial<ResourceLimits>): void;
    /**
     * Get current usage
     */
    getUsage(): ResourceUsage;
    /**
     * Get utilization percentage
     */
    getUtilization(): {
        memoryPercent: number;
        storagePercent: number;
        cpuPercent: number;
        bandwidthPercent: number;
        connectionsPercent: number;
    };
    /**
     * Enforce resource limits
     */
    private enforceLimits;
    /**
     * Throttle memory usage
     */
    private throttleMemory;
    /**
     * Throttle CPU usage
     */
    private throttleCPU;
    /**
     * Throttle bandwidth
     */
    private throttleBandwidth;
    /**
     * Limit connections
     */
    private limitConnections;
    /**
     * Check for resource alerts
     */
    private checkAlerts;
    /**
     * Issue alert
     */
    private alert;
    /**
     * Enable/disable alerts
     */
    setAlertsEnabled(enabled: boolean): void;
    /**
     * Enable/disable auto-throttling
     */
    setAutoThrottle(enabled: boolean): void;
}
/**
 * Preset configurations for different devices
 */
export declare const RESOURCE_PRESETS: {
    RASPBERRY_PI_4_4GB: {
        maxMemoryMB: number;
        maxStorageMB: number;
        maxCPUPercent: number;
        maxBandwidthKBps: number;
        maxConnections: number;
    };
    RASPBERRY_PI_4_8GB: {
        maxMemoryMB: number;
        maxStorageMB: number;
        maxCPUPercent: number;
        maxBandwidthKBps: number;
        maxConnections: number;
    };
    RASPBERRY_PI_3: {
        maxMemoryMB: number;
        maxStorageMB: number;
        maxCPUPercent: number;
        maxBandwidthKBps: number;
        maxConnections: number;
    };
    MOBILE_DEVICE: {
        maxMemoryMB: number;
        maxStorageMB: number;
        maxCPUPercent: number;
        maxBandwidthKBps: number;
        maxConnections: number;
    };
    DESKTOP: {
        maxMemoryMB: number;
        maxStorageMB: number;
        maxCPUPercent: number;
        maxBandwidthKBps: number;
        maxConnections: number;
    };
};
/**
 * Mobile-specific resource manager
 */
export declare class MobileResourceManager extends ResourceManager {
    private batteryLevel;
    private batterySaverMode;
    constructor(limits: ResourceLimits);
    /**
     * Update battery level
     */
    updateBatteryLevel(level: number): void;
    /**
     * Enable battery saver mode
     */
    private enableBatterySaver;
    /**
     * Disable battery saver mode
     */
    private disableBatterySaver;
    /**
     * Get mobile-specific tips
     */
    getMobileOptimizationTips(): string[];
}
/**
 * Resource-aware operation scheduler
 */
export declare class ResourceAwareScheduler {
    private resourceManager;
    private operationQueue;
    constructor(resourceManager: ResourceManager);
    /**
     * Schedule operation with resource cost
     */
    schedule(operation: () => Promise<void>, priority: number, resourceCost: ResourceUsage): Promise<void>;
    /**
     * Process operation queue
     */
    private processQueue;
    /**
     * Check if operation can be executed
     */
    private canExecute;
    /**
     * Get queue statistics
     */
    getQueueStats(): {
        queueLength: number;
        averagePriority: number;
        waitingCount: number;
    };
}
/**
 * Resource monitoring dashboard
 */
export declare class ResourceMonitor {
    private resourceManager;
    private history;
    private maxHistorySize;
    constructor(resourceManager: ResourceManager, maxHistorySize?: number);
    /**
     * Record resource usage
     */
    recordUsage(): void;
    /**
     * Get resource usage history
     */
    getHistory(limit?: number): Array<{
        timestamp: number;
        usage: ResourceUsage;
    }>;
    /**
     * Get average resource usage
     */
    getAverageUsage(): ResourceUsage;
    /**
     * Get peak resource usage
     */
    getPeakUsage(): ResourceUsage;
}
