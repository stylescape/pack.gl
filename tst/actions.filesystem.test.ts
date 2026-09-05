// ============================================================================
// Filesystem Action Tests
// ============================================================================

import fs, {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { FileCache } from "../src/ts/core/cache/FileCache";
import { DirectoryCleanAction } from "../src/ts/actions/DirectoryCleanAction";
import { DirectoryCopyAction } from "../src/ts/actions/DirectoryCopyAction";
import { DirectoryCreateAction } from "../src/ts/actions/DirectoryCreateAction";
import { FileCopyAction } from "../src/ts/actions/FileCopyAction";
import { FileRenameAction } from "../src/ts/actions/FileRenameAction";
import { silenceConsole, spyOutput } from "./helpers/silence";

describe("filesystem actions", () => {
    const spies = silenceConsole();
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-actions-"));
        FileCache.resetInstance();
        jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        FileCache.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    /** Creates a file (and its parents) and returns the absolute path. */
    function makeFile(relative: string, content = "content"): string {
        const filePath = join(root, relative);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, content, "utf-8");
        return filePath;
    }

    /** Creates a directory and returns the absolute path. */
    function makeDir(relative: string): string {
        const dirPath = join(root, relative);
        mkdirSync(dirPath, { recursive: true });
        return dirPath;
    }

    // ========================================================================
    // DirectoryCreateAction
    // ========================================================================

    describe("DirectoryCreateAction", () => {
        const action = (): DirectoryCreateAction =>
            new DirectoryCreateAction();

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Creates specified directory structures under a given base path.",
            );
        });

        it("should create every requested directory", async () => {
            const base = makeDir("base");
            await action().execute({
                basePath: base,
                directories: ["a", "b/c"],
            });

            expect(existsSync(join(base, "a"))).toBe(true);
            expect(existsSync(join(base, "b", "c"))).toBe(true);
        });

        it("should accept an empty directory list", async () => {
            await expect(
                action().execute({
                    basePath: makeDir("base"),
                    directories: [],
                }),
            ).resolves.toBeUndefined();
        });

        it("should reject a missing basePath", async () => {
            await expect(
                action().execute({ directories: ["a"] }),
            ).rejects.toThrow(/'basePath' \(string\) and 'directories'/);
        });

        it("should reject missing directories", async () => {
            await expect(action().execute({ basePath: root })).rejects.toThrow(
                /'basePath' \(string\) and 'directories'/,
            );
        });

        it("should reject non-array directories", async () => {
            await expect(
                action().execute({ basePath: root, directories: "a" }),
            ).rejects.toThrow(/'basePath' \(string\) and 'directories'/);
        });

        it("should log and rethrow when a directory cannot be created", async () => {
            const blocker = makeFile("blocker");
            await expect(
                action().execute({
                    basePath: blocker,
                    directories: ["child"],
                }),
            ).rejects.toThrow();

            const errors = spyOutput(spies.error());
            expect(errors).toContain("Error creating directory");
            expect(errors).toContain("Failed to create directories");
        });
    });

    // ========================================================================
    // DirectoryCopyAction
    // ========================================================================

    describe("DirectoryCopyAction", () => {
        const action = (): DirectoryCopyAction => new DirectoryCopyAction();

        it("should describe itself", () => {
            expect(action().describe()).toContain(
                "Copies all files and subdirectories",
            );
        });

        it("should copy files and nested directories", async () => {
            makeFile("src/a.txt", "alpha");
            makeFile("src/nested/b.txt", "beta");

            await action().execute({
                srcDir: join(root, "src"),
                destDir: join(root, "dest"),
            });

            expect(readFileSync(join(root, "dest", "a.txt"), "utf-8")).toBe(
                "alpha",
            );
            expect(
                readFileSync(join(root, "dest", "nested", "b.txt"), "utf-8"),
            ).toBe("beta");
        });

        it("should create the destination when it does not exist", async () => {
            makeDir("src");
            await action().execute({
                srcDir: join(root, "src"),
                destDir: join(root, "deep", "dest"),
            });
            expect(existsSync(join(root, "deep", "dest"))).toBe(true);
        });

        it("should reject a missing srcDir", async () => {
            await expect(
                action().execute({ destDir: join(root, "dest") }),
            ).rejects.toThrow("Missing required options: srcDir or destDir.");
        });

        it("should reject a missing destDir", async () => {
            await expect(
                action().execute({ srcDir: join(root, "src") }),
            ).rejects.toThrow("Missing required options: srcDir or destDir.");
        });

        it("should log and rethrow when the source cannot be read", async () => {
            await expect(
                action().execute({
                    srcDir: join(root, "ghost"),
                    destDir: join(root, "dest"),
                }),
            ).rejects.toThrow(/Failed to copy from/);
            expect(spyOutput(spies.error())).toContain("Error copying files");
        });
    });

    // ========================================================================
    // FileRenameAction
    // ========================================================================

    describe("FileRenameAction", () => {
        const action = (): FileRenameAction => new FileRenameAction();

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Renames a file from a specified source path to a target path.",
            );
        });

        it("should create the target directory if it does not exist", async () => {
            // Renaming into a directory that is not there yet failed with
            // ENOENT, which reads as though the source were missing.
            const src = makeFile("old.txt", "data");
            const target = join(root, "nested", "deeper", "new.txt");

            await action().execute({ srcPath: src, targetPath: target });

            expect(fs.readFileSync(target, "utf-8")).toBe("data");
            expect(fs.existsSync(src)).toBe(false);
        });

        it("should fall back to copying across filesystems", async () => {
            const src = makeFile("old.txt", "data");
            const target = join(root, "new.txt");
            jest.spyOn(fs.promises, "rename").mockRejectedValueOnce(
                Object.assign(new Error("EXDEV"), { code: "EXDEV" }),
            );

            await action().execute({ srcPath: src, targetPath: target });

            expect(fs.readFileSync(target, "utf-8")).toBe("data");
            expect(fs.existsSync(src)).toBe(false);
        });

        it("should rename a file", async () => {
            const src = makeFile("old.txt", "data");
            const target = join(root, "new.txt");

            await action().execute({ srcPath: src, targetPath: target });

            expect(existsSync(src)).toBe(false);
            expect(readFileSync(target, "utf-8")).toBe("data");
        });

        it("should reject a missing srcPath", async () => {
            await expect(
                action().execute({ targetPath: join(root, "new.txt") }),
            ).rejects.toThrow(/'srcPath' and 'targetPath' are required/);
        });

        it("should reject a missing targetPath", async () => {
            await expect(
                action().execute({ srcPath: makeFile("old.txt") }),
            ).rejects.toThrow(/'srcPath' and 'targetPath' are required/);
        });

        it("should log and rethrow when the source is missing", async () => {
            await expect(
                action().execute({
                    srcPath: join(root, "ghost.txt"),
                    targetPath: join(root, "new.txt"),
                }),
            ).rejects.toThrow();

            const errors = spyOutput(spies.error());
            expect(errors).toContain("Error renaming file");
            expect(errors).toContain("Failed to rename file");
        });
    });

    // ========================================================================
    // DirectoryCleanAction
    // ========================================================================

    describe("DirectoryCleanAction", () => {
        const action = (): DirectoryCleanAction => new DirectoryCleanAction();

        it("should describe itself", () => {
            expect(action().describe()).toContain("Cleans a directory");
        });

        it("should reject a missing dirPath", async () => {
            await expect(action().execute({})).rejects.toThrow(
                "Missing required option: dirPath.",
            );
        });

        it("should skip a directory that does not exist", async () => {
            await action().execute({ dirPath: join(root, "ghost") });
            expect(spyOutput(spies.warn())).toContain(
                "Directory does not exist, skipping",
            );
        });

        it("should delete files and subdirectories", async () => {
            const target = makeDir("target");
            makeFile("target/a.txt");
            makeFile("target/nested/b.txt");

            await action().execute({ dirPath: target });

            expect(fs.readdirSync(target)).toEqual([]);
            const output = spyOutput(spies.log());
            expect(output).toContain("Deleted file: a.txt");
            expect(output).toContain("Deleted directory: nested");
        });

        it("should retain entries matching the keep patterns", async () => {
            const target = makeDir("target");
            makeFile("target/keep.md");
            makeFile("target/drop.txt");

            await action().execute({ dirPath: target, keep: ["*.md"] });

            expect(fs.readdirSync(target)).toEqual(["keep.md"]);
            expect(spyOutput(spies.log())).toContain("Skipping: keep.md");
        });

        it("should delete everything when no keep patterns are given", async () => {
            const target = makeDir("target");
            makeFile("target/a.txt");

            await action().execute({ dirPath: target, keep: undefined });

            expect(fs.readdirSync(target)).toEqual([]);
        });

        it("should fail when the directory cannot be listed", async () => {
            const notADirectory = makeFile("plain.txt");

            await expect(
                action().execute({ dirPath: notADirectory }),
            ).rejects.toThrow();

            expect(spyOutput(spies.error())).toContain(
                "Error cleaning directory",
            );
        });

        it("should fail when a single entry cannot be deleted", async () => {
            // A clean that left files behind used to report success, so the
            // rest of the pipeline ran against a directory it believed empty.
            const target = makeDir("target");
            makeFile("target/a.txt");
            jest.spyOn(fs.promises, "unlink").mockRejectedValue(
                Object.assign(new Error("EACCES"), { code: "EACCES" }),
            );

            await expect(
                action().execute({ dirPath: target }),
            ).rejects.toThrow("EACCES");

            expect(spyOutput(spies.error())).toContain(
                "Error deleting: a.txt",
            );
        });

        it("should keep a nested file and delete everything around it", async () => {
            // `keep` patterns were matched against top-level names only, so a
            // nested pattern never matched and its directory was removed
            // wholesale — taking the file that was meant to survive with it.
            const target = makeDir("target");
            makeDir("target/sub");
            makeFile("target/sub/keep.txt");
            makeFile("target/sub/drop.txt");
            makeFile("target/top.txt");

            await action().execute({
                dirPath: target,
                keep: ["sub/keep.txt"],
            });

            expect(fs.existsSync(join(target, "sub/keep.txt"))).toBe(true);
            expect(fs.existsSync(join(target, "sub/drop.txt"))).toBe(false);
            expect(fs.existsSync(join(target, "top.txt"))).toBe(false);
        });

        it("should keep everything under a globstar pattern", async () => {
            const target = makeDir("target");
            makeDir("target/assets/img");
            makeFile("target/assets/img/logo.svg");
            makeFile("target/other.txt");

            // A sibling directory the globstar pattern does not name is
            // removed outright rather than walked.
            makeDir("target/vendor/deep");
            makeFile("target/vendor/deep/lib.js");

            await action().execute({
                dirPath: target,
                keep: ["assets/**"],
            });

            expect(fs.existsSync(join(target, "assets/img/logo.svg"))).toBe(
                true,
            );
            expect(fs.existsSync(join(target, "other.txt"))).toBe(false);
            expect(fs.existsSync(join(target, "vendor"))).toBe(false);
        });

        it("should keep everything under a leading globstar", async () => {
            const target = makeDir("target");
            makeDir("target/a/b");
            makeFile("target/a/b/keep.md");
            makeFile("target/a/drop.txt");

            await action().execute({ dirPath: target, keep: ["**/*.md"] });

            expect(fs.existsSync(join(target, "a/b/keep.md"))).toBe(true);
            expect(fs.existsSync(join(target, "a/drop.txt"))).toBe(false);
        });

        it("should remove a walked directory whose keeper was not there", async () => {
            // The pattern reaches into "sub", so it is walked rather than
            // removed outright — but nothing in it matched, so the directory
            // must not be left behind empty.
            const target = makeDir("target");
            makeDir("target/sub");
            makeFile("target/sub/a.txt");

            await action().execute({
                dirPath: target,
                keep: ["sub/absent.txt"],
            });

            expect(fs.existsSync(join(target, "sub"))).toBe(false);
        });

        it("should remove a directory left empty after its contents went", async () => {
            // Walking a directory to preserve a sibling must not leave the
            // now-empty directory behind.
            const target = makeDir("target");
            makeDir("target/keepme");
            makeFile("target/keepme/wanted.txt");
            makeDir("target/keepme/gone");
            makeFile("target/keepme/gone/unwanted.txt");

            await action().execute({
                dirPath: target,
                keep: ["keepme/wanted.txt"],
            });

            expect(fs.existsSync(join(target, "keepme/wanted.txt"))).toBe(
                true,
            );
            expect(fs.existsSync(join(target, "keepme/gone"))).toBe(false);
        });

        it("should still remove a directory no keep pattern reaches into", async () => {
            const target = makeDir("target");
            makeDir("target/sub");
            makeFile("target/sub/a.txt");
            makeFile("target/keep.txt");

            await action().execute({
                dirPath: target,
                keep: ["keep.txt"],
            });

            expect(fs.existsSync(join(target, "keep.txt"))).toBe(true);
            expect(fs.existsSync(join(target, "sub"))).toBe(false);
        });
    });

    // ========================================================================
    // FileCopyAction
    // ========================================================================

    describe("DirectoryCopyAction self-containment", () => {
        it("should refuse to copy a directory into its own subdirectory", async () => {
            // Unguarded, the walk kept finding the destination it had just
            // written and built dist/dist/dist/... until the filesystem
            // refused the path length, filling the disk on the way.
            const src = makeDir("selfcopy");
            makeFile("selfcopy/a.txt");

            await expect(
                new DirectoryCopyAction().execute({
                    srcDir: src,
                    destDir: join(src, "dist"),
                }),
            ).rejects.toThrow(/into its own subdirectory/);
        });

        it("should refuse to copy a directory onto itself", async () => {
            const src = makeDir("samedir");

            await expect(
                new DirectoryCopyAction().execute({
                    srcDir: src,
                    destDir: src,
                }),
            ).rejects.toThrow(/onto itself/);
        });

        it("should still allow a sibling destination", async () => {
            const src = makeDir("sibling-src");
            makeFile("sibling-src/a.txt", "hi");

            await new DirectoryCopyAction().execute({
                srcDir: src,
                destDir: join(root, "sibling-dest"),
            });

            expect(
                fs.readFileSync(join(root, "sibling-dest", "a.txt"), "utf-8"),
            ).toBe("hi");
        });
    });

    describe("FileCopyAction", () => {
        const action = (): FileCopyAction => new FileCopyAction();

        it("should describe itself", () => {
            expect(action().describe()).toContain("Copies a file");
        });

        describe("option validation", () => {
            it("should reject when no source is given", async () => {
                await expect(
                    action().execute({ destDir: join(root, "dest") }),
                ).rejects.toThrow(/srcFile\/srcFiles or destDir/);
            });

            it("should reject when destDir is missing", async () => {
                await expect(
                    action().execute({ srcFile: makeFile("a.txt") }),
                ).rejects.toThrow(/srcFile\/srcFiles or destDir/);
            });
        });

        describe("single file copy", () => {
            it("should copy a file into the destination directory", async () => {
                const src = makeFile("a.txt", "alpha");
                await action().execute({
                    srcFile: src,
                    destDir: join(root, "dest"),
                });
                expect(
                    readFileSync(join(root, "dest", "a.txt"), "utf-8"),
                ).toBe("alpha");
            });

            it("should stream files above the streaming threshold", async () => {
                const src = makeFile("big.bin", "x".repeat(6 * 1024 * 1024));
                await action().execute({
                    srcFile: src,
                    destDir: join(root, "dest"),
                });
                expect(fs.statSync(join(root, "dest", "big.bin")).size).toBe(
                    6 * 1024 * 1024,
                );
            });

            it("should copy on the first cached run and skip the second", async () => {
                const src = makeFile("a.txt", "alpha");
                const dest = join(root, "dest");

                await action().execute({
                    srcFile: src,
                    destDir: dest,
                    useCache: true,
                });
                rmSync(join(dest, "a.txt"));

                await action().execute({
                    srcFile: src,
                    destDir: dest,
                    useCache: true,
                });

                expect(existsSync(join(dest, "a.txt"))).toBe(false);
                expect(spyOutput(spies.log())).toContain(
                    "Skipping unchanged file",
                );
            });

            it("should log and rethrow when the source is missing", async () => {
                await expect(
                    action().execute({
                        srcFile: join(root, "ghost.txt"),
                        destDir: join(root, "dest"),
                    }),
                ).rejects.toThrow();
                expect(spyOutput(spies.error())).toContain(
                    "Error copying file",
                );
            });
        });

        describe("batch copy", () => {
            it("should copy several files sequentially", async () => {
                const files = ["a.txt", "b.txt"].map((name) =>
                    makeFile(name, name),
                );

                await action().execute({
                    srcFiles: files,
                    destDir: join(root, "dest"),
                });

                expect(
                    readFileSync(join(root, "dest", "b.txt"), "utf-8"),
                ).toBe("b.txt");
                expect(spyOutput(spies.log())).toMatch(
                    /Copied 2 files in [\d.]+ms/,
                );
            });

            it("should copy in parallel above the concurrency limit", async () => {
                const files = Array.from({ length: 12 }, (_, i) =>
                    makeFile(`f${i}.txt`, `body ${i}`),
                );

                await action().execute({
                    srcFiles: files,
                    destDir: join(root, "dest"),
                    parallel: true,
                });

                expect(fs.readdirSync(join(root, "dest"))).toHaveLength(12);
            });

            it("should fail a parallel copy without leaving rejections unhandled", async () => {
                // `Promise.race` abandons the losing promises, so a failure
                // beyond the concurrency limit used to leave the copies still
                // in flight unobserved and Node reported them as unhandled.
                const unhandled: unknown[] = [];
                const onUnhandled = (reason: unknown): void => {
                    unhandled.push(reason);
                };
                process.on("unhandledRejection", onUnhandled);

                const files = Array.from({ length: 12 }, (_, i) =>
                    makeFile(`p${i}.txt`, `body ${i}`),
                );
                files.push(join(root, "absent.txt"));

                try {
                    await expect(
                        action().execute({
                            srcFiles: files,
                            destDir: join(root, "dest-fail"),
                            parallel: true,
                        }),
                    ).rejects.toThrow();

                    await new Promise((resolve) => setTimeout(resolve, 30));
                    expect(unhandled).toEqual([]);
                } finally {
                    process.off("unhandledRejection", onUnhandled);
                }
            });

            it("should do nothing when srcFiles is empty and there is no srcFile", async () => {
                await expect(
                    action().execute({
                        srcFiles: [],
                        destDir: join(root, "dest"),
                    }),
                ).resolves.toBeUndefined();
                expect(existsSync(join(root, "dest"))).toBe(false);
            });

            it("should fall through when srcFiles is empty", async () => {
                await expect(
                    action().execute({
                        srcFiles: [],
                        srcFile: makeFile("a.txt"),
                        destDir: join(root, "dest"),
                    }),
                ).resolves.toBeUndefined();
                expect(existsSync(join(root, "dest", "a.txt"))).toBe(true);
            });

            it("should skip files that have not changed", async () => {
                const files = ["a.txt", "b.txt"].map((name) =>
                    makeFile(name, name),
                );
                const dest = join(root, "dest");

                await action().execute({
                    srcFiles: files,
                    destDir: dest,
                    useCache: true,
                });
                writeFileSync(files[0], "changed", "utf-8");

                await action().execute({
                    srcFiles: files,
                    destDir: dest,
                    useCache: true,
                });

                expect(spyOutput(spies.log())).toContain(
                    "Skipping 1 unchanged files",
                );
            });

            it("should do nothing when every file is up to date", async () => {
                const files = [makeFile("a.txt", "alpha")];
                const dest = join(root, "dest");

                await action().execute({
                    srcFiles: files,
                    destDir: dest,
                    useCache: true,
                });
                await action().execute({
                    srcFiles: files,
                    destDir: dest,
                    useCache: true,
                });

                expect(spyOutput(spies.log())).toContain(
                    "All files are up to date, nothing to copy.",
                );
            });

            it("should log and rethrow when a batch copy fails", async () => {
                await expect(
                    action().execute({
                        srcFiles: [join(root, "ghost.txt")],
                        destDir: join(root, "dest"),
                    }),
                ).rejects.toThrow();
                expect(spyOutput(spies.error())).toContain(
                    "Error copying files",
                );
            });
        });

        describe("destination directory handling", () => {
            it("should ignore an EEXIST error from mkdir", async () => {
                const src = makeFile("a.txt", "alpha");
                const dest = makeDir("dest");
                jest.spyOn(fs.promises, "mkdir").mockRejectedValueOnce(
                    Object.assign(new Error("exists"), { code: "EEXIST" }),
                );

                await action().execute({ srcFile: src, destDir: dest });

                expect(readFileSync(join(dest, "a.txt"), "utf-8")).toBe(
                    "alpha",
                );
            });

            it("should rethrow a non-EEXIST error from mkdir", async () => {
                const src = makeFile("a.txt", "alpha");
                jest.spyOn(fs.promises, "mkdir").mockRejectedValueOnce(
                    Object.assign(new Error("denied"), { code: "EACCES" }),
                );

                await expect(
                    action().execute({
                        srcFile: src,
                        destDir: join(root, "dest"),
                    }),
                ).rejects.toThrow("denied");
            });

            it("should rethrow a non-Error rejection from mkdir", async () => {
                const src = makeFile("a.txt", "alpha");
                jest.spyOn(fs.promises, "mkdir").mockRejectedValueOnce(
                    "not an error",
                );

                await expect(
                    action().execute({
                        srcFile: src,
                        destDir: join(root, "dest"),
                    }),
                ).rejects.toBe("not an error");
            });
        });
    });
});
