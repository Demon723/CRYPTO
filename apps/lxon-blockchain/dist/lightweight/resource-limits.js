"use strict";
/**
 * Configurable Resource Limits
 *
 * Allows users to configure memory, storage, CPU, and bandwidth limits
 * for running LXON nodes on resource-constrained devices.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceMonitor = exports.ResourceAwareScheduler = exports.MobileResourceManager = exports.RESOURCE_PRESETS = exports.ResourceManager = void 0;
class ResourceManager {
    limits;
    currentUsage;
    alertsEnabled;
    autoThrottle;
    constructor(limits) {
        this.limits = limits;
        this.currentUsage = {
            memoryMB: 0,
            storageMB: 0,
            cpuPercent: 0,
            bandwidthKBps: 0,
            connections: 0
        };
        this.alertsEnabled = true;
        this.autoThrottle = true;
    }
    /**
     * Update current resource usage
     */
    updateUsage(usage) {
        this.currentUsage = { ...this.currentUsage, ...usage };
        if (this.autoThrottle) {
            this.enforceLimits();
        }
        if (this.alertsEnabled) {
            this.checkAlerts();
        }
    }
    /**
     * Check if within limits
     */
    isWithinLimits() {
        return (this.currentUsage.memoryMB <= this.limits.maxMemoryMB &&
            this.currentUsage.storageMB <= this.limits.maxStorageMB &&
            this.currentUsage.cpuPercent <= this.limits.maxCPUPercent &&
            this.currentUsage.bandwidthKBps <= this.limits.maxBandwidthKBps &&
            this.currentUsage.connections <= this.limits.maxConnections);
    }
    /**
     * Get current limits
     */
    getLimits() {
        return { ...this.limits };
    }
    /**
     * Set new limits
     */
    setLimits(newLimits) {
        this.limits = { ...this.limits, ...newLimits };
    }
    /**
     * Get current usage
     */
    getUsage() {
        return { ...this.currentUsage };
    }
    /**
     * Get utilization percentage
     */
    getUtilization() {
        return {
            memoryPercent: (this.currentUsage.memoryMB / this.limits.maxMemoryMB) * 100,
            storagePercent: (this.currentUsage.storageMB / this.limits.maxStorageMB) * 100,
            cpuPercent: (this.currentUsage.cpuPercent / this.limits.maxCPUPercent) * 100,
            bandwidthPercent: (this.currentUsage.bandwidthKBps / this.limits.maxBandwidthKBps) * 100,
            connectionsPercent: (this.currentUsage.connections / this.limits.maxConnections) * 100
        };
    }
    /**
     * Enforce resource limits
     */
    enforceLimits() {
        // Memory throttling
        if (this.currentUsage.memoryMB > this.limits.maxMemoryMB * 0.9) {
            this.throttleMemory();
        }
        // CPU throttling
        if (this.currentUsage.cpuPercent > this.limits.maxCPUPercent * 0.9) {
            this.throttleCPU();
        }
        // Bandwidth throttling
        if (this.currentUsage.bandwidthKBps > this.limits.maxBandwidthKBps * 0.9) {
            this.throttleBandwidth();
        }
        // Connection limiting
        if (this.currentUsage.connections > this.limits.maxConnections * 0.9) {
            this.limitConnections();
        }
    }
    /**
     * Throttle memory usage
     */
    throttleMemory() {
        console.log('Throttling memory usage');
        // In production, trigger garbage collection, prune caches, etc.
    }
    /**
     * Throttle CPU usage
     */
    throttleCPU() {
        console.log('Throttling CPU usage');
        // In production, reduce worker threads, slow down operations, etc.
    }
    /**
     * Throttle bandwidth
     */
    throttleBandwidth() {
        console.log('Throttling bandwidth');
        // In production, reduce download speed, limit concurrent requests, etc.
    }
    /**
     * Limit connections
     */
    limitConnections() {
        console.log('Limiting connections');
        // In production, reject new connections, close idle connections, etc.
    }
    /**
     * Check for resource alerts
     */
    checkAlerts() {
        const utilization = this.getUtilization();
        if (utilization.memoryPercent > 90) {
            this.alert('Memory usage critical', utilization.memoryPercent);
        }
        if (utilization.storagePercent > 90) {
            this.alert('Storage usage critical', utilization.storagePercent);
        }
        if (utilization.cpuPercent > 90) {
            this.alert('CPU usage critical', utilization.cpuPercent);
        }
        if (utilization.bandwidthPercent > 90) {
            this.alert('Bandwidth usage critical', utilization.bandwidthPercent);
        }
    }
    /**
     * Issue alert
     */
    alert(message, value) {
        console.warn(`[RESOURCE ALERT] ${message}: ${value.toFixed(1)}%`);
        // In production, send to monitoring system, trigger notifications, etc.
    }
    /**
     * Enable/disable alerts
     */
    setAlertsEnabled(enabled) {
        this.alertsEnabled = enabled;
    }
    /**
     * Enable/disable auto-throttling
     */
    setAutoThrottle(enabled) {
        this.autoThrottle = enabled;
    }
}
exports.ResourceManager = ResourceManager;
/**
 * Preset configurations for different devices
 */
exports.RESOURCE_PRESETS = {
    RASPBERRY_PI_4_4GB: {
        maxMemoryMB: 3500, // Leave 500MB for OS
        maxStorageMB: 80 * 1024, // 80GB (leaves 20GB for OS)
        maxCPUPercent: 80,
        maxBandwidthKBps: 1000, // 1 Mbps
        maxConnections: 50
    },
    RASPBERRY_PI_4_8GB: {
        maxMemoryMB: 7000, // Leave 1GB for OS
        maxStorageMB: 80 * 1024,
        maxCPUPercent: 80,
        maxBandwidthKBps: 1000,
        maxConnections: 100
    },
    RASPBERRY_PI_3: {
        maxMemoryMB: 900, // 1GB board, leave 100MB for OS
        maxStorageMB: 16 * 1024, // 16GB SD card
        maxCPUPercent: 70,
        maxBandwidthKBps: 500, // 500 Kbps
        maxConnections: 25
    },
    MOBILE_DEVICE: {
        maxMemoryMB: 512, // Conservative for mobile
        maxStorageMB: 10 * 1024, // 10GB storage
        maxCPUPercent: 50,
        maxBandwidthKBps: 500,
        maxConnections: 10
    },
    DESKTOP: {
        maxMemoryMB: 16384, // 16GB
        maxStorageMB: 500 * 1024, // 500GB
        maxCPUPercent: 90,
        maxBandwidthKBps: 10000, // 10 Mbps
        maxConnections: 1000
    }
};
/**
 * Mobile-specific resource manager
 */
class MobileResourceManager extends ResourceManager {
    batteryLevel;
    batterySaverMode;
    constructor(limits) {
        super(limits);
        this.batteryLevel = 100;
        this.batterySaverMode = false;
    }
    /**
     * Update battery level
     */
    updateBatteryLevel(level) {
        this.batteryLevel = level;
        if (level < 20 && !this.batterySaverMode) {
            this.enableBatterySaver();
        }
        else if (level > 50 && this.batterySaverMode) {
            this.disableBatterySaver();
        }
    }
    /**
     * Enable battery saver mode
     */
    enableBatterySaver() {
        this.batterySaverMode = true;
        // Reduce resource limits
        this.setLimits({
            maxCPUPercent: 30,
            maxBandwidthKBps: 250,
            maxConnections: 5
        });
        console.log('Battery saver mode enabled');
    }
    /**
     * Disable battery saver mode
     */
    disableBatterySaver() {
        this.batterySaverMode = false;
        // Restore normal limits
        this.setLimits(exports.RESOURCE_PRESETS.MOBILE_DEVICE);
        console.log('Battery saver mode disabled');
    }
    /**
     * Get mobile-specific tips
     */
    getMobileOptimizationTips() {
        return [
            'Use battery saver mode when battery < 20%',
            'Limit background syncing to save battery',
            'Use Wi-Fi instead of cellular data when possible',
            'Reduce sync frequency when on cellular',
            'Compress data to reduce bandwidth usage',
            'Use push notifications instead of polling'
        ];
    }
}
exports.MobileResourceManager = MobileResourceManager;
/**
 * Resource-aware operation scheduler
 */
class ResourceAwareScheduler {
    resourceManager;
    operationQueue = new Array();
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
    }
    /**
     * Schedule operation with resource cost
     */
    async schedule(operation, priority, resourceCost) {
        return new Promise((resolve, reject) => {
            this.operationQueue.push({
                operation,
                priority,
                resourceCost
            });
            this.processQueue().then(resolve).catch(reject);
        });
    }
    /**
     * Process operation queue
     */
    async processQueue() {
        // Sort by priority (higher priority first)
        this.operationQueue.sort((a, b) => b.priority - a.priority);
        // Process operations that fit within resource limits
        for (const op of this.operationQueue) {
            if (this.canExecute(op.resourceCost)) {
                try {
                    await op.operation();
                    this.operationQueue.shift();
                }
                catch (error) {
                    console.error('Operation failed:', error);
                    this.operationQueue.shift();
                }
            }
            else {
                // Not enough resources, wait
                break;
            }
        }
    }
    /**
     * Check if operation can be executed
     */
    canExecute(resourceCost) {
        const usage = this.resourceManager.getUsage();
        const limits = this.resourceManager.getLimits();
        return (usage.memoryMB + resourceCost.memoryMB <= limits.maxMemoryMB &&
            usage.storageMB + resourceCost.storageMB <= limits.maxStorageMB &&
            usage.cpuPercent + resourceCost.cpuPercent <= limits.maxCPUPercent &&
            usage.bandwidthKBps + resourceCost.bandwidthKBps <= limits.maxBandwidthKBps);
    }
    /**
     * Get queue statistics
     */
    getQueueStats() {
        const queueLength = this.operationQueue.length;
        const averagePriority = queueLength > 0
            ? this.operationQueue.reduce((sum, op) => sum + op.priority, 0) / queueLength
            : 0;
        const waitingCount = this.operationQueue.filter(op => !this.canExecute(op.resourceCost)).length;
        return {
            queueLength,
            averagePriority,
            waitingCount
        };
    }
}
exports.ResourceAwareScheduler = ResourceAwareScheduler;
/**
 * Resource monitoring dashboard
 */
class ResourceMonitor {
    resourceManager;
    history = [];
    maxHistorySize;
    constructor(resourceManager, maxHistorySize = 1000) {
        this.resourceManager = resourceManager;
        this.maxHistorySize = maxHistorySize;
    }
    /**
     * Record resource usage
     */
    recordUsage() {
        const usage = this.resourceManager.getUsage();
        this.history.push({
            timestamp: Date.now(),
            usage
        });
        // Trim history if too large
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    /**
     * Get resource usage history
     */
    getHistory(limit) {
        if (limit) {
            return this.history.slice(-limit);
        }
        return [...this.history];
    }
    /**
     * Get average resource usage
     */
    getAverageUsage() {
        if (this.history.length === 0) {
            return {
                memoryMB: 0,
                storageMB: 0,
                cpuPercent: 0,
                bandwidthKBps: 0,
                connections: 0
            };
        }
        const total = this.history.reduce((acc, record) => ({
            memoryMB: acc.memoryMB + record.usage.memoryMB,
            storageMB: acc.storageMB + record.usage.storageMB,
            cpuPercent: acc.cpuPercent + record.usage.cpuPercent,
            bandwidthKBps: acc.bandwidthKBps + record.usage.bandwidthKBps,
            connections: acc.connections + record.usage.connections
        }), {
            memoryMB: 0,
            storageMB: 0,
            cpuPercent: 0,
            bandwidthKBps: 0,
            connections: 0
        });
        const count = this.history.length;
        return {
            memoryMB: total.memoryMB / count,
            storageMB: total.storageMB / count,
            cpuPercent: total.cpuPercent / count,
            bandwidthKBps: total.bandwidthKBps / count,
            connections: total.connections / count
        };
    }
    /**
     * Get peak resource usage
     */
    getPeakUsage() {
        if (this.history.length === 0) {
            return {
                memoryMB: 0,
                storageMB: 0,
                cpuPercent: 0,
                bandwidthKBps: 0,
                connections: 0
            };
        }
        return this.history.reduce((peak, record) => ({
            memoryMB: Math.max(peak.memoryMB, record.usage.memoryMB),
            storageMB: Math.max(peak.storageMB, record.usage.storageMB),
            cpuPercent: Math.max(peak.cpuPercent, record.usage.cpuPercent),
            bandwidthKBps: Math.max(peak.bandwidthKBps, record.usage.bandwidthKBps),
            connections: Math.max(peak.connections, record.usage.connections)
        }), {
            memoryMB: 0,
            storageMB: 0,
            cpuPercent: 0,
            bandwidthKBps: 0,
            connections: 0
        });
    }
}
exports.ResourceMonitor = ResourceMonitor;
