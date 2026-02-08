// ============================================================================
// Import
// ============================================================================

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { AbstractProcess } from "../abstract/AbstractProcess";
import { FileCache } from "./FileCache";

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a cached build result.
 */
interface BuildCacheEntry {
    /** Hash of input files combined */
    inputHash: string;
    /** Paths to output files */
    outputFiles: string[];
    /** Build configuration hash */
    configHash: string;
    /** Timestamp when the entry was created */
    createdAt: number;
    /** Build duration in milliseconds */
    buildDuration?: number;
}

/**
 * Options for the BuildCache constructor.
 */
interface BuildCacheOptions {
    /** Directory to store cached build artifacts */
    cacheDir?: string;
    /** Maximum cache size in bytes (default: 1GB) */
    maxCacheSize?: number;
    /** Cache time-to-live in milliseconds (default: 7 days) */
    ttl?: number;
}

/**
 * Result from a cache lookup.
 */
interface CacheLookupResult {
    /** Whether a valid cache entry was found */
    found: boolean;
    /** Cached output files if found */
    outputFiles?: string[];
    /** Whether cache was restored from artifacts */
    restored?: boolean;
}

// ============================================================================
// Class
// ============================================================================

/**
 * BuildCache provides a mechanism for caching build outputs based on input
 * file hashes. This enables incremental builds by skipping steps whose inputs
 * haven't changed.
 *
 * @example
 * ```typescript
 * const buildCache = BuildCache.getInstance();
 *
 * // Check for cached output
 * const cacheResult = await buildCache.lookup('typescript', inputFiles, config);
 * if (cacheResult.found) {
 *   console.log('Using cached build output');
 *   return cacheResult.outputFiles;
 * }
 *
 * // Build and cache the result
 * const outputFiles = await compile(inputFiles);
 * await buildCache.store('typescript', inputFiles, outputFiles, config);
 * ```
 */
export class BuildCache extends AbstractProcess {
    // Parameters
    // ========================================================================

    /** Singleton instance */
    private static instance: BuildCache;

    /** In-memory cache index */
    private cacheIndex: Map<string, BuildCacheEntry> = new Map();

    /** Directory for storing cached artifacts */
    private cacheDir: string;

    /** Maximum cache size in bytes */
    private maxCacheSize: number;

    /** Time-to-live in milliseconds */
    private ttl: number;

    /** Path to the cache index file */
    private indexPath: string;

    /** Flag indicating initialization status */
    private initialized: boolean = false;

    /** Reference to FileCache for input hashing */
    private fileCache: FileCache;

    /** Statistics */
    private stats = {
        hits: 0,
        misses: 0,
        stored: 0,
        restored: 0,
        evicted: 0,
    };

    // Constructor
    // ========================================================================

    /**
     * Private constructor for singleton pattern.
     */
    private constructor(options: BuildCacheOptions = {}) {
        super();
        this.cacheDir = options.cacheDir || path.join(process.cwd(), ".kist-cache", "build");
        this.maxCacheSize = options.maxCacheSize || 1024 * 1024 * 1024; // 1GB
        this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 days
        this.indexPath = path.join(this.cacheDir, "build-index.json");
        this.fileCache = FileCache.getInstance();
    }

    // Static Methods
    // ========================================================================

    /**
     * Gets the singleton instance of BuildCache.
     */
    public static getInstance(options?: BuildCacheOptions): BuildCache {
        if (!BuildCache.instance) {
            BuildCache.instance = new BuildCache(options);
        }
        return BuildCache.instance;
    }

    /**
     * Resets the singleton instance (useful for testing).
     */
    public static resetInstance(): void {
        BuildCache.instance = undefined as any;
    }

    // Public Methods
    // ========================================================================

    /**
     * Initializes the build cache.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await fs.promises.mkdir(this.cacheDir, { recursive: true });
            await this.loadIndex();
            await this.fileCache.initialize();
            this.initialized = true;
            this.logDebug(`BuildCache initialized with ${this.cacheIndex.size} entries.`);
        } catch (error) {
            this.logWarn(`Failed to initialize build cache: ${error}`);
            this.cacheIndex.clear();
            this.initialized = true;
        }
    }

    /**
     * Looks up a cached build result.
     *
     * @param actionName - Name of the action (e.g., 'typescript', 'sass')
     * @param inputFiles - Array of input file paths
     * @param config - Build configuration object
     * @returns Cache lookup result
     */
    public async lookup(
        actionName: string,
        inputFiles: string[],
        config: Record<string, any> = {}
    ): Promise<CacheLookupResult> {
        await this.initialize();

        const cacheKey = await this.computeCacheKey(actionName, inputFiles, config);
        const entry = this.cacheIndex.get(cacheKey);

        if (!entry) {
            this.stats.misses++;
            return { found: false };
        }

        // Check TTL
        if (Date.now() - entry.createdAt > this.ttl) {
            this.cacheIndex.delete(cacheKey);
            this.stats.misses++;
            return { found: false };
        }

        // Verify input hash still matches (files haven't changed)
        const currentInputHash = await this.computeInputHash(inputFiles);
        if (currentInputHash !== entry.inputHash) {
            this.cacheIndex.delete(cacheKey);
            this.stats.misses++;
            return { found: false };
        }

        // Verify cached output files still exist
        const outputsExist = await this.verifyOutputFiles(entry.outputFiles);
        if (!outputsExist) {
            // Try to restore from cache artifacts
            const restored = await this.restoreFromArtifacts(cacheKey, entry);
            if (restored) {
                this.stats.restored++;
                this.stats.hits++;
                return { found: true, outputFiles: entry.outputFiles, restored: true };
            }
            this.cacheIndex.delete(cacheKey);
            this.stats.misses++;
            return { found: false };
        }

        this.stats.hits++;
        this.logDebug(`Cache hit for ${actionName}`);
        return { found: true, outputFiles: entry.outputFiles };
    }

    /**
     * Stores a build result in the cache.
     *
     * @param actionName - Name of the action
     * @param inputFiles - Array of input file paths
     * @param outputFiles - Array of output file paths
     * @param config - Build configuration object
     * @param buildDuration - Optional build duration in milliseconds
     */
    public async store(
        actionName: string,
        inputFiles: string[],
        outputFiles: string[],
        config: Record<string, any> = {},
        buildDuration?: number
    ): Promise<void> {
        await this.initialize();

        const cacheKey = await this.computeCacheKey(actionName, inputFiles, config);
        const inputHash = await this.computeInputHash(inputFiles);
        const configHash = this.computeConfigHash(config);

        const entry: BuildCacheEntry = {
            inputHash,
            outputFiles,
            configHash,
            createdAt: Date.now(),
            buildDuration,
        };

        // Store artifacts for future restoration
        await this.storeArtifacts(cacheKey, outputFiles);

        this.cacheIndex.set(cacheKey, entry);
        this.stats.stored++;

        // Update file cache for inputs
        await this.fileCache.updateFileEntries(inputFiles);

        // Cleanup if needed
        await this.cleanupIfNeeded();

        this.logDebug(`Stored cache entry for ${actionName}`);
    }

    /**
     * Invalidates cache entries for a specific action.
     */
    public invalidateAction(actionName: string): void {
        for (const [key] of this.cacheIndex) {
            if (key.startsWith(`${actionName}:`)) {
                this.cacheIndex.delete(key);
            }
        }
    }

    /**
     * Clears the entire build cache.
     */
    public async clear(): Promise<void> {
        this.cacheIndex.clear();
        this.stats = { hits: 0, misses: 0, stored: 0, restored: 0, evicted: 0 };

        try {
            await fs.promises.rm(this.cacheDir, { recursive: true, force: true });
            await fs.promises.mkdir(this.cacheDir, { recursive: true });
        } catch {
            // Ignore cleanup errors
        }

        this.logInfo("BuildCache cleared.");
    }

    /**
     * Saves the cache index to disk.
     */
    public async save(): Promise<void> {
        try {
            const data = JSON.stringify(Object.fromEntries(this.cacheIndex), null, 2);
            await fs.promises.writeFile(this.indexPath, data, "utf-8");
            this.logDebug("BuildCache index saved.");
        } catch (error) {
            this.logWarn(`Failed to save build cache index: ${error}`);
        }
    }

    /**
     * Gets cache statistics.
     */
    public getStats(): typeof this.stats & { size: number; hitRate: string } {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + "%" : "N/A";
        return {
            ...this.stats,
            size: this.cacheIndex.size,
            hitRate,
        };
    }

    // Private Methods
    // ========================================================================

    /**
     * Computes a unique cache key for a build.
     */
    private async computeCacheKey(
        actionName: string,
        inputFiles: string[],
        config: Record<string, any>
    ): Promise<string> {
        const sortedFiles = [...inputFiles].sort().join("|");
        const configStr = JSON.stringify(config);
        const data = `${actionName}:${sortedFiles}:${configStr}`;
        return `${actionName}:${crypto.createHash("md5").update(data).digest("hex")}`;
    }

    /**
     * Computes a combined hash of all input files.
     */
    private async computeInputHash(inputFiles: string[]): Promise<string> {
        const hashes: string[] = [];

        for (const file of inputFiles.sort()) {
            try {
                const content = await fs.promises.readFile(file);
                hashes.push(crypto.createHash("sha256").update(content).digest("hex"));
            } catch {
                hashes.push("missing");
            }
        }

        return crypto.createHash("sha256").update(hashes.join(":")).digest("hex");
    }

    /**
     * Computes a hash of the configuration object.
     */
    private computeConfigHash(config: Record<string, any>): string {
        return crypto.createHash("md5").update(JSON.stringify(config)).digest("hex");
    }

    /**
     * Verifies that all output files exist.
     */
    private async verifyOutputFiles(outputFiles: string[]): Promise<boolean> {
        for (const file of outputFiles) {
            try {
                await fs.promises.access(file, fs.constants.R_OK);
            } catch {
                return false;
            }
        }
        return true;
    }

    /**
     * Stores output files as cached artifacts.
     */
    private async storeArtifacts(cacheKey: string, outputFiles: string[]): Promise<void> {
        const artifactDir = path.join(this.cacheDir, "artifacts", cacheKey);

        try {
            await fs.promises.mkdir(artifactDir, { recursive: true });

            for (const file of outputFiles) {
                const artifactPath = path.join(artifactDir, path.basename(file));
                await fs.promises.copyFile(file, artifactPath);
            }
        } catch (error) {
            this.logWarn(`Failed to store artifacts for ${cacheKey}: ${error}`);
        }
    }

    /**
     * Restores output files from cached artifacts.
     */
    private async restoreFromArtifacts(
        cacheKey: string,
        entry: BuildCacheEntry
    ): Promise<boolean> {
        const artifactDir = path.join(this.cacheDir, "artifacts", cacheKey);

        try {
            for (const outputFile of entry.outputFiles) {
                const artifactPath = path.join(artifactDir, path.basename(outputFile));
                const outputDir = path.dirname(outputFile);

                await fs.promises.mkdir(outputDir, { recursive: true });
                await fs.promises.copyFile(artifactPath, outputFile);
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Loads the cache index from disk.
     */
    private async loadIndex(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.indexPath, "utf-8");
            const parsed = JSON.parse(data) as Record<string, BuildCacheEntry>;
            this.cacheIndex = new Map(Object.entries(parsed));
        } catch {
            this.cacheIndex = new Map();
        }
    }

    /**
     * Cleans up old cache entries if cache exceeds size limits.
     */
    private async cleanupIfNeeded(): Promise<void> {
        // Simple size-based cleanup - evict oldest 20% when over limit
        const artifactsPath = path.join(this.cacheDir, "artifacts");

        try {
            const size = await this.getDirectorySize(artifactsPath);
            if (size > this.maxCacheSize) {
                const entries = Array.from(this.cacheIndex.entries())
                    .sort(([, a], [, b]) => a.createdAt - b.createdAt);

                const toEvict = Math.ceil(entries.length * 0.2);
                for (let i = 0; i < toEvict; i++) {
                    const [key] = entries[i];
                    await this.evictEntry(key);
                    this.stats.evicted++;
                }
            }
        } catch {
            // Ignore cleanup errors
        }
    }

    /**
     * Evicts a single cache entry.
     */
    private async evictEntry(cacheKey: string): Promise<void> {
        this.cacheIndex.delete(cacheKey);
        const artifactDir = path.join(this.cacheDir, "artifacts", cacheKey);

        try {
            await fs.promises.rm(artifactDir, { recursive: true, force: true });
        } catch {
            // Ignore deletion errors
        }
    }

    /**
     * Gets the total size of a directory in bytes.
     */
    private async getDirectorySize(dirPath: string): Promise<number> {
        let totalSize = 0;

        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    totalSize += await this.getDirectorySize(fullPath);
                } else {
                    const stat = await fs.promises.stat(fullPath);
                    totalSize += stat.size;
                }
            }
        } catch {
            // Directory doesn't exist
        }

        return totalSize;
    }
}
