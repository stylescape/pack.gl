// ============================================================================
// BuildCache Tests
// ============================================================================

import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { BuildCache } from "../src/ts/core/cache/BuildCache";
import { FileCache } from "../src/ts/core/cache/FileCache";
import { silenceConsole, spyOutput } from "./helpers/silence";

/** Minimal view of BuildCache internals used for white-box assertions. */
interface BuildCacheInternals {
    cacheIndex: Map<string, { createdAt: number; outputFiles: string[] }>;
    cacheDir: string;
}

const internals = (cache: BuildCache): BuildCacheInternals =>
    cache as unknown as BuildCacheInternals;

describe("BuildCache", () => {
    const spies = silenceConsole();
    let root: string;
    let cacheDir: string;

    beforeEach(() => {
        BuildCache.resetInstance();
        FileCache.resetInstance();
        root = mkdtempSync(join(tmpdir(), "kist-buildcache-"));
        cacheDir = join(root, "build-cache");
        FileCache.getInstance({ cacheDir: join(root, "file-cache") });
    });

    afterEach(() => {
        BuildCache.resetInstance();
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
            expect(BuildCache.getInstance({ cacheDir })).toBe(
                BuildCache.getInstance(),
            );
        });

        it("should fall back to defaults when constructed without options", () => {
            const cache = BuildCache.getInstance();
            expect(internals(cache).cacheDir).toContain(".kist-cache");
        });

        it("should create a fresh instance after resetInstance", () => {
            const first = BuildCache.getInstance({ cacheDir });
            BuildCache.resetInstance();
            expect(BuildCache.getInstance({ cacheDir })).not.toBe(first);
        });
    });

    // ------------------------------------------------------------------------
    // Initialization
    // ------------------------------------------------------------------------

    describe("initialize", () => {
        it("should create the cache directory and start empty", async () => {
            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();
            expect(existsSync(cacheDir)).toBe(true);
            expect(cache.getStats().size).toBe(0);
        });

        it("should share one load between concurrent callers", async () => {
            // Every cache operation awaits initialize, and they run in
            // parallel; without sharing, each re-read the index and replaced
            // the in-memory map on top of the others.
            const cache = BuildCache.getInstance({ cacheDir });

            await Promise.all([
                cache.initialize(),
                cache.initialize(),
                cache.initialize(),
            ]);

            expect(existsSync(cacheDir)).toBe(true);
        });

        it("should be idempotent", async () => {
            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();
            spies.log().mockClear();
            await cache.initialize();
            expect(spyOutput(spies.log())).not.toContain(
                "BuildCache initialized",
            );
        });

        it("should warn and start fresh when the cache directory is unusable", async () => {
            // A regular file where the directory should be: mkdir fails.
            writeFileSync(cacheDir, "blocked", "utf-8");

            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();

            expect(spyOutput(spies.warn())).toContain(
                "Failed to initialize build cache",
            );
            expect(cache.getStats().size).toBe(0);
        });

        it("should start empty when the persisted index is malformed", async () => {
            mkdirSync(cacheDir, { recursive: true });
            writeFileSync(join(cacheDir, "build-index.json"), "{ broken");

            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();
            expect(cache.getStats().size).toBe(0);
        });
    });

    // ------------------------------------------------------------------------
    // Store / lookup round trip
    // ------------------------------------------------------------------------

    describe("store and lookup", () => {
        it("should miss on an unknown key", async () => {
            const cache = BuildCache.getInstance({ cacheDir });
            const result = await cache.lookup("tsc", [makeFile("a.ts", "a")]);
            expect(result).toEqual({ found: false });
            expect(cache.getStats().misses).toBe(1);
        });

        it("should hit after storing a build result", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            const result = await cache.lookup("tsc", [input]);

            expect(result.found).toBe(true);
            expect(result.outputFiles).toEqual([output]);
            expect(cache.getStats().hits).toBe(1);
            expect(cache.getStats().stored).toBe(1);
        });

        it("should distinguish entries by configuration", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output], { minify: true });

            expect(
                (await cache.lookup("tsc", [input], { minify: true })).found,
            ).toBe(true);
            expect(
                (await cache.lookup("tsc", [input], { minify: false })).found,
            ).toBe(false);
        });

        it("should record the build duration when provided", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output], {}, 1234);
            await cache.save();

            const index = JSON.parse(
                readFileSync(join(cacheDir, "build-index.json"), "utf-8"),
            ) as Record<string, { buildDuration?: number }>;
            expect(Object.values(index)[0].buildDuration).toBe(1234);
        });

        it("should miss when an input file changes", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            writeFileSync(input, "different source", "utf-8");

            expect((await cache.lookup("tsc", [input])).found).toBe(false);
            expect(cache.getStats().size).toBe(0);
        });

        it("should hash missing inputs deterministically", async () => {
            const missing = join(root, "ghost.ts");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [missing], [output]);
            expect((await cache.lookup("tsc", [missing])).found).toBe(true);
        });

        it("should miss once the entry outlives its TTL", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir, ttl: 1 });

            await cache.store("tsc", [input], [output]);
            jest.spyOn(Date, "now").mockReturnValue(Date.now() + 10_000);

            expect((await cache.lookup("tsc", [input])).found).toBe(false);
            expect(cache.getStats().size).toBe(0);
        });
    });

    // ------------------------------------------------------------------------
    // Artifact restoration
    // ------------------------------------------------------------------------

    describe("artifact restoration", () => {
        it("should restore deleted outputs from stored artifacts", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            rmSync(output);

            const result = await cache.lookup("tsc", [input]);

            expect(result.found).toBe(true);
            expect(result.restored).toBe(true);
            expect(readFileSync(output, "utf-8")).toBe("compiled");
            expect(cache.getStats().restored).toBe(1);
        });

        it("should miss when outputs are gone and artifacts cannot be restored", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            rmSync(output);
            rmSync(join(cacheDir, "artifacts"), {
                recursive: true,
                force: true,
            });

            expect((await cache.lookup("tsc", [input])).found).toBe(false);
            expect(cache.getStats().size).toBe(0);
        });

        it("should keep same-named outputs from different directories apart", async () => {
            // Archiving by base name alone made `out/a/index.js` and
            // `out/b/index.js` share one artifact, so restoring wrote
            // whichever was copied last back to both places.
            const input = makeFile("a.ts", "source");
            const first = makeFile("out/a/index.js", "CONTENT-A");
            const second = makeFile("out/b/index.js", "CONTENT-B");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("bundle", [input], [first, second]);
            rmSync(first);
            rmSync(second);

            const result = await cache.lookup("bundle", [input]);

            expect(result.restored).toBe(true);
            expect(readFileSync(first, "utf-8")).toBe("CONTENT-A");
            expect(readFileSync(second, "utf-8")).toBe("CONTENT-B");
        });

        it("should warn instead of throwing when artifacts cannot be stored", async () => {
            const input = makeFile("a.ts", "source");
            const cache = BuildCache.getInstance({ cacheDir });

            // The output file does not exist, so the artifact copy fails.
            await cache.store("tsc", [input], [join(root, "out", "ghost.js")]);

            expect(spyOutput(spies.warn())).toContain(
                "Failed to store artifacts",
            );
            expect(cache.getStats().stored).toBe(1);
        });
    });

    // ------------------------------------------------------------------------
    // Eviction
    // ------------------------------------------------------------------------

    describe("cleanup", () => {
        it("should evict the oldest entries when the size limit is exceeded", async () => {
            const cache = BuildCache.getInstance({
                cacheDir,
                maxCacheSize: 1,
            });

            for (let i = 0; i < 5; i++) {
                const input = makeFile(`in${i}.ts`, `source ${i}`);
                const output = makeFile(`out/o${i}.js`, `compiled ${i}`);
                await cache.store(`action${i}`, [input], [output]);
            }

            expect(cache.getStats().evicted).toBeGreaterThan(0);
            expect(internals(cache).cacheIndex.size).toBeLessThan(5);
        });

        it("should evict oldest-first when several entries are present", async () => {
            // Each artifact is exactly 10 bytes, so the 25-byte ceiling is
            // first crossed on the third store — with three entries in the
            // index, which is what exercises the oldest-first ordering.
            const cache = BuildCache.getInstance({
                cacheDir,
                maxCacheSize: 25,
            });
            const keys = ["first", "second", "third"];

            for (let i = 0; i < keys.length; i++) {
                const input = makeFile(`in${i}.ts`, `source ${i}`);
                const output = makeFile(`out/o${i}.js`, "0123456789");
                await cache.store(keys[i], [input], [output]);
            }

            expect(cache.getStats().evicted).toBe(1);
            const remaining = Array.from(
                internals(cache).cacheIndex.keys(),
            ).map((key) => key.split(":")[0]);
            expect(remaining).toEqual(["second", "third"]);
        });

        it("should not evict while under the size limit", async () => {
            const cache = BuildCache.getInstance({
                cacheDir,
                maxCacheSize: 10 * 1024 * 1024,
            });
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");

            await cache.store("tsc", [input], [output]);
            expect(cache.getStats().evicted).toBe(0);
        });
    });

    describe("input handling", () => {
        it("should not reorder the caller's list of inputs", async () => {
            // `Array.prototype.sort` sorts in place, so hashing used to
            // rearrange the caller's array — which matters to any action
            // whose output depends on the order of its inputs.
            const later = makeFile("z.ts", "z");
            const earlier = makeFile("a.ts", "a");
            const inputs = [later, earlier];
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("concat", inputs, []);

            expect(inputs).toEqual([later, earlier]);
        });
    });

    describe("invalidateAction", () => {
        it("should drop only the entries for the named action", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            await cache.store("sass", [input], [output]);

            cache.invalidateAction("tsc");

            expect((await cache.lookup("tsc", [input])).found).toBe(false);
            expect((await cache.lookup("sass", [input])).found).toBe(true);
        });
    });

    describe("clear", () => {
        it("should drop the index, reset stats and recreate the directory", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });
            await cache.store("tsc", [input], [output]);

            await cache.clear();

            expect(cache.getStats()).toEqual({
                hits: 0,
                misses: 0,
                stored: 0,
                restored: 0,
                evicted: 0,
                size: 0,
                hitRate: "N/A",
            });
            expect(existsSync(cacheDir)).toBe(true);
        });

        it("should swallow errors raised while removing the directory", async () => {
            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();
            // Point the cache at a path that cannot be recreated as a
            // directory, so both the rm and the mkdir fail.
            const blocked = join(root, "blocked");
            writeFileSync(blocked, "file", "utf-8");
            internals(cache).cacheDir = join(blocked, "nested");

            await expect(cache.clear()).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // Persistence
    // ------------------------------------------------------------------------

    describe("save", () => {
        it("should persist the index to disk", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.store("tsc", [input], [output]);
            await cache.save();

            expect(existsSync(join(cacheDir, "build-index.json"))).toBe(true);
        });

        it("should reload a persisted index on the next run", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");

            const first = BuildCache.getInstance({ cacheDir });
            await first.store("tsc", [input], [output]);
            await first.save();

            BuildCache.resetInstance();
            const second = BuildCache.getInstance({ cacheDir });
            expect((await second.lookup("tsc", [input])).found).toBe(true);
        });

        it("should warn instead of throwing when the index cannot be written", async () => {
            const cache = BuildCache.getInstance({ cacheDir });
            await cache.initialize();
            // Replace the cache directory with a file so the write fails.
            rmSync(cacheDir, { recursive: true, force: true });
            writeFileSync(cacheDir, "blocked", "utf-8");

            await cache.save();
            expect(spyOutput(spies.warn())).toContain(
                "Failed to save build cache index",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Statistics
    // ------------------------------------------------------------------------

    describe("getStats", () => {
        it("should report N/A before any lookups", () => {
            expect(
                BuildCache.getInstance({ cacheDir }).getStats().hitRate,
            ).toBe("N/A");
        });

        it("should compute the hit rate once lookups occur", async () => {
            const input = makeFile("a.ts", "source");
            const output = makeFile("out/a.js", "compiled");
            const cache = BuildCache.getInstance({ cacheDir });

            await cache.lookup("tsc", [input]); // miss
            await cache.store("tsc", [input], [output]);
            await cache.lookup("tsc", [input]); // hit

            expect(cache.getStats().hitRate).toBe("50.00%");
        });
    });
});
