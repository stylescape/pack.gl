// ============================================================================
// FileCache Tests
// ============================================================================

import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { FileCache } from "../src/ts/core/cache/FileCache";
import { silenceConsole, spyOutput } from "./helpers/silence";

/** Minimal view of FileCache internals used for white-box fault injection. */
interface FileCacheInternals {
    cache: Map<string, unknown>;
    initialized: boolean;
    loadCacheFromDisk: () => Promise<void>;
}

const internals = (cache: FileCache): FileCacheInternals =>
    cache as unknown as FileCacheInternals;

describe("FileCache", () => {
    const spies = silenceConsole();
    let root: string;
    let cacheDir: string;

    beforeEach(() => {
        FileCache.resetInstance();
        root = mkdtempSync(join(tmpdir(), "kist-filecache-"));
        cacheDir = join(root, "cache");
    });

    afterEach(() => {
        FileCache.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    /** Creates a file with the given content and returns its path. */
    function makeFile(name: string, content: string): string {
        const filePath = join(root, name);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, content, "utf-8");
        return filePath;
    }

    // ------------------------------------------------------------------------
    // Singleton
    // ------------------------------------------------------------------------

    describe("getInstance", () => {
        it("should return the same instance on repeated calls", () => {
            expect(FileCache.getInstance({ cacheDir })).toBe(
                FileCache.getInstance(),
            );
        });

        it("should ignore options passed after the instance exists", async () => {
            const first = FileCache.getInstance({ cacheDir });
            const second = FileCache.getInstance({ cacheDir: "/nonexistent" });
            expect(second).toBe(first);
        });

        it("should fall back to defaults when constructed without options", () => {
            const cache = FileCache.getInstance();
            expect(cache.getStats()).toEqual({
                hits: 0,
                misses: 0,
                evictions: 0,
                size: 0,
                hitRate: "N/A",
            });
        });

        it("should create a fresh instance after resetInstance", () => {
            const first = FileCache.getInstance({ cacheDir });
            FileCache.resetInstance();
            expect(FileCache.getInstance({ cacheDir })).not.toBe(first);
        });
    });

    // ------------------------------------------------------------------------
    // Initialization
    // ------------------------------------------------------------------------

    describe("initialize", () => {
        it("should create the cache directory and start empty", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            await cache.initialize();
            expect(cache.getStats().size).toBe(0);
            expect(spyOutput(spies.log())).toContain(
                "FileCache initialized with 0 entries",
            );
        });

        it("should be idempotent", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            await cache.initialize();
            spies.log().mockClear();
            await cache.initialize();
            expect(spyOutput(spies.log())).not.toContain(
                "FileCache initialized",
            );
        });

        it("should restore entries persisted by a previous run", async () => {
            const file = makeFile("a.txt", "hello");
            const first = FileCache.getInstance({ cacheDir });
            await first.updateFileEntry(file);
            await first.save();

            FileCache.resetInstance();
            const second = FileCache.getInstance({ cacheDir });
            await second.initialize();
            expect(second.getStats().size).toBe(1);
            expect(await second.hasFileChanged(file)).toBe(false);
        });

        it("should start empty when the persisted index is unreadable", async () => {
            mkdirSync(cacheDir, { recursive: true });
            writeFileSync(
                join(cacheDir, "file-cache.json"),
                "{ broken",
                "utf-8",
            );

            const cache = FileCache.getInstance({ cacheDir });
            await cache.initialize();
            expect(cache.getStats().size).toBe(0);
        });

        it("should recover and start fresh when loading throws unexpectedly", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            // The disk loader swallows its own IO errors, so the outer
            // safety net is reachable only by injecting an unexpected fault.
            internals(cache).loadCacheFromDisk = () =>
                Promise.reject(new Error("catastrophic"));

            await cache.initialize();

            expect(spyOutput(spies.warn())).toContain(
                "Failed to initialize file cache, starting fresh",
            );
            expect(cache.getStats().size).toBe(0);
            expect(internals(cache).initialized).toBe(true);
        });
    });

    // ------------------------------------------------------------------------
    // Change detection
    // ------------------------------------------------------------------------

    describe("hasFileChanged", () => {
        it("should report an uncached file as changed", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            expect(await cache.hasFileChanged(file)).toBe(true);
            expect(cache.getStats().misses).toBe(1);
        });

        it("should report an unchanged cached file as unchanged", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);
            expect(await cache.hasFileChanged(file)).toBe(false);
            expect(cache.getStats().hits).toBe(1);
        });

        it("should report a modified file as changed", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);

            writeFileSync(file, "goodbye world", "utf-8");
            expect(await cache.hasFileChanged(file)).toBe(true);
        });

        it("should treat a touched file with identical content as unchanged", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);

            // Same bytes, different mtime: the hash check must win.
            const future = new Date(Date.now() + 60_000);
            utimesSync(file, future, future);

            expect(await cache.hasFileChanged(file)).toBe(false);
            expect(cache.getStats().hits).toBe(1);
        });

        it("should report a deleted file as changed and drop its entry", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);

            rmSync(file);
            expect(await cache.hasFileChanged(file)).toBe(true);
            expect(cache.getStats().size).toBe(0);
        });

        it("should expire entries past their TTL", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir, ttl: 1 });
            await cache.updateFileEntry(file);

            jest.spyOn(Date, "now").mockReturnValue(Date.now() + 10_000);
            expect(await cache.hasFileChanged(file)).toBe(true);
            expect(cache.getStats().size).toBe(0);
        });
    });

    describe("updateFileEntry", () => {
        it("should record hash, size and mtime", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);
            expect(cache.getStats().size).toBe(1);
        });

        it("should warn and keep going when the file is missing", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(join(root, "ghost.txt"));
            expect(spyOutput(spies.warn())).toContain(
                "Failed to update cache entry",
            );
            expect(cache.getStats().size).toBe(0);
        });

        it("should evict the oldest entries once maxEntries is exceeded", async () => {
            const cache = FileCache.getInstance({ cacheDir, maxEntries: 10 });
            const files = Array.from({ length: 11 }, (_, i) =>
                makeFile(`f${i}.txt`, `content ${i}`),
            );

            for (const file of files) {
                await cache.updateFileEntry(file);
            }

            const stats = cache.getStats();
            expect(stats.evictions).toBe(1);
            expect(stats.size).toBe(10);
            expect(spyOutput(spies.log())).toContain(
                "Evicted 1 old cache entries",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Batch operations
    // ------------------------------------------------------------------------

    describe("getChangedFiles", () => {
        it("should return only the files that changed", async () => {
            const stable = makeFile("stable.txt", "same");
            const modified = makeFile("modified.txt", "before");
            const cache = FileCache.getInstance({ cacheDir });

            await cache.updateFileEntries([stable, modified]);
            writeFileSync(modified, "after", "utf-8");

            expect(await cache.getChangedFiles([stable, modified])).toEqual([
                modified,
            ]);
        });
    });

    // ------------------------------------------------------------------------
    // Invalidation
    // ------------------------------------------------------------------------

    describe("invalidate", () => {
        it("should remove a single entry", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);

            cache.invalidate(file);
            expect(cache.getStats().size).toBe(0);
        });
    });

    describe("invalidatePattern", () => {
        it("should remove every entry matching the pattern", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            const ts = makeFile("src/a.ts", "a");
            const css = makeFile("src/b.css", "b");
            await cache.updateFileEntries([ts, css]);

            cache.invalidatePattern("*.ts");

            expect(cache.getStats().size).toBe(1);
            expect(await cache.hasFileChanged(css)).toBe(false);
        });

        it("should leave non-matching entries untouched", async () => {
            const cache = FileCache.getInstance({ cacheDir });
            const file = makeFile("src/a.ts", "a");
            await cache.updateFileEntry(file);

            cache.invalidatePattern("*.scss");
            expect(cache.getStats().size).toBe(1);
        });
    });

    describe("clear", () => {
        it("should drop all entries and reset statistics", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);
            await cache.hasFileChanged(file);

            cache.clear();

            expect(cache.getStats()).toEqual({
                hits: 0,
                misses: 0,
                evictions: 0,
                size: 0,
                hitRate: "N/A",
            });
        });
    });

    // ------------------------------------------------------------------------
    // Persistence
    // ------------------------------------------------------------------------

    describe("save", () => {
        it("should persist the index to disk", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.updateFileEntry(file);
            await cache.save();
            expect(spyOutput(spies.log())).toContain(
                "FileCache saved with 1 entries",
            );
        });

        it("should warn instead of throwing when the index cannot be written", async () => {
            // A file where the cache directory should be makes both the
            // mkdir and the subsequent write fail.
            writeFileSync(cacheDir, "blocked", "utf-8");
            const cache = FileCache.getInstance({ cacheDir });
            await cache.save();
            expect(spyOutput(spies.warn())).toContain(
                "Failed to save file cache to disk",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Statistics
    // ------------------------------------------------------------------------

    describe("getStats", () => {
        it("should report N/A before any lookups", () => {
            expect(
                FileCache.getInstance({ cacheDir }).getStats().hitRate,
            ).toBe("N/A");
        });

        it("should compute the hit rate once lookups occur", async () => {
            const file = makeFile("a.txt", "hello");
            const cache = FileCache.getInstance({ cacheDir });

            await cache.hasFileChanged(file); // miss
            await cache.updateFileEntry(file);
            await cache.hasFileChanged(file); // hit

            expect(cache.getStats().hitRate).toBe("50.00%");
        });
    });
});
