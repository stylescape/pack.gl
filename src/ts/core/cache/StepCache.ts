// ============================================================================
// Import
// ============================================================================

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { AbstractProcess } from "../abstract/AbstractProcess.js";
import { expandPatterns } from "./globExpand.js";

// ============================================================================
// Constants
// ============================================================================

/**
 * Bumped whenever the hash composition or the on-disk archive layout changes,
 * so an older cache can never produce a false hit after an upgrade.
 */
const CACHE_KEY_VERSION = 1;

// ============================================================================
// Types
// ============================================================================

/**
 * Everything that identifies one execution of a step. Any difference here
 * must produce a different hash, or the cache would skip work that should
 * have re-run.
 */
export interface StepHashInput {
    /** Registered name of the action the step runs. */
    actionName: string;

    /** The step's options block, as written in the configuration. */
    options: Record<string, unknown>;

    /** Declared input patterns, relative to the project root. */
    inputs: string[];

    /** Names of environment variables the step's result depends on. */
    env?: string[];
}

/**
 * A recorded step execution.
 */
interface StepCacheEntry {
    /** Console output captured while the step ran. */
    logs: string[];

    /** Archived output files, as paths relative to the project root. */
    outputs: string[];

    /** Timestamp the entry was written. */
    cachedAt: number;
}

/**
 * Options for the StepCache constructor.
 */
export interface StepCacheOptions {
    /** Directory to store the index and archived outputs. */
    cacheDir?: string;

    /** Entry time-to-live in milliseconds. */
    ttl?: number;

    /** Project root that relative patterns resolve against. */
    cwd?: string;
}

// ============================================================================
// Class
// ============================================================================

/**
 * StepCache skips steps whose inputs have not changed since a previous run.
 *
 * A step opts in by declaring `inputs` (and usually `outputs`) in the
 * configuration. Before executing, the pipeline asks for a hash covering the
 * action, its options, the contents of every input file, and the values of any
 * environment variables the step declares a dependency on. If an entry for
 * that hash exists, the step's archived outputs are restored and its captured
 * logs are replayed instead of running the action — so a cache hit is
 * indistinguishable from a real run apart from being faster.
 *
 * Steps that declare no inputs always run: guessing what a step reads would
 * silently skip work that should have happened.
 *
 * @example
 * ```yaml
 * - name: compile
 *   action: TypeScriptCompilerAction
 *   inputs: ["src/**\/*.ts", "tsconfig.json"]
 *   outputs: ["dist/js/**"]
 * ```
 */
export class StepCache extends AbstractProcess {
    // Parameters
    // ========================================================================

    /** Singleton instance. */
    private static instance: StepCache | null = null;

    /** Recorded executions, keyed by step hash. */
    private entries: Map<string, StepCacheEntry> = new Map();

    /** Directory holding the index and the archived outputs. */
    private cacheDir: string;

    /** Directory holding archived output files. */
    private outputsDir: string;

    /** Path to the on-disk index. */
    private indexPath: string;

    /** Entry time-to-live in milliseconds. */
    private ttl: number;

    /** Project root that relative patterns resolve against. */
    private cwd: string;

    /** Whether the index has been read from disk. */
    private initialized = false;

    /**
     * The in-flight load, so concurrent steps share one attempt.
     *
     * The flag alone was set before the read completed, so a step that asked
     * while the load was still running was told the cache was ready and read
     * an empty index — a spurious miss, and a rebuild of work that was
     * already cached.
     */
    private initializing: Promise<void> | null = null;

    /** Hit/miss counters for the end-of-run summary. */
    private stats = { hits: 0, misses: 0 };

    // Constructor
    // ========================================================================

    private constructor(options: StepCacheOptions = {}) {
        super();
        this.cwd = options.cwd || process.cwd();
        this.cacheDir = path.resolve(
            this.cwd,
            options.cacheDir || ".kist-cache",
        );
        this.outputsDir = path.join(this.cacheDir, "steps");
        this.indexPath = path.join(this.cacheDir, "step-cache.json");
        this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    // Static Methods
    // ========================================================================

    /**
     * Gets the singleton instance.
     *
     * @param options - Configuration, honoured only on the first call.
     * @returns The shared StepCache.
     */
    public static getInstance(options?: StepCacheOptions): StepCache {
        if (!StepCache.instance) {
            StepCache.instance = new StepCache(options);
        }
        return StepCache.instance;
    }

    /**
     * Drops the singleton. Used by tests and by the live-reload restart path.
     */
    public static resetInstance(): void {
        StepCache.instance = null;
    }

    // Public Methods
    // ========================================================================

    /**
     * Loads the index from disk. Idempotent.
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;
        if (this.initializing) return this.initializing;

        this.initializing = (async (): Promise<void> => {
            try {
                const raw = await fs.promises.readFile(
                    this.indexPath,
                    "utf-8",
                );
                const parsed = JSON.parse(raw) as Record<
                    string,
                    StepCacheEntry
                >;
                const now = Date.now();
                for (const [hash, entry] of Object.entries(parsed)) {
                    // Drop expired entries at load time rather than carrying
                    // them forward and re-checking on every lookup.
                    if (now - entry.cachedAt <= this.ttl) {
                        this.entries.set(hash, entry);
                    }
                }
                this.logDebug(
                    `StepCache loaded ${this.entries.size} entries.`,
                );
            } catch {
                // No index yet, or it is unreadable: carry on with whatever
                // is already in memory rather than discarding it.
            } finally {
                this.initialized = true;
                this.initializing = null;
            }
        })();

        return this.initializing;
    }

    /**
     * Computes the content hash identifying one execution of a step.
     *
     * @param input - The step's identifying material.
     * @returns A hex SHA-256 digest.
     */
    public computeHash(input: StepHashInput): string {
        const hash = crypto.createHash("sha256");

        hash.update(`kist-step-cache:v${CACHE_KEY_VERSION}\n`);
        hash.update(`action:${input.actionName}\n`);
        hash.update(`options:${stableStringify(input.options)}\n`);

        // The Node major version is part of the key because a step's output
        // can legitimately differ across runtimes.
        hash.update(`node:${process.version.split(".")[0]}\n`);

        for (const name of [...(input.env ?? [])].sort()) {
            hash.update(`env:${name}=${process.env[name] ?? ""}\n`);
        }

        for (const file of expandPatterns(input.inputs, this.cwd)) {
            const relative = path.relative(this.cwd, file);
            hash.update(`file:${relative}:${this.hashFileSync(file)}\n`);
        }

        return hash.digest("hex");
    }

    /**
     * Attempts to satisfy a step from the cache.
     *
     * On a hit the archived outputs are written back to the working tree and
     * the captured logs are replayed, so the caller can skip execution.
     *
     * @param hash - The step hash from {@link computeHash}.
     * @returns True when the step was served from cache.
     */
    public async restore(hash: string): Promise<boolean> {
        await this.initialize();

        const entry = this.entries.get(hash);
        if (!entry) {
            this.stats.misses++;
            return false;
        }

        try {
            for (const relative of entry.outputs) {
                const archived = path.join(this.outputsDir, hash, relative);
                const destination = path.resolve(this.cwd, relative);
                await fs.promises.mkdir(path.dirname(destination), {
                    recursive: true,
                });
                await fs.promises.copyFile(archived, destination);
            }
        } catch (error) {
            // A damaged or partially deleted archive must not fail the build;
            // fall back to executing the step and re-recording it.
            this.logWarn(
                `Cached outputs for ${hash.slice(0, 8)} could not be restored, re-running step: ${error}`,
            );
            this.entries.delete(hash);
            this.stats.misses++;
            return false;
        }

        this.logger.replay(entry.logs);
        this.stats.hits++;
        return true;
    }

    /**
     * Records the result of a step that just executed.
     *
     * @param hash - The step hash from {@link computeHash}.
     * @param logs - Console output captured during execution.
     * @param outputPatterns - The step's declared output patterns.
     */
    public async record(
        hash: string,
        logs: string[],
        outputPatterns: string[],
    ): Promise<void> {
        await this.initialize();

        const archived: string[] = [];

        try {
            for (const file of expandPatterns(outputPatterns, this.cwd)) {
                const relative = path.relative(this.cwd, file);
                if (relative.startsWith("..") || path.isAbsolute(relative)) {
                    // Refuse to archive anything outside the project root:
                    // restoring it later would write outside the workspace.
                    this.logWarn(
                        `Skipping output outside the project root: ${file}`,
                    );
                    continue;
                }
                const destination = path.join(this.outputsDir, hash, relative);
                await fs.promises.mkdir(path.dirname(destination), {
                    recursive: true,
                });
                await fs.promises.copyFile(file, destination);
                archived.push(relative);
            }
        } catch (error) {
            // Failing to archive is not a build failure; it only means the
            // next run will not get a hit.
            this.logWarn(`Failed to archive step outputs: ${error}`);
            return;
        }

        this.entries.set(hash, {
            logs,
            outputs: archived,
            cachedAt: Date.now(),
        });
    }

    /**
     * Persists the index to disk.
     */
    public async save(): Promise<void> {
        if (!this.initialized) return;

        try {
            await fs.promises.mkdir(this.cacheDir, { recursive: true });
            await fs.promises.writeFile(
                this.indexPath,
                JSON.stringify(Object.fromEntries(this.entries), null, 2),
                "utf-8",
            );
            this.logDebug(`StepCache saved ${this.entries.size} entries.`);
        } catch (error) {
            this.logWarn(`Failed to save step cache: ${error}`);
        }
    }

    /**
     * Removes every recorded entry and its archived outputs.
     */
    public async clear(): Promise<void> {
        this.entries.clear();
        this.stats = { hits: 0, misses: 0 };
        try {
            await fs.promises.rm(this.outputsDir, {
                recursive: true,
                force: true,
            });
            await fs.promises.rm(this.indexPath, { force: true });
        } catch (error) {
            this.logWarn(`Failed to clear step cache: ${error}`);
        }
    }

    /**
     * Zeroes the hit/miss counters.
     *
     * Called at the start of each pipeline run so the end-of-run summary
     * describes that run. The cache itself is a long-lived singleton and
     * survives live-reload restarts, so without this the counters would
     * accumulate and every rebuild would report a blend of its own result and
     * every previous one.
     */
    public resetStats(): void {
        this.stats = { hits: 0, misses: 0 };
    }

    /**
     * Gets hit/miss statistics for the current run.
     *
     * @returns Counters plus a formatted hit rate.
     */
    public getStats(): {
        hits: number;
        misses: number;
        size: number;
        hitRate: string;
    } {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            size: this.entries.size,
            hitRate:
                total > 0
                    ? `${((this.stats.hits / total) * 100).toFixed(2)}%`
                    : "N/A",
        };
    }

    // Private Methods
    // ========================================================================

    /**
     * Hashes a file's contents, falling back to a sentinel when it cannot be
     * read so the hash stays stable rather than throwing mid-build.
     *
     * @param filePath - Absolute path to hash.
     * @returns A hex digest, or "unreadable".
     */
    private hashFileSync(filePath: string): string {
        try {
            return crypto
                .createHash("sha256")
                .update(fs.readFileSync(filePath))
                .digest("hex");
        } catch {
            return "unreadable";
        }
    }
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Serialises a value with object keys sorted at every level, so two
 * equivalent options blocks that differ only in key order hash identically.
 *
 * @param value - Any JSON-serialisable value.
 * @returns A stable JSON string.
 */
export function stableStringify(value: unknown): string {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value) ?? "null";
    }

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(",")}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        // Object keys are unique, so the equal case cannot arise.
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(
            ([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`,
        );

    return `{${entries.join(",")}}`;
}
