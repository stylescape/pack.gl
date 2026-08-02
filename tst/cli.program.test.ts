// ============================================================================
// CLI Program Tests
// ============================================================================

// `Kist` is mocked so the program can be driven end to end without running a
// pipeline: these tests are about argument handling, command dispatch, and
// what reaches stdout.
const mockPrepare = jest.fn();
const mockRun = jest.fn();

jest.mock("../src/ts/kist", () => ({
    Kist: class {
        prepare = () => mockPrepare();
        run = () => mockRun();
    },
}));

import { mkdtempSync, rmSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createProgram, runCli } from "../src/ts/cli/Program";
import { StepCache } from "../src/ts/core/cache/StepCache";
import { ConfigStore } from "../src/ts/core/config/ConfigStore";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import { SchemaValidator } from "../src/ts/core/validation/SchemaValidator";
import { Logger } from "../src/ts/logger/Logger";
import { VERSION } from "../src/ts/version";
import { silenceConsole, spyOutput } from "./helpers/silence";

class NoopAction extends Action {
    async execute(): Promise<void> {}
}

describe("CLI program", () => {
    const spies = silenceConsole();
    let root: string;
    let originalCwd: string;

    beforeEach(() => {
        mockPrepare.mockReset().mockResolvedValue(undefined);
        mockRun.mockReset().mockResolvedValue(undefined);

        root = mkdtempSync(join(tmpdir(), "kist-program-"));
        originalCwd = process.cwd();
        process.chdir(root);

        ConfigStore.resetInstance();
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        StepCache.resetInstance();
        SchemaValidator.reset();
        ActionRegistry.getInstance().registerAction(NoopAction);
    });

    afterEach(() => {
        process.chdir(originalCwd);
        rmSync(root, { recursive: true, force: true });
        ConfigStore.resetInstance();
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        StepCache.resetInstance();
    });

    /** Writes a kist.yml into the temporary project. */
    function writeConfig(body: string, name = "kist.yml"): string {
        const target = join(root, name);
        writeFileSync(target, body, "utf-8");
        return target;
    }

    /** Runs the CLI with the given arguments. */
    async function cli(...args: string[]): Promise<void> {
        await runCli(["node", "kist", ...args]);
    }

    /** Everything the command wrote to stdout. */
    function stdout(): string {
        return spyOutput(spies.log());
    }

    /**
     * A program that throws instead of calling `process.exit`, so argument
     * errors can be asserted on. Commander applies `exitOverride` per command,
     * so it has to be set on the subcommands too.
     */
    function strictProgram(): ReturnType<typeof createProgram> {
        const program = createProgram().exitOverride();
        program.commands.forEach((command) => command.exitOverride());
        return program;
    }

    const simpleConfig = `
stages:
    - name: build
      steps:
          - name: compile
            action: NoopAction
`;

    // ------------------------------------------------------------------------
    // Program definition
    // ------------------------------------------------------------------------

    describe("definition", () => {
        it("should expose the documented commands", () => {
            const names = createProgram()
                .commands.map((command) => command.name())
                .sort();

            expect(names).toEqual([
                "clear-cache",
                "init",
                "run",
                "schema",
                "validate",
            ]);
        });

        it("should make run the default command", () => {
            const run = createProgram().commands.find(
                (command) => command.name() === "run",
            );
            expect(run?.parent?.commands).toContain(run);
        });

        it("should report the package version", () => {
            expect(createProgram().version()).toBe(VERSION);
        });

        it("should default to process.argv", async () => {
            writeConfig(simpleConfig);
            const original = process.argv;
            process.argv = ["node", "kist", "--dry-run"];

            try {
                await runCli();
                expect(stdout()).toContain("Plan for");
            } finally {
                process.argv = original;
            }
        });
    });

    // ------------------------------------------------------------------------
    // run
    // ------------------------------------------------------------------------

    describe("run", () => {
        it("should run the pipeline when no inspection flag is given", async () => {
            writeConfig(simpleConfig);
            await cli();

            expect(mockRun).toHaveBeenCalledTimes(1);
        });

        it("should run the pipeline for an explicit run command", async () => {
            writeConfig(simpleConfig);
            await cli("run");

            expect(mockRun).toHaveBeenCalledTimes(1);
        });

        it("should read the file named by --config", async () => {
            writeConfig(simpleConfig, "custom.yml");
            await cli("--config", "custom.yml", "--dry-run");

            expect(stdout()).toContain("custom.yml");
        });

        it("should fail when --config names a missing file", async () => {
            await expect(cli("--config", "nope.yml")).rejects.toThrow();
        });

        it("should turn --live into the live options block", async () => {
            writeConfig(simpleConfig);
            await cli("--live", "--dry-run");

            expect(ConfigStore.getInstance().get("options.live.enabled")).toBe(
                true,
            );
        });
    });

    // ------------------------------------------------------------------------
    // Inspection flags
    // ------------------------------------------------------------------------

    describe("--dry-run", () => {
        it("should print the plan instead of running", async () => {
            writeConfig(simpleConfig);
            await cli("--dry-run");

            expect(mockRun).not.toHaveBeenCalled();
            expect(mockPrepare).toHaveBeenCalledTimes(1);
            expect(stdout()).toContain("compile → NoopAction");
        });

        it("should print JSON for --dry json", async () => {
            writeConfig(simpleConfig);
            await cli("--dry", "json");

            const printed = JSON.parse(stdout().slice(stdout().indexOf("{")));
            expect(printed.stages[0].name).toBe("build");
            expect(mockRun).not.toHaveBeenCalled();
        });

        it("should print text for a bare --dry", async () => {
            writeConfig(simpleConfig);
            await cli("--dry");

            expect(stdout()).toContain("Plan for");
        });

        it("should fail when the plan references an unknown action", async () => {
            writeConfig(`
stages:
    - name: build
      steps:
          - name: compile
            action: MissingAction
`);

            await expect(cli("--dry-run")).rejects.toThrow(
                /unknown action\(s\): MissingAction/,
            );
        });
    });

    describe("--graph", () => {
        it("should print DOT by default", async () => {
            writeConfig(simpleConfig);
            await cli("--graph");

            expect(stdout()).toContain("digraph kist {");
            expect(mockRun).not.toHaveBeenCalled();
        });

        it("should print mermaid when asked", async () => {
            writeConfig(simpleConfig);
            await cli("--graph", "mermaid");

            expect(stdout()).toContain("graph TD");
        });

        it("should print both graph and plan when both are requested", async () => {
            writeConfig(simpleConfig);
            await cli("--graph", "--dry-run");

            expect(stdout()).toContain("digraph kist {");
            expect(stdout()).toContain("Plan for");
        });
    });

    // ------------------------------------------------------------------------
    // Logging options
    // ------------------------------------------------------------------------

    describe("logging", () => {
        it("should force debug logging for --verbose", async () => {
            const setLevel = jest.spyOn(Logger.getInstance(), "setLogLevel");
            writeConfig(simpleConfig);

            await cli("--verbose", "--dry-run");

            expect(setLevel).toHaveBeenCalledWith("debug");
        });

        it("should apply an explicit --log-level", async () => {
            const setLevel = jest.spyOn(Logger.getInstance(), "setLogLevel");
            writeConfig(simpleConfig);

            await cli("--log-level", "warn", "--dry-run");

            expect(setLevel).toHaveBeenCalledWith("warn");
        });

        it("should leave the logger alone when no level is configured", async () => {
            writeConfig(simpleConfig);
            const setLevel = jest.spyOn(Logger.getInstance(), "setLogLevel");
            jest.spyOn(ConfigStore.getInstance(), "get").mockReturnValue(
                undefined,
            );

            await cli("--dry-run");

            expect(setLevel).not.toHaveBeenCalled();
        });

        it("should reject a log level outside the allowed set", async () => {
            const program = strictProgram();
            await expect(
                program.parseAsync(["node", "kist", "--log-level", "loud"]),
            ).rejects.toThrow();
        });
    });

    // ------------------------------------------------------------------------
    // Caching options
    // ------------------------------------------------------------------------

    describe("--no-cache", () => {
        it("should turn caching off for the run", async () => {
            writeConfig(`
options:
    cache:
        enabled: true
stages:
    - name: build
      steps:
          - name: compile
            action: NoopAction
            inputs: ["src/**"]
`);

            await cli("--no-cache", "--dry", "json");

            const printed = JSON.parse(stdout().slice(stdout().indexOf("{")));
            expect(printed.cacheEnabled).toBe(false);
        });

        it("should leave caching on by default", async () => {
            writeConfig(`
options:
    cache:
        enabled: true
stages:
    - name: build
      steps:
          - name: compile
            action: NoopAction
`);

            await cli("--dry", "json");

            const printed = JSON.parse(stdout().slice(stdout().indexOf("{")));
            expect(printed.cacheEnabled).toBe(true);
        });
    });

    // ------------------------------------------------------------------------
    // init
    // ------------------------------------------------------------------------

    describe("init", () => {
        it("should create kist.yml and describe what to do next", async () => {
            await cli("init");

            expect(existsSync(join(root, "kist.yml"))).toBe(true);
            expect(stdout()).toContain("Created");
            expect(stdout()).toContain("kist --dry-run");
        });

        it("should write into a named directory", async () => {
            await cli("init", "sub");
            expect(existsSync(join(root, "sub", "kist.yml"))).toBe(true);
        });

        it("should accept a template", async () => {
            await cli("init", "--template", "package");
            expect(existsSync(join(root, "kist.yml"))).toBe(true);
        });

        it("should reject an unknown template", async () => {
            const program = strictProgram();
            await expect(
                program.parseAsync([
                    "node",
                    "kist",
                    "init",
                    "--template",
                    "nope",
                ]),
            ).rejects.toThrow();
        });

        it("should refuse to overwrite without --force", async () => {
            await cli("init");
            await expect(cli("init")).rejects.toThrow(/already exists/);
        });

        it("should overwrite with --force", async () => {
            await cli("init");
            await expect(cli("init", "--force")).resolves.toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // validate
    // ------------------------------------------------------------------------

    describe("validate", () => {
        it("should report the stage and step counts", async () => {
            writeConfig(simpleConfig);
            await cli("validate");

            expect(stdout()).toContain("is valid: 1 stage(s), 1 step(s).");
            expect(mockRun).not.toHaveBeenCalled();
        });

        it("should fail on an unknown action", async () => {
            writeConfig(`
stages:
    - name: build
      steps:
          - name: compile
            action: MissingAction
`);

            await expect(cli("validate")).rejects.toThrow(
                /Unknown action\(s\): MissingAction/,
            );
        });

        it("should fail on a configuration the schema rejects", async () => {
            writeConfig("stagez: []\n");
            await expect(cli("validate")).rejects.toThrow();
        });

        it("should report on the defaults when no file is found", async () => {
            // No kist.yml in the temporary project.
            await cli("validate");

            expect(stdout()).toContain(
                "Configuration is valid: 0 stage(s), 0 step(s).",
            );
        });
    });

    // ------------------------------------------------------------------------
    // schema
    // ------------------------------------------------------------------------

    describe("schema", () => {
        it("should print the schema as JSON", async () => {
            await cli("schema");

            // Sliced from the opening brace: the spy also holds log lines
            // emitted while the registry was being set up.
            const printed = JSON.parse(
                stdout().slice(stdout().indexOf("{\n")),
            );
            expect(printed.$id).toBe("https://www.getkist.com/schema.json");
        });
    });

    // ------------------------------------------------------------------------
    // clear-cache
    // ------------------------------------------------------------------------

    describe("clear-cache", () => {
        it("should clear the step cache and say so", async () => {
            await cli("clear-cache");
            expect(stdout()).toContain("Step cache cleared.");
        });
    });
});
