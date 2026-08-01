// ============================================================================
// ConfigLoader Tests
// ============================================================================

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { ConfigLoader } from "../src/ts/core/config/ConfigLoader";
import { silenceConsole, spyOutput } from "./helpers/silence";

describe("ConfigLoader", () => {
    const spies = silenceConsole();
    let root: string;
    let originalArgv: string[];

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-config-"));
        originalArgv = process.argv;
        process.argv = ["node", "cli.js"];
        jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        process.argv = originalArgv;
        rmSync(root, { recursive: true, force: true });
    });

    /** Writes a YAML file relative to the fake working directory. */
    function writeConfig(name: string, contents: string): string {
        const filePath = join(root, name);
        mkdirSync(join(filePath, ".."), { recursive: true });
        writeFileSync(filePath, contents, "utf-8");
        return filePath;
    }

    /** Sets the CLI arguments seen by the parser inside ConfigLoader. */
    function setArgv(...args: string[]): void {
        process.argv = ["node", "cli.js", ...args];
    }

    // ------------------------------------------------------------------------
    // initialize
    // ------------------------------------------------------------------------

    describe("initialize", () => {
        it("should find kist.yaml in the working directory", async () => {
            writeConfig("kist.yaml", "stages: []\n");
            const loader = new ConfigLoader();
            await loader.initialize();
            expect(spyOutput(spies.log())).toContain(
                "Configuration file found",
            );
        });

        it("should fall through to kist.yml", async () => {
            writeConfig("kist.yml", "stages: []\n");
            const loader = new ConfigLoader();
            await loader.initialize();
            expect(await loader.loadConfig()).toEqual({ stages: [] });
        });

        it("should warn when no configuration file exists", async () => {
            const loader = new ConfigLoader();
            await loader.initialize();
            expect(spyOutput(spies.warn())).toContain(
                "No configuration file found. Proceeding with default settings.",
            );
        });

        it("should honour an explicit --config path", async () => {
            writeConfig("custom/other.yml", "stages: []\n");
            setArgv("--config", "custom/other.yml");

            const loader = new ConfigLoader();
            await loader.initialize();
            expect(spyOutput(spies.log())).toContain(
                "from --config=custom/other.yml",
            );
            expect(await loader.loadConfig()).toEqual({ stages: [] });
        });

        it("should throw when an explicit --config path is missing", async () => {
            setArgv("--config", "nope.yml");
            const loader = new ConfigLoader();
            await expect(loader.initialize()).rejects.toThrow(
                /Configuration file not found/,
            );
        });

        it("should ignore a boolean --config flag", async () => {
            writeConfig("kist.yaml", "stages: []\n");
            setArgv("--config");

            const loader = new ConfigLoader();
            await loader.initialize();
            expect(await loader.loadConfig()).toEqual({ stages: [] });
        });
    });

    // ------------------------------------------------------------------------
    // loadConfig
    // ------------------------------------------------------------------------

    describe("loadConfig", () => {
        it("should return an empty configuration when initialize found nothing", async () => {
            const loader = new ConfigLoader();
            await loader.initialize();
            expect(await loader.loadConfig()).toEqual({ stages: [] });
            expect(spyOutput(spies.warn())).toContain(
                "Using default configuration",
            );
        });

        it("should parse a configuration file", async () => {
            writeConfig(
                "kist.yaml",
                [
                    "metadata:",
                    "    name: demo",
                    "options:",
                    "    logLevel: debug",
                    "stages:",
                    "    - name: build",
                    "      steps:",
                    "          - name: copy",
                    "            action: FileCopyAction",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.metadata?.name).toBe("demo");
            expect(config.options?.logLevel).toBe("debug");
            expect(config.stages).toHaveLength(1);
        });

        it("should reject a configuration file with invalid YAML", async () => {
            writeConfig("kist.yaml", "stages: [\n  broken");
            const loader = new ConfigLoader();
            await loader.initialize();

            await expect(loader.loadConfig()).rejects.toThrow(
                /Failed to parse configuration/,
            );
        });

        it("should reject a configuration whose stages are not an array", async () => {
            writeConfig("kist.yaml", "stages: nope\n");
            const loader = new ConfigLoader();
            await loader.initialize();

            await expect(loader.loadConfig()).rejects.toThrow(
                /'stages' must be an array/,
            );
            expect(spyOutput(spies.error())).toContain(
                "Failed to load configuration",
            );
        });

        it("should reject a configuration file that cannot be read", async () => {
            const configPath = writeConfig("kist.yaml", "stages: []\n");
            const loader = new ConfigLoader();
            await loader.initialize();
            rmSync(configPath);

            await expect(loader.loadConfig()).rejects.toThrow(
                /Failed to load configuration/,
            );
        });
    });

    // ------------------------------------------------------------------------
    // Inheritance
    // ------------------------------------------------------------------------

    describe("configuration inheritance", () => {
        it("should merge a single parent configuration", async () => {
            writeConfig(
                "base.yml",
                [
                    "metadata:",
                    "    name: base",
                    "    author: kist",
                    "options:",
                    "    logLevel: info",
                    "stages:",
                    "    - name: build",
                    "      steps:",
                    "          - name: one",
                    "            action: FileCopyAction",
                    "",
                ].join("\n"),
            );
            writeConfig(
                "kist.yaml",
                [
                    'extends: "./base.yml"',
                    "metadata:",
                    "    name: child",
                    "stages: []",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.metadata).toEqual({ name: "child", author: "kist" });
            expect(config.options?.logLevel).toBe("info");
            expect(config.stages.map((stage) => stage.name)).toEqual([
                "build",
            ]);
            expect(config.extends).toBeUndefined();
        });

        it("should merge several parents in order", async () => {
            writeConfig("a.yml", "options:\n    logLevel: info\nstages: []\n");
            writeConfig(
                "b.yml",
                "options:\n    logLevel: warn\n    configPath: b\nstages: []\n",
            );
            writeConfig(
                "kist.yaml",
                [
                    "extends:",
                    '    - "./a.yml"',
                    '    - "./b.yml"',
                    "stages: []",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.options?.logLevel).toBe("warn");
            expect(config.options?.configPath).toBe("b");
        });

        it("should let a child stage replace a parent stage of the same name", async () => {
            writeConfig(
                "base.yml",
                [
                    "stages:",
                    "    - name: build",
                    "      steps:",
                    "          - name: parent-step",
                    "            action: FileCopyAction",
                    "    - name: docs",
                    "      steps:",
                    "          - name: docs-step",
                    "            action: DocumentationAction",
                    "",
                ].join("\n"),
            );
            writeConfig(
                "kist.yaml",
                [
                    'extends: "./base.yml"',
                    "stages:",
                    "    - name: build",
                    "      steps:",
                    "          - name: child-step",
                    "            action: FileRenameAction",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.stages.map((stage) => stage.name)).toEqual([
                "docs",
                "build",
            ]);
            expect(config.stages[1].steps[0].name).toBe("child-step");
        });

        it("should deep-merge nested option objects", async () => {
            writeConfig(
                "base.yml",
                [
                    "options:",
                    "    live:",
                    "        port: 3000",
                    "        root: public",
                    "stages: []",
                    "",
                ].join("\n"),
            );
            writeConfig(
                "kist.yaml",
                [
                    'extends: "./base.yml"',
                    "options:",
                    "    live:",
                    "        port: 4000",
                    "stages: []",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.options?.live).toEqual({
                port: 4000,
                root: "public",
            });
        });

        it("should overwrite arrays rather than merging them", async () => {
            writeConfig(
                "base.yml",
                [
                    "options:",
                    "    live:",
                    "        watchPaths:",
                    "            - a",
                    "            - b",
                    "stages: []",
                    "",
                ].join("\n"),
            );
            writeConfig(
                "kist.yaml",
                [
                    'extends: "./base.yml"',
                    "options:",
                    "    live:",
                    "        watchPaths:",
                    "            - c",
                    "stages: []",
                    "",
                ].join("\n"),
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.options?.live?.watchPaths).toEqual(["c"]);
        });

        it("should drop metadata entirely when neither side defines any", async () => {
            writeConfig(
                "base.yml",
                "options:\n    logLevel: info\nstages: []\n",
            );
            writeConfig("kist.yaml", 'extends: "./base.yml"\nstages: []\n');

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.metadata).toBeUndefined();
        });

        it("should treat a parent without stages or options as empty", async () => {
            writeConfig("base.yml", "metadata:\n    name: base\n");
            writeConfig("kist.yaml", 'extends: "./base.yml"\nstages: []\n');

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.metadata).toEqual({ name: "base" });
            expect(config.stages).toEqual([]);
        });

        it("should inherit the parent's stages when the child declares none", async () => {
            writeConfig(
                "base.yml",
                [
                    "stages:",
                    "    - name: build",
                    "      steps:",
                    "          - name: one",
                    "            action: FileCopyAction",
                    "",
                ].join("\n"),
            );
            writeConfig(
                "kist.yaml",
                'extends: "./base.yml"\nmetadata:\n    name: child\n',
            );

            const loader = new ConfigLoader();
            await loader.initialize();
            const config = await loader.loadConfig();

            expect(config.stages.map((stage) => stage.name)).toEqual([
                "build",
            ]);
        });

        it("should reject circular inheritance", async () => {
            writeConfig("kist.yaml", 'extends: "./loop.yml"\nstages: []\n');
            writeConfig("loop.yml", 'extends: "./kist.yaml"\nstages: []\n');

            const loader = new ConfigLoader();
            await loader.initialize();
            await expect(loader.loadConfig()).rejects.toThrow(
                /Circular config inheritance detected/,
            );
        });

        it("should reset inheritance tracking between loads", async () => {
            writeConfig("base.yml", "stages: []\n");
            writeConfig("kist.yaml", 'extends: "./base.yml"\nstages: []\n');

            const loader = new ConfigLoader();
            await loader.initialize();
            await loader.loadConfig();
            await expect(loader.loadConfig()).resolves.toEqual(
                expect.objectContaining({ stages: [] }),
            );
        });
    });
});
