// ============================================================================
// PackageManagerAction / VersionWriteAction / TypeScriptCompilerAction Tests
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
import { PackageManagerAction } from "../src/ts/actions/PackageManagerAction";
import packageConfig from "../src/ts/actions/PackageManagerAction/package.config";
import { TypeScriptCompilerAction } from "../src/ts/actions/TypeScriptCompilerAction";
import { VersionWriteAction } from "../src/ts/actions/VersionWriteAction";
import { silenceConsole, spyOutput } from "./helpers/silence";

/** Captured before any `process.cwd` mocking so chdir can be undone. */
const REAL_CWD = process.cwd();

describe("package and build actions", () => {
    const spies = silenceConsole();
    let root: string;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-pkg-"));
        jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    /** Creates a file (and its parents) and returns the absolute path. */
    function makeFile(relative: string, content: string): string {
        const filePath = join(root, relative);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, content, "utf-8");
        return filePath;
    }

    // ========================================================================
    // package.config
    // ========================================================================

    describe("packageConfig", () => {
        it("should provide sensible package.json defaults", () => {
            expect(packageConfig.name).toBe("example-project");
            expect(packageConfig.version).toBe("0.1.0");
            expect(packageConfig.license).toBe("MIT");
            expect(packageConfig.main).toBe("js/index.js");
            expect(packageConfig.types).toBe("js/index.d.ts");
            expect(packageConfig.files).toContain("!.DS_Store");
        });
    });

    // ========================================================================
    // PackageManagerAction
    // ========================================================================

    describe("PackageManagerAction", () => {
        const action = (): PackageManagerAction => new PackageManagerAction();

        /** Reads the package.json the action wrote into `outputDir`. */
        const readOutput = (outputDir: string): Record<string, unknown> =>
            JSON.parse(
                readFileSync(join(outputDir, "package.json"), "utf-8"),
            ) as Record<string, unknown>;

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Reads an existing package.json, extracts selected fields, and creates a new one.",
            );
        });

        it("should reject a missing packageJsonPath", async () => {
            await expect(
                action().execute({ outputDir: join(root, "dist") }),
            ).rejects.toThrow("The 'packageJsonPath' option is required.");
        });

        it("should reject a missing outputDir", async () => {
            await expect(
                action().execute({ packageJsonPath: "./package.json" }),
            ).rejects.toThrow("The 'outputDir' option is required.");
        });

        it("should copy the whole file when no fields are listed", async () => {
            const source = makeFile(
                "package.json",
                JSON.stringify({ name: "demo", version: "9.9.9" }),
            );
            const outputDir = join(root, "dist");

            await action().execute({
                packageJsonPath: source,
                outputDir,
            });

            const written = readOutput(outputDir);
            expect(written.name).toBe("demo");
            expect(written.version).toBe("9.9.9");
            // Defaults are still merged underneath.
            expect(written.license).toBe("MIT");
        });

        it("should keep only the requested fields", async () => {
            const source = makeFile(
                "package.json",
                JSON.stringify({
                    name: "demo",
                    version: "9.9.9",
                    scripts: { build: "tsc" },
                }),
            );
            const outputDir = join(root, "dist");

            await action().execute({
                packageJsonPath: source,
                outputDir,
                fields: ["name", "version", "absent"],
            });

            const written = readOutput(outputDir);
            expect(written.name).toBe("demo");
            expect(written.version).toBe("9.9.9");
            expect(written.scripts).toBeUndefined();
            expect(written.absent).toBeUndefined();
        });

        it("should apply custom overrides last", async () => {
            const source = makeFile(
                "package.json",
                JSON.stringify({ name: "demo", version: "9.9.9" }),
            );
            const outputDir = join(root, "dist");

            await action().execute({
                packageJsonPath: source,
                outputDir,
                customConfig: { name: "overridden", private: true },
            });

            const written = readOutput(outputDir);
            expect(written.name).toBe("overridden");
            expect(written.private).toBe(true);
        });

        it("should report a missing source file", async () => {
            await expect(
                action().execute({
                    packageJsonPath: join(root, "ghost.json"),
                    outputDir: join(root, "dist"),
                }),
            ).rejects.toThrow(/File not found at .*ghost\.json/);
        });

        it("should report invalid JSON", async () => {
            const source = makeFile("package.json", "{ not json");
            await expect(
                action().execute({
                    packageJsonPath: source,
                    outputDir: join(root, "dist"),
                }),
            ).rejects.toThrow(/Invalid JSON in/);
        });

        it("should report an unexpected read failure", async () => {
            const source = makeFile("package.json", "{}");
            jest.spyOn(fs.promises, "readFile").mockRejectedValueOnce(
                Object.assign(new Error("denied"), { code: "EACCES" }),
            );

            await expect(
                action().execute({
                    packageJsonPath: source,
                    outputDir: join(root, "dist"),
                }),
            ).rejects.toThrow(/Unexpected error while reading .*: denied/);
        });

        it("should report an unexpected non-Error read failure", async () => {
            const source = makeFile("package.json", "{}");
            jest.spyOn(fs.promises, "readFile").mockRejectedValueOnce(
                "something odd",
            );

            await expect(
                action().execute({
                    packageJsonPath: source,
                    outputDir: join(root, "dist"),
                }),
            ).rejects.toThrow(
                /Unexpected error while reading .*: something odd/,
            );
        });

        it("should ignore an EEXIST error while creating the output directory", async () => {
            const source = makeFile("package.json", JSON.stringify({}));
            const outputDir = join(root, "dist");
            mkdirSync(outputDir, { recursive: true });
            jest.spyOn(fs.promises, "mkdir").mockRejectedValueOnce(
                Object.assign(new Error("exists"), { code: "EEXIST" }),
            );

            await action().execute({
                packageJsonPath: source,
                outputDir,
            });

            expect(readOutput(outputDir).license).toBe("MIT");
        });

        it("should log and rethrow when the file cannot be written", async () => {
            const source = makeFile("package.json", JSON.stringify({}));
            // A regular file where the output directory should be: mkdir
            // reports EEXIST (which is ignored) and the write then fails.
            const outputDir = makeFile("dist", "blocked");

            await expect(
                action().execute({ packageJsonPath: source, outputDir }),
            ).rejects.toThrow();
            expect(spyOutput(spies.error())).toContain(
                "Error creating package.json",
            );
        });

        it("should rethrow a non-EEXIST error from mkdir", async () => {
            const source = makeFile("package.json", JSON.stringify({}));
            // Nested under a regular file, so mkdir fails with ENOTDIR.
            const outputDir = join(makeFile("blocker", "x"), "nested");

            await expect(
                action().execute({ packageJsonPath: source, outputDir }),
            ).rejects.toThrow(
                expect.objectContaining({ code: "ENOTDIR" }) as never,
            );
        });
    });

    // ========================================================================
    // VersionWriteAction
    // ========================================================================

    describe("VersionWriteAction", () => {
        const action = (): VersionWriteAction => new VersionWriteAction();

        it("should describe itself", () => {
            expect(action().describe()).toContain("Replaces a version string");
        });

        it("should reject when files are missing", async () => {
            await expect(action().execute({})).rejects.toThrow(
                "Missing required option: files.",
            );
        });

        it("should replace the version using the default key", async () => {
            const target = makeFile(
                "meta.yml",
                "name: demo\nversion: 1.0.0\nother: 9.9.9\n",
            );

            await action().execute({
                files: [{ path: target }],
                version: "2.3.4",
            });

            expect(readFileSync(target, "utf-8")).toBe(
                "name: demo\nversion: 2.3.4\nother: 9.9.9\n",
            );
        });

        it("should replace the version using a custom key", async () => {
            const target = makeFile("meta.txt", "release: 1.0.0\n");

            await action().execute({
                files: [{ path: target, key: "release:" }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe("release: 2.0.0\n");
        });

        it("should replace a version followed by a trailing comment", async () => {
            // The replacement was anchored to the end of the line, so
            // anything after the version left it silently untouched.
            const target = makeFile("meta.yml", "version: 1.0.0 # pinned\n");

            await action().execute({
                files: [{ path: target }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe(
                "version: 2.0.0 # pinned\n",
            );
        });

        it("should replace the version in a CRLF file", async () => {
            // The carriage return sat between the version and the end of the
            // line, which defeated the end-anchored replacement.
            const target = makeFile("meta.yml", "version: 1.0.0\r\n");

            await action().execute({
                files: [{ path: target }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe("version: 2.0.0\r\n");
        });

        it("should replace the version the key identifies, not the last one", async () => {
            const target = makeFile("meta.yml", "version: 1.0.0 and 3.0.0\n");

            await action().execute({
                files: [{ path: target }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe(
                "version: 2.0.0 and 3.0.0\n",
            );
        });

        it("should treat a key containing regex syntax literally", async () => {
            // The key was interpolated into a pattern unescaped, so "v(x)"
            // became a capture group and matched nothing.
            const target = makeFile("meta.txt", "v(x) 1.0.0\n");

            await action().execute({
                files: [{ path: target, key: "v(x)" }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe("v(x) 2.0.0\n");
        });

        it("should warn when the key matches nothing", async () => {
            const target = makeFile("meta.yml", "name: demo\n");

            await action().execute({
                files: [{ path: target }],
                version: "2.0.0",
            });

            expect(spyOutput(spies.warn())).toContain(
                'No version matching key "version:"',
            );
        });

        it("should accept a prerelease version from package.json", async () => {
            // Requiring a bare major.minor.patch rejected ordinary versions
            // like 1.2.3-beta.1, leaving the project unable to write at all.
            const target = makeFile("meta.yml", "version: 1.0.0\n");
            writeFileSync(
                join(root, "package.json"),
                JSON.stringify({ version: "2.0.0-beta.1" }),
                "utf-8",
            );

            process.chdir(root);
            try {
                await action().execute({ files: [{ path: target }] });
            } finally {
                process.chdir(REAL_CWD);
            }

            expect(readFileSync(target, "utf-8")).toBe(
                "version: 2.0.0-beta.1\n",
            );
        });

        it("should preserve a file that does not end with a newline", async () => {
            const target = makeFile("meta.txt", "version: 1.0.0");

            await action().execute({
                files: [{ path: target }],
                version: "2.0.0",
            });

            expect(readFileSync(target, "utf-8")).toBe("version: 2.0.0");
        });

        it("should update several files at once", async () => {
            const a = makeFile("a.yml", "version: 1.0.0\n");
            const b = makeFile("b.yml", "version: 1.0.0\n");

            await action().execute({
                files: [{ path: a }, { path: b }],
                version: "3.0.0",
            });

            expect(readFileSync(a, "utf-8")).toContain("3.0.0");
            expect(readFileSync(b, "utf-8")).toContain("3.0.0");
        });

        it("should read the version from package.json when none is given", async () => {
            makeFile("package.json", JSON.stringify({ version: "4.5.6" }));
            const target = makeFile("meta.yml", "version: 1.0.0\n");

            await action().execute({ files: [{ path: target }] });

            expect(readFileSync(target, "utf-8")).toContain("4.5.6");
            expect(spyOutput(spies.log())).toContain(
                'Version "4.5.6" retrieved from package.json',
            );
        });

        it("should fail when package.json has a malformed version", async () => {
            makeFile(
                "package.json",
                JSON.stringify({ version: "not-semver" }),
            );

            await expect(
                action().execute({ files: [{ path: makeFile("m.yml", "") }] }),
            ).rejects.toThrow(/could not be retrieved from package.json/);
            expect(spyOutput(spies.warn())).toContain(
                "Invalid or missing version in package.json",
            );
        });

        it("should fail when package.json has no version at all", async () => {
            makeFile("package.json", JSON.stringify({ name: "demo" }));

            await expect(
                action().execute({ files: [{ path: makeFile("m.yml", "") }] }),
            ).rejects.toThrow(/could not be retrieved from package.json/);
        });

        it("should fail when package.json cannot be read", async () => {
            await expect(
                action().execute({ files: [{ path: makeFile("m.yml", "") }] }),
            ).rejects.toThrow(/could not be retrieved from package.json/);
            expect(spyOutput(spies.error())).toContain(
                "Error reading package.json for version retrieval",
            );
        });

        it("should log and rethrow when a target file cannot be read", async () => {
            await expect(
                action().execute({
                    files: [{ path: join(root, "ghost.yml") }],
                    version: "1.2.3",
                }),
            ).rejects.toThrow(/Error replacing version in file/);
            expect(spyOutput(spies.error())).toContain(
                "Failed to replace version in one or more files",
            );
        });
    });

    // ========================================================================
    // TypeScriptCompilerAction
    // ========================================================================

    describe("TypeScriptCompilerAction", () => {
        const action = (): TypeScriptCompilerAction =>
            new TypeScriptCompilerAction();

        /** Writes a tsconfig and returns its absolute path. */
        function makeTsconfig(
            overrides: Record<string, unknown> = {},
        ): string {
            return makeFile(
                "tsconfig.json",
                JSON.stringify({
                    compilerOptions: {
                        target: "ES2022",
                        module: "ESNext",
                        moduleResolution: "bundler",
                        outDir: "./out",
                        ...(overrides.compilerOptions as object),
                    },
                    include: ["src/**/*.ts"],
                    ...overrides,
                }),
            );
        }

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Compiles TypeScript files using a given tsconfig.json configuration.",
            );
        });

        it("should compile a well-formed project", async () => {
            makeTsconfig();
            makeFile("src/index.ts", "export const value: number = 1;\n");

            await action().execute({
                tsconfigPath: join(root, "tsconfig.json"),
            });

            expect(spyOutput(spies.log())).toContain(
                "TypeScript compilation completed successfully",
            );
        });

        it("should honour an explicit file list and output directory", async () => {
            makeTsconfig();
            const entry = makeFile(
                "src/only.ts",
                "export const only: string = 'x';\n",
            );

            await action().execute({
                tsconfigPath: join(root, "tsconfig.json"),
                filePaths: [entry],
                outputDir: join(root, "custom-out"),
                compilerOptions: { declaration: false },
            });

            expect(spyOutput(spies.log())).toContain(
                "TypeScript compilation completed successfully",
            );
            // `outputDir` used to be applied to a copy of the options after
            // the ones the program was built with had already been assembled,
            // so output silently went to the tsconfig's `outDir` instead.
            expect(existsSync(join(root, "custom-out", "only.js"))).toBe(true);
            expect(existsSync(join(root, "out", "only.js"))).toBe(false);
        });

        it("should default the tsconfig path to the working directory", async () => {
            makeTsconfig();
            makeFile("src/index.ts", "export const value: number = 1;\n");

            // `path.resolve` reads the real working directory rather than the
            // mocked `process.cwd`, so the process must actually move — running
            // this without chdir would compile the kist repo itself.
            process.chdir(root);
            try {
                await action().execute({});
            } finally {
                process.chdir(REAL_CWD);
            }

            expect(spyOutput(spies.log())).toContain(
                "TypeScript compilation completed successfully",
            );
        });

        it("should report type errors", async () => {
            makeTsconfig();
            makeFile("src/bad.ts", "export const value: number = 'text';\n");

            await expect(
                action().execute({
                    tsconfigPath: join(root, "tsconfig.json"),
                }),
            ).rejects.toThrow(
                /TypeScript compilation failed: TypeScript compilation failed due to errors\./,
            );
            expect(spyOutput(spies.error())).toContain("TypeScript Error:");
        });

        it("should report a missing tsconfig", async () => {
            await expect(
                action().execute({
                    tsconfigPath: join(root, "absent.json"),
                }),
            ).rejects.toThrow(/Error reading tsconfig\.json/);
        });

        it("should report an unparseable tsconfig", async () => {
            makeFile(
                "tsconfig.json",
                JSON.stringify({ compilerOptions: { target: "NOPE" } }),
            );

            await expect(
                action().execute({
                    tsconfigPath: join(root, "tsconfig.json"),
                }),
            ).rejects.toThrow(/Error parsing tsconfig\.json/);
        });

        it("should wrap a non-Error failure", async () => {
            makeTsconfig();
            const asInternal = action() as unknown as {
                loadAndParseTsConfig: () => never;
            };
            asInternal.loadAndParseTsConfig = () => {
                throw "plain string failure";
            };

            await expect(
                (asInternal as unknown as TypeScriptCompilerAction).execute({
                    tsconfigPath: join(root, "tsconfig.json"),
                }),
            ).rejects.toThrow(
                "TypeScript compilation failed: plain string failure",
            );
        });
    });
});
