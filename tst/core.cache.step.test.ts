// ============================================================================
// StepCache Tests
// ============================================================================

import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { StepCache, stableStringify } from "../src/ts/core/cache/StepCache";
import { expandPatterns } from "../src/ts/core/cache/globExpand";
import { Logger } from "../src/ts/logger/Logger";
import { silenceConsole, spyOutput } from "./helpers/silence";

describe("StepCache", () => {
    const spies = silenceConsole();
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-step-cache-"));
        StepCache.resetInstance();
    });

    afterEach(() => {
        StepCache.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    /** A cache rooted at the temporary directory. */
    function cacheFor(): StepCache {
        return StepCache.getInstance({ cwd: root, cacheDir: ".cache" });
    }

    /** Writes a file below the temporary root and returns its path. */
    function write(relative: string, contents: string): string {
        const target = join(root, relative);
        mkdirSync(join(target, ".."), { recursive: true });
        writeFileSync(target, contents, "utf-8");
        return target;
    }

    // ------------------------------------------------------------------------
    // Singleton
    // ------------------------------------------------------------------------

    describe("getInstance", () => {
        it("should return the same instance across calls", () => {
            expect(cacheFor()).toBe(StepCache.getInstance());
        });

        it("should build a fresh instance after a reset", () => {
            const first = cacheFor();
            StepCache.resetInstance();
            expect(StepCache.getInstance({ cwd: root })).not.toBe(first);
        });

        it("should default the cache directory", async () => {
            StepCache.resetInstance();
            const cache = StepCache.getInstance();
            await expect(cache.initialize()).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // Hashing
    // ------------------------------------------------------------------------

    describe("computeHash", () => {
        const base = {
            actionName: "FileCopyAction",
            options: { srcFile: "./a" },
            inputs: ["src/a.txt"],
        };

        beforeEach(() => write("src/a.txt", "original"));

        it("should be stable for identical inputs", () => {
            const cache = cacheFor();
            expect(cache.computeHash(base)).toBe(cache.computeHash(base));
        });

        it("should change when an input file's contents change", () => {
            const cache = cacheFor();
            const before = cache.computeHash(base);
            write("src/a.txt", "changed");
            expect(cache.computeHash(base)).not.toBe(before);
        });

        it("should not change when only the file's mtime changes", () => {
            const cache = cacheFor();
            const before = cache.computeHash(base);
            write("src/a.txt", "original");
            expect(cache.computeHash(base)).toBe(before);
        });

        it("should change when the action changes", () => {
            const cache = cacheFor();
            expect(
                cache.computeHash({ ...base, actionName: "Other" }),
            ).not.toBe(cache.computeHash(base));
        });

        it("should change when the options change", () => {
            const cache = cacheFor();
            expect(
                cache.computeHash({ ...base, options: { srcFile: "./b" } }),
            ).not.toBe(cache.computeHash(base));
        });

        it("should ignore the key order of options", () => {
            const cache = cacheFor();
            expect(
                cache.computeHash({ ...base, options: { a: 1, b: 2 } }),
            ).toBe(cache.computeHash({ ...base, options: { b: 2, a: 1 } }));
        });

        it("should change when a declared environment variable changes", () => {
            const cache = cacheFor();
            process.env.KIST_TEST_VAR = "one";
            const before = cache.computeHash({
                ...base,
                env: ["KIST_TEST_VAR"],
            });

            process.env.KIST_TEST_VAR = "two";
            const after = cache.computeHash({
                ...base,
                env: ["KIST_TEST_VAR"],
            });

            delete process.env.KIST_TEST_VAR;
            expect(after).not.toBe(before);
        });

        it("should treat an unset environment variable as empty", () => {
            const cache = cacheFor();
            delete process.env.KIST_UNSET_VAR;

            expect(() =>
                cache.computeHash({ ...base, env: ["KIST_UNSET_VAR"] }),
            ).not.toThrow();
        });

        it("should ignore environment variables that were not declared", () => {
            const cache = cacheFor();
            process.env.KIST_TEST_VAR = "one";
            const before = cache.computeHash(base);
            process.env.KIST_TEST_VAR = "two";
            const after = cache.computeHash(base);

            delete process.env.KIST_TEST_VAR;
            expect(after).toBe(before);
        });

        it("should tolerate an input pattern that matches nothing", () => {
            const cache = cacheFor();
            expect(() =>
                cache.computeHash({ ...base, inputs: ["nothing/here/*.x"] }),
            ).not.toThrow();
        });

        it("should treat an unreadable file as a stable sentinel", () => {
            const cache = cacheFor();
            // A build should not die because one declared input became
            // unreadable between listing and hashing.
            const failure = jest
                .spyOn(require("fs"), "readFileSync")
                .mockImplementation(() => {
                    throw new Error("EACCES");
                });

            expect(() => cache.computeHash(base)).not.toThrow();
            failure.mockRestore();
        });
    });

    // ------------------------------------------------------------------------
    // Restore and record
    // ------------------------------------------------------------------------

    describe("restore and record", () => {
        it("should miss when nothing has been recorded", async () => {
            const cache = cacheFor();
            expect(await cache.restore("nope")).toBe(false);
            expect(cache.getStats().misses).toBe(1);
        });

        it("should replay logs and restore outputs on a hit", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();

            await cache.record("h1", ["[INFO] built it"], ["dist/**"]);
            rmSync(join(root, "dist"), { recursive: true, force: true });

            expect(await cache.restore("h1")).toBe(true);
            expect(readFileSync(join(root, "dist/out.txt"), "utf-8")).toBe(
                "built",
            );
            expect(spyOutput(spies.log())).toContain("[INFO] built it");
            expect(cache.getStats().hits).toBe(1);
        });

        it("should record a step with no declared outputs", async () => {
            const cache = cacheFor();
            await cache.record("h2", ["done"], []);
            expect(await cache.restore("h2")).toBe(true);
        });

        it("should miss and drop the entry when the archive is gone", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();
            await cache.record("h3", [], ["dist/**"]);

            // Simulate someone deleting the cache directory's contents.
            rmSync(join(root, ".cache", "steps"), {
                recursive: true,
                force: true,
            });

            expect(await cache.restore("h3")).toBe(false);
            expect(await cache.restore("h3")).toBe(false);
        });

        it("should warn rather than fail when archiving is impossible", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();
            const failure = jest
                .spyOn(require("fs").promises, "copyFile")
                .mockRejectedValue(new Error("disk full"));

            await expect(
                cache.record("h-archive", [], ["dist/**"]),
            ).resolves.toBeUndefined();

            expect(spyOutput(spies.warn())).toContain(
                "Failed to archive step outputs",
            );
            failure.mockRestore();

            // Nothing was recorded, so the next run executes the step.
            expect(await cache.restore("h-archive")).toBe(false);
        });

        it("should refuse to archive outputs outside the project root", async () => {
            const outside = mkdtempSync(join(tmpdir(), "kist-outside-"));
            writeFileSync(join(outside, "escape.txt"), "x", "utf-8");

            const cache = cacheFor();
            await cache.record("h4", [], [join(outside, "escape.txt")]);

            expect(spyOutput(spies.warn())).toContain(
                "Skipping output outside the project root",
            );
            rmSync(outside, { recursive: true, force: true });
        });
    });

    // ------------------------------------------------------------------------
    // Persistence
    // ------------------------------------------------------------------------

    describe("persistence", () => {
        it("should survive a save and reload", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();
            await cache.record("h5", ["replayed"], ["dist/**"]);
            await cache.save();

            StepCache.resetInstance();
            const reloaded = StepCache.getInstance({
                cwd: root,
                cacheDir: ".cache",
            });

            expect(await reloaded.restore("h5")).toBe(true);
        });

        it("should drop entries older than the ttl", async () => {
            const cache = cacheFor();
            await cache.record("h6", [], []);
            await cache.save();

            StepCache.resetInstance();
            const reloaded = StepCache.getInstance({
                cwd: root,
                cacheDir: ".cache",
                ttl: -1, // everything is already expired
            });

            expect(await reloaded.restore("h6")).toBe(false);
        });

        it("should start empty when the index is corrupt", async () => {
            mkdirSync(join(root, ".cache"), { recursive: true });
            writeFileSync(
                join(root, ".cache", "step-cache.json"),
                "{not json",
                "utf-8",
            );

            const cache = cacheFor();
            await cache.initialize();
            expect(await cache.restore("anything")).toBe(false);
        });

        it("should not write an index it never loaded", async () => {
            const cache = cacheFor();
            await cache.save();
            expect(existsSync(join(root, ".cache", "step-cache.json"))).toBe(
                false,
            );
        });

        it("should warn rather than throw when saving fails", async () => {
            const cache = cacheFor();
            await cache.initialize();
            // A file where the cache directory belongs makes mkdir fail.
            rmSync(join(root, ".cache"), { recursive: true, force: true });
            writeFileSync(join(root, ".cache"), "blocked", "utf-8");

            await expect(cache.save()).resolves.toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                "Failed to save step cache",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Clearing and statistics
    // ------------------------------------------------------------------------

    describe("clear", () => {
        it("should remove recorded entries and archived outputs", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();
            await cache.record("h7", [], ["dist/**"]);
            await cache.save();

            await cache.clear();

            expect(await cache.restore("h7")).toBe(false);
            expect(existsSync(join(root, ".cache", "steps"))).toBe(false);
        });

        it("should warn rather than throw when the files cannot be removed", async () => {
            const cache = cacheFor();
            const failure = jest
                .spyOn(require("fs").promises, "rm")
                .mockRejectedValue(new Error("read-only volume"));

            await expect(cache.clear()).resolves.toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                "Failed to clear step cache",
            );

            failure.mockRestore();
        });
    });

    describe("getStats", () => {
        it("should report N/A before anything is looked up", () => {
            expect(cacheFor().getStats().hitRate).toBe("N/A");
        });

        it("should report the hit rate once there is traffic", async () => {
            write("dist/out.txt", "built");
            const cache = cacheFor();
            await cache.record("h8", [], ["dist/**"]);

            await cache.restore("h8");
            await cache.restore("missing");

            expect(cache.getStats()).toMatchObject({
                hits: 1,
                misses: 1,
                hitRate: "50.00%",
            });
        });
    });
});

// ============================================================================
// stableStringify
// ============================================================================

describe("stableStringify", () => {
    it("should sort object keys", () => {
        expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    });

    it("should sort keys at every depth", () => {
        expect(stableStringify({ outer: { z: 1, a: 2 } })).toBe(
            '{"outer":{"a":2,"z":1}}',
        );
    });

    it("should preserve array order", () => {
        expect(stableStringify([3, 1, 2])).toBe("[3,1,2]");
    });

    it("should render primitives as JSON does", () => {
        expect(stableStringify("x")).toBe('"x"');
        expect(stableStringify(7)).toBe("7");
        expect(stableStringify(true)).toBe("true");
        expect(stableStringify(null)).toBe("null");
    });

    it("should render undefined as null", () => {
        expect(stableStringify(undefined)).toBe("null");
    });

    it("should drop undefined members, as JSON does", () => {
        expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
    });
});

// ============================================================================
// expandPatterns
// ============================================================================

describe("expandPatterns", () => {
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-glob-"));
        mkdirSync(join(root, "src", "nested"), { recursive: true });
        mkdirSync(join(root, "node_modules", "pkg"), { recursive: true });
        writeFileSync(join(root, "src", "a.ts"), "a", "utf-8");
        writeFileSync(join(root, "src", "b.js"), "b", "utf-8");
        writeFileSync(join(root, "src", "nested", "c.ts"), "c", "utf-8");
        writeFileSync(join(root, "root.txt"), "r", "utf-8");
        writeFileSync(
            join(root, "node_modules", "pkg", "index.js"),
            "n",
            "utf-8",
        );
    });

    afterEach(() => rmSync(root, { recursive: true, force: true }));

    it("should resolve a plain file path", () => {
        expect(expandPatterns(["root.txt"], root)).toEqual([
            join(root, "root.txt"),
        ]);
    });

    it("should expand a directory to everything beneath it", () => {
        expect(expandPatterns(["src"], root)).toEqual([
            join(root, "src", "a.ts"),
            join(root, "src", "b.js"),
            join(root, "src", "nested", "c.ts"),
        ]);
    });

    it("should match a recursive glob", () => {
        expect(expandPatterns(["src/**/*.ts"], root)).toEqual([
            join(root, "src", "a.ts"),
            join(root, "src", "nested", "c.ts"),
        ]);
    });

    it("should match a single-level glob", () => {
        expect(expandPatterns(["src/*.ts"], root)).toEqual([
            join(root, "src", "a.ts"),
        ]);
    });

    it("should skip node_modules", () => {
        expect(expandPatterns(["**/*.js"], root)).toEqual([
            join(root, "src", "b.js"),
        ]);
    });

    it("should ignore a path that does not exist", () => {
        expect(expandPatterns(["missing.txt"], root)).toEqual([]);
    });

    it("should ignore a glob that matches nothing", () => {
        expect(expandPatterns(["src/**/*.rs"], root)).toEqual([]);
    });

    it("should de-duplicate overlapping patterns", () => {
        expect(expandPatterns(["src/a.ts", "src/*.ts"], root)).toEqual([
            join(root, "src", "a.ts"),
        ]);
    });

    it("should return results in a stable order", () => {
        expect(expandPatterns(["src/**/*.ts"], root)).toEqual(
            expandPatterns(["src/**/*.ts"], root),
        );
    });

    it("should accept an absolute path", () => {
        expect(expandPatterns([join(root, "root.txt")], root)).toEqual([
            join(root, "root.txt"),
        ]);
    });

    it("should accept an absolute glob", () => {
        expect(expandPatterns([join(root, "src", "*.ts")], root)).toEqual([
            join(root, "src", "a.ts"),
        ]);
    });

    it("should default to the process working directory", () => {
        expect(() =>
            expandPatterns(["definitely-not-here-*.xyz"]),
        ).not.toThrow();
    });

    it("should ignore entries that are neither files nor directories", () => {
        // A dangling symlink is neither, and must not be hashed as an input.
        symlinkSync(join(root, "gone.txt"), join(root, "dangling"));

        expect(expandPatterns(["*"], root)).toEqual([join(root, "root.txt")]);
    });
});

// ============================================================================
// Logger capture
// ============================================================================

describe("Logger capture", () => {
    const spies = silenceConsole();

    it("should record emitted lines and stop when ended", () => {
        const logger = Logger.getInstance();

        logger.beginCapture();
        logger.logInfo("ctx", "inside");
        const captured = logger.endCapture();
        logger.logInfo("ctx", "outside");

        expect(captured).toHaveLength(1);
        expect(captured[0]).toContain("inside");
    });

    it("should return an empty list when nothing was captured", () => {
        expect(Logger.getInstance().endCapture()).toEqual([]);
    });

    it("should support nested captures", () => {
        const logger = Logger.getInstance();

        logger.beginCapture();
        logger.logInfo("ctx", "outer");
        logger.beginCapture();
        logger.logInfo("ctx", "inner");
        const inner = logger.endCapture();
        const outer = logger.endCapture();

        expect(inner).toHaveLength(1);
        // The outer capture sees both, since both were emitted while it was open.
        expect(outer).toHaveLength(2);
    });

    it("should not capture lines filtered out by the log level", () => {
        Logger.resetInstance();
        const logger = Logger.getInstance("error");

        logger.beginCapture();
        logger.logInfo("ctx", "filtered");
        expect(logger.endCapture()).toEqual([]);
    });

    it("should replay lines verbatim", () => {
        Logger.getInstance().replay(["line one", "line two"]);

        expect(spyOutput(spies.log())).toContain("line one");
        expect(spyOutput(spies.log())).toContain("line two");
    });
});
