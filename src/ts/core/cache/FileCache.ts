// ============================================================================
// Import
// ============================================================================

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { AbstractProcess } from "../abstract/AbstractProcess";

// ============================================================================
// Types
// ============================================================================

/**
 * Metadata for a cached file entry.
 */
interface CacheEntry {
    /** SHA-256 hash of the file content */
    hash: string;
    /** File modification time in milliseconds */
    mtime: number;
    /** File size in bytes */
    size: number;
    /** Timestamp when the entry was cached */
    cachedAt: number;
}

/**
 * Options for the FileCache constructor.
 */
interface FileCacheOptions {
    /** Directory to store cache metadata */
    cacheDir?: string;
    /** Maximum cache entries before cleanup */
    maxEntries?: number;
    /** Cache time-to-live in milliseconds (default: 24 hours) */
    ttl?: number;
}

// ============================================================================
// Class
// ============================================================================

/**
 * FileCache provides a caching mechanism for file content based on checksums.
 * This allows skipping unchanged files during build processes, significantly
 * improving performance for incremental builds.
 *
 * @example
 * ```typescript
 * const cache = FileCache.getInstance();
 *
 * // Check if a file has changed
 * if (await cache.hasFileChanged('/path/to/file.ts')) {
 *   // Process the file
 *   await processFile('/path/to/file.ts');
 *   // Update the cache
 *   await cache.updateFileEntry('/path/to/file.ts');
 * }
 * ```
 */
export class FileCache extends AbstractProcess {
    // Parameters
    // ========================================================================

    /** Singleton instance */
    private static instance: FileCache;

    /** In-memory cache of file entries */
    private cache: Map<string, CacheEntry> = new Map();

    /** Directory for persisting cache to disk */
    private cacheDir: string;

    /** Maximum number of cache entries */
    private maxEntries: number;

    /** Time-to-live for cache entries in milliseconds */
    private ttl: number;

    /** Path to the cache index file */
    private cacheIndexPath: string;

    /** Flag indicating if cache has been loaded from disk */
    private initialized: boolean = false;

    /** Statistics for cache performance */
    private stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
    };

    // Constructor
    // ========================================================================

    /**
     * Private constructor for singleton pattern.
     * @param options - Configuration options for the cache
     */
    private constructor(options: FileCacheOptions = {}) {
        super();
        this.cacheDir = options.cacheDir || path.join(process.cwd(), ".kist-cache");
        this.maxEntries = options.maxEntries || 10000;
        this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
        this.cacheIndexPath = path.join(this.cacheDir, "file-cache.json");
    }

    // Static Methods
    // ========================================================================

    /**
     * Gets the singleton instance of FileCache.
     * @param options - Configuration options (only used on first call)
     * @returns The FileCache singleton instance
     */
    public static getInstance(options?: FileCacheOptions): FileCache {
        if (!FileCache.instance) {
            FileCache.instance = new FileCache(options);
        }
        return FileCache.instance;
    }

    /**
     * Resets the singleton instance (useful for testing).
     */
    public static resetInstance(): void {
        FileCache.instance = undefined as any;
    }

    // Public Methods
    // ========================================================================

    /**
     * Initializes the cache by loading persisted data from disk.
     * This method is idempotent - calling it multiple times has no effect.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await this.ensureCacheDirectory();
            await this.loadCacheFromDisk();
            this.initialized = true;
            this.logDebug(`FileCache initialized with ${this.cache.size} entries.`);
        } catch (error) {
            this.logWarn(`Failed to initialize file cache, starting fresh: ${error}`);
            this.cache.clear();
            this.initialized = true;
        }
    }

    /**
     * Checks if a file has changed since it was last cached.
     *
     * @param filePath - Absolute path to the file
     * @returns true if the file has changed or is not in cache, false otherwise
     */
    public async hasFileChanged(filePath: string): Promise<boolean> {
        await this.initialize();

        const normalizedPath = this.normalizePath(filePath);
        const entry = this.cache.get(normalizedPath);

        if (!entry) {
            this.stats.misses++;
            return true;
        }

        // Check if entry has expired
        if (Date.now() - entry.cachedAt > this.ttl) {
            this.cache.delete(normalizedPath);
            this.stats.misses++;
            return true;
        }

        try {
            const stat = await fs.promises.stat(filePath);

            // Quick check using mtime and size (avoid hash computation)
            if (stat.mtimeMs === entry.mtime && stat.size === entry.size) {
                this.stats.hits++;
                return false;
            }

            // If mtime differs, compute hash to confirm change
            const currentHash = await this.computeFileHash(filePath);
            if (currentHash === entry.hash) {
                // File metadata changed but content is the same - update entry
                entry.mtime = stat.mtimeMs;
                this.stats.hits++;
                return false;
            }

            this.stats.misses++;
            return true;
        } catch {
            // File doesn't exist or is inaccessible
            this.cache.delete(normalizedPath);
            this.stats.misses++;
            return true;
        }
    }

    /**
     * Updates the cache entry for a file after processing.
     *
     * @param filePath - Absolute path to the file
     */
    public async updateFileEntry(filePath: string): Promise<void> {
        await this.initialize();

        const normalizedPath = this.normalizePath(filePath);

        try {
            const stat = await fs.promises.stat(filePath);
            const hash = await this.computeFileHash(filePath);

            this.cache.set(normalizedPath, {
                hash,
                mtime: stat.mtimeMs,
                size: stat.size,
                cachedAt: Date.now(),
            });

            // Cleanup if cache is too large
            if (this.cache.size > this.maxEntries) {
                await this.evictOldEntries();
            }
        } catch (error) {
            this.logWarn(`Failed to update cache entry for ${filePath}: ${error}`);
        }
    }

    /**
     * Batch check for multiple files.
     * Returns an array of files that have changed.
     *
     * @param filePaths - Array of file paths to check
     * @returns Array of file paths that have changed
     */
    public async getChangedFiles(filePaths: string[]): Promise<string[]> {
        const results = await Promise.all(
            filePaths.map(async (filePath) => ({
                filePath,
                changed: await this.hasFileChanged(filePath),
            }))
        );

        return results
            .filter((r) => r.changed)
            .map((r) => r.filePath);
    }

    /**
     * Batch update cache entries for multiple files.
     *
     * @param filePaths - Array of file paths to update
     */
    public async updateFileEntries(filePaths: string[]): Promise<void> {
        await Promise.all(filePaths.map((fp) => this.updateFileEntry(fp)));
    }

    /**
     * Invalidates (removes) a file from the cache.
     *
     * @param filePath - Path to the file to invalidate
     */
    public invalidate(filePath: string): void {
        const normalizedPath = this.normalizePath(filePath);
        this.cache.delete(normalizedPath);
    }

    /**
     * Invalidates all files matching a glob pattern.
     *
     * @param pattern - Glob pattern or substring to match
     */
    public invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clears the entire cache.
     */
    public clear(): void {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, evictions: 0 };
        this.logInfo("FileCache cleared.");
    }

    /**
     * Persists the cache to disk.
     */
    public async save(): Promise<void> {
        try {
            await this.ensureCacheDirectory();
            const data = JSON.stringify(
                Object.fromEntries(this.cache),
                null,
                2
            );
            await fs.promises.writeFile(this.cacheIndexPath, data, "utf-8");
            this.logDebug(`FileCache saved with ${this.cache.size} entries.`);
        } catch (error) {
            this.logWarn(`Failed to save file cache to disk: ${error}`);
        }
    }

    /**
     * Gets cache statistics.
     *
     * @returns Cache performance statistics
     */
    public getStats(): { hits: number; misses: number; evictions: number; size: number; hitRate: string } {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + "%" : "N/A";
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate,
        };
    }

    // Private Methods
    // ========================================================================

    /**
     * Normalizes a file path for consistent cache key lookup.
     */
    private normalizePath(filePath: string): string {
        return path.resolve(filePath);
    }

    /**
     * Computes SHA-256 hash of a file's content.
     */
    private async computeFileHash(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash("sha256");
            const stream = fs.createReadStream(filePath);

            stream.on("data", (chunk) => hash.update(chunk));
            stream.on("end", () => resolve(hash.digest("hex")));
            stream.on("error", reject);
        });
    }

    /**
     * Ensures the cache directory exists.
     */
    private async ensureCacheDirectory(): Promise<void> {
        try {
            await fs.promises.mkdir(this.cacheDir, { recursive: true });
        } catch {
            // Directory already exists or cannot be created
        }
    }

    /**
     * Loads cache data from disk.
     */
    private async loadCacheFromDisk(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.cacheIndexPath, "utf-8");
            const parsed = JSON.parse(data) as Record<string, CacheEntry>;
            this.cache = new Map(Object.entries(parsed));
        } catch {
            // File doesn't exist or is invalid - start with empty cache
            this.cache = new Map();
        }
    }

    /**
     * Evicts old entries when cache exceeds maximum size.
     * Uses Least Recently Cached (LRC) eviction policy.
     */
    private async evictOldEntries(): Promise<void> {
        const entriesToEvict = Math.floor(this.maxEntries * 0.1); // Evict 10%
        const entries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.cachedAt - b.cachedAt);

        for (let i = 0; i < entriesToEvict && i < entries.length; i++) {
            this.cache.delete(entries[i][0]);
            this.stats.evictions++;
        }

        this.logDebug(`Evicted ${entriesToEvict} old cache entries.`);
    }
}
