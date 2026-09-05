// ============================================================================
// Child-process Action Tests (RunScriptAction, DocumentationAction)
// ============================================================================

import { resolve } from "path";
import { silenceConsole, spyOutput } from "./helpers/silence";

// Both actions capture `util.promisify(execFile)` at module load, so the
// replacement has to be in place before they are imported — hence a module
// mock rather than a spy. The promisify custom hook is required so the
// promisified form resolves to `{ stdout, stderr }` as the real one does.
const mockExecFile = jest.fn();

jest.mock("child_process", () => {
    const actual =
        jest.requireActual<typeof import("child_process")>("child_process");
    const util = jest.requireActual<typeof import("util")>("util");
    const execFile = ((...args: unknown[]) =>
        mockExecFile(...args)) as unknown as Record<symbol, unknown>;
    execFile[util.promisify.custom] = (...args: unknown[]) =>
        mockExecFile(...args);
    return { ...actual, execFile };
});

import { DocumentationAction } from "../src/ts/actions/DocumentationAction";
import { RunScriptAction } from "../src/ts/actions/RunScriptAction";

describe("child-process actions", () => {
    const spies = silenceConsole();

    beforeEach(() => {
        mockExecFile.mockReset();
        mockExecFile.mockResolvedValue({ stdout: "done", stderr: "" });
    });

    // ========================================================================
    // RunScriptAction
    // ========================================================================

    describe("RunScriptAction", () => {
        const action = (): RunScriptAction => new RunScriptAction();

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Executes an external JavaScript file as part of the KIST pipeline.",
            );
        });

        it("should reject when scriptPath is missing", async () => {
            await expect(action().execute({})).rejects.toThrow(
                "Invalid options: 'scriptPath' is required.",
            );
        });

        it("should run the script with node and log its output", async () => {
            await action().execute({ scriptPath: "./scripts/build.js" });

            // The script runs on the same runtime as the pipeline, not on
            // whatever "node" PATH happens to resolve to.
            expect(mockExecFile).toHaveBeenCalledWith(
                process.execPath,
                [resolve("./scripts/build.js")],
                expect.any(Object),
            );
            expect(spyOutput(spies.log())).toContain("done");
            expect(spyOutput(spies.log())).toContain(
                "Script executed successfully.",
            );
        });

        it("should allow more output than the default buffer", async () => {
            // The 1MB default made any talkative script fail with ENOBUFS.
            await action().execute({ scriptPath: "./run.js" });

            const options = mockExecFile.mock.calls[0][2] as {
                maxBuffer: number;
            };
            expect(options.maxBuffer).toBeGreaterThan(1024 * 1024);
        });

        it("should forward extra arguments", async () => {
            await action().execute({
                scriptPath: "./run.js",
                args: ["--flag", "value"],
            });

            expect(mockExecFile).toHaveBeenCalledWith(
                process.execPath,
                [resolve("./run.js"), "--flag", "value"],
                expect.any(Object),
            );
        });

        it("should default the arguments to an empty list", async () => {
            await action().execute({ scriptPath: "./run.js" });
            expect(mockExecFile.mock.calls[0][1]).toEqual([
                resolve("./run.js"),
            ]);
        });

        it("should not fail a successful script that wrote to stderr", async () => {
            // Warnings, progress and Node's own deprecation notices all go to
            // stderr. Treating any of it as failure meant a script that
            // exited 0 still failed the build.
            mockExecFile.mockResolvedValue({
                stdout: "",
                stderr: "ExperimentalWarning: something",
            });

            await expect(
                action().execute({ scriptPath: "./run.js" }),
            ).resolves.toBeUndefined();

            expect(spyOutput(spies.warn())).toContain(
                "ExperimentalWarning: something",
            );
            expect(spyOutput(spies.log())).toContain(
                "Script executed successfully.",
            );
        });

        it("should fail when the process cannot be spawned", async () => {
            mockExecFile.mockRejectedValue(new Error("ENOENT"));

            await expect(
                action().execute({ scriptPath: "./run.js" }),
            ).rejects.toThrow("ENOENT");
            expect(spyOutput(spies.error())).toContain(
                "Error occurred while executing the script",
            );
        });
    });

    // ========================================================================
    // DocumentationAction
    // ========================================================================

    describe("DocumentationAction", () => {
        const action = (): DocumentationAction => new DocumentationAction();

        it("should describe itself", () => {
            expect(action().describe()).toBe(
                "Generates project documentation using a specified tool (e.g., JSDoc, TypeDoc).",
            );
        });

        it("should use jsdoc, ./src and ./docs by default", async () => {
            await action().execute({});

            expect(mockExecFile).toHaveBeenCalledWith(
                "jsdoc",
                [resolve("./src"), "-d", resolve("./docs")],
                expect.any(Object),
            );
            expect(spyOutput(spies.log())).toContain(
                "Generating documentation with jsdoc",
            );
        });

        it("should honour explicit source and output paths", async () => {
            await action().execute({
                generatorCommand: "typedoc",
                sourcePath: "./lib",
                outputPath: "./api",
            });

            expect(mockExecFile).toHaveBeenCalledWith(
                "typedoc",
                [resolve("./lib"), "-d", resolve("./api")],
                expect.any(Object),
            );
        });

        it("should prefer a config file over the source path", async () => {
            await action().execute({
                generatorCommand: "typedoc",
                configPath: "./typedoc.json",
                outputPath: "./api",
            });

            expect(mockExecFile).toHaveBeenCalledWith(
                "typedoc",
                ["-c", resolve("./typedoc.json"), "-d", resolve("./api")],
                expect.any(Object),
            );
            expect(spyOutput(spies.log())).toContain("Config Path:");
        });

        it("should reject an empty generator command", async () => {
            await expect(
                action().execute({ generatorCommand: "" }),
            ).rejects.toThrow(/'generatorCommand' must be specified/);
        });

        it("should not fail a successful run that wrote to stderr", async () => {
            // Every documentation generator reports warnings on stderr — an
            // undocumented export, a broken link. Treating those as fatal
            // failed the step for a run that had actually succeeded.
            mockExecFile.mockResolvedValue({
                stdout: "",
                stderr: "warning: undocumented export",
            });

            await expect(action().execute({})).resolves.toBeUndefined();

            expect(spyOutput(spies.warn())).toContain(
                "warning: undocumented export",
            );
            expect(spyOutput(spies.log())).toContain(
                "Documentation successfully generated at:",
            );
        });

        it("should wrap an Error thrown by the generator", async () => {
            mockExecFile.mockRejectedValue(new Error("command not found"));

            await expect(action().execute({})).rejects.toThrow(
                "Documentation generation failed: command not found",
            );
        });

        it("should wrap a non-Error rejection from the generator", async () => {
            mockExecFile.mockRejectedValue("exit code 9");

            await expect(action().execute({})).rejects.toThrow(
                "Documentation generation failed: exit code 9",
            );
        });
    });
});
