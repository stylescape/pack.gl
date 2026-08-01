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

            expect(mockExecFile).toHaveBeenCalledWith("node", [
                resolve("./scripts/build.js"),
            ]);
            expect(spyOutput(spies.log())).toContain("done");
            expect(spyOutput(spies.log())).toContain(
                "Script executed successfully.",
            );
        });

        it("should forward extra arguments", async () => {
            await action().execute({
                scriptPath: "./run.js",
                args: ["--flag", "value"],
            });

            expect(mockExecFile).toHaveBeenCalledWith("node", [
                resolve("./run.js"),
                "--flag",
                "value",
            ]);
        });

        it("should default the arguments to an empty list", async () => {
            await action().execute({ scriptPath: "./run.js" });
            expect(mockExecFile.mock.calls[0][1]).toEqual([
                resolve("./run.js"),
            ]);
        });

        it("should fail when the script writes to stderr", async () => {
            mockExecFile.mockResolvedValue({
                stdout: "",
                stderr: "boom",
            });

            await expect(
                action().execute({ scriptPath: "./run.js" }),
            ).rejects.toThrow("boom");

            const errors = spyOutput(spies.error());
            expect(errors).toContain("Script execution failed: boom");
            expect(errors).toContain(
                "Error occurred while executing the script",
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

            expect(mockExecFile).toHaveBeenCalledWith("jsdoc", [
                resolve("./src"),
                "-d",
                resolve("./docs"),
            ]);
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

            expect(mockExecFile).toHaveBeenCalledWith("typedoc", [
                resolve("./lib"),
                "-d",
                resolve("./api"),
            ]);
        });

        it("should prefer a config file over the source path", async () => {
            await action().execute({
                generatorCommand: "typedoc",
                configPath: "./typedoc.json",
                outputPath: "./api",
            });

            expect(mockExecFile).toHaveBeenCalledWith("typedoc", [
                "-c",
                resolve("./typedoc.json"),
                "-d",
                resolve("./api"),
            ]);
            expect(spyOutput(spies.log())).toContain("Config Path:");
        });

        it("should reject an empty generator command", async () => {
            await expect(
                action().execute({ generatorCommand: "" }),
            ).rejects.toThrow(/'generatorCommand' must be specified/);
        });

        it("should fail when the generator writes to stderr", async () => {
            mockExecFile.mockResolvedValue({
                stdout: "",
                stderr: "bad input",
            });

            await expect(action().execute({})).rejects.toThrow(
                "Documentation generation failed: bad input",
            );
            expect(spyOutput(spies.error())).toContain(
                "Documentation generation failed: bad input",
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
