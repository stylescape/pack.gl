// ============================================================================
// Coverage for recently added error-handling paths
// ============================================================================

import {
    mkdirSync,
    mkdtempSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Step } from "../src/ts/core/pipeline/Step";
import { ConfigLoader } from "../src/ts/core/config/ConfigLoader";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import { BuildError } from "../src/ts/errors/index";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Step: KistError pass-through
// ----------------------------------------------------------------------------

/** Throws a KistError subclass, which Step must propagate unwrapped. */
class KistErrorAction extends Action {
    async execute(): Promise<void> {
        throw new BuildError("already a kist error");
    }
}

/** Throws a non-Error value, which Step must stringify when wrapping. */
class NonErrorAction extends Action {
    async execute(): Promise<void> {
        throw "a bare string failure";
    }
}

describe("Step error propagation", () => {
    silenceConsole();

    beforeEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        const registry = ActionRegistry.getInstance();
        registry.registerAction(KistErrorAction);
        registry.registerAction(NonErrorAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    it("should rethrow a KistError without wrapping it", async () => {
        const step = new Step({
            name: "boom",
            action: "KistErrorAction" as unknown as StepInterface["action"],
        });

        await expect(step.execute()).rejects.toThrow(BuildError);
        await expect(step.execute()).rejects.toThrow("already a kist error");
    });

    it("should stringify a non-Error failure when wrapping it", async () => {
        const step = new Step({
            name: "bare",
            action: "NonErrorAction" as unknown as StepInterface["action"],
        });

        await expect(step.execute()).rejects.toThrow(
            'Action "NonErrorAction" failed: a bare string failure',
        );
    });
});

// ----------------------------------------------------------------------------
// ConfigLoader: YAML parse failures
// ----------------------------------------------------------------------------

describe("ConfigLoader YAML parsing", () => {
    const spies = silenceConsole();
    let root: string;
    let originalArgv: string[];

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), "kist-yaml-"));
        originalArgv = process.argv;
        process.argv = ["node", "cli.js"];
        jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        process.argv = originalArgv;
        rmSync(root, { recursive: true, force: true });
    });

    it("should report malformed YAML as a parse error", async () => {
        writeFileSync(
            join(root, "kist.yaml"),
            "stages:\n  - name: a\n   bad-indent: true\n",
            "utf-8",
        );

        const loader = new ConfigLoader();
        await loader.initialize();

        await expect(loader.loadConfig()).rejects.toThrow(
            /Failed to parse configuration/,
        );
        expect(spyOutput(spies.error())).toContain(
            "Failed to load configuration",
        );
    });

    it("should report a validation failure with no config path", () => {
        // `loadConfig` returns early when no config file was located, so the
        // `configPath ?? undefined` fallback is only reachable directly.
        const loader = new ConfigLoader() as unknown as {
            validateConfig: (config: unknown) => void;
        };

        expect(() =>
            loader.validateConfig({ stages: "not-an-array" }),
        ).toThrow(/'stages' must be an array/);
    });
});

// ----------------------------------------------------------------------------
// PluginManager: scoped symlinks and malformed manifests
// ----------------------------------------------------------------------------

describe("PluginManager edge cases", () => {
    const spies = silenceConsole();
    let root: string;

    beforeEach(() => {
        PluginManager.resetInstance();
        root = mkdtempSync(join(tmpdir(), "kist-pm-"));
        jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        PluginManager.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    const PLUGIN_BODY = `
class EdgeAction { constructor() { this.name = "EdgeAction"; } async execute() {} }
module.exports = { registerActions() { return { EdgeAction }; } };
`;

    it("should skip a scoped entry that is a symlink to a file", async () => {
        const scope = join(root, "node_modules", "@getkist");
        mkdirSync(scope, { recursive: true });
        const target = join(root, "plain-file.js");
        writeFileSync(target, "// not a package", "utf-8");
        symlinkSync(target, join(scope, "action-linked-file"));

        const manager = PluginManager.getInstance();
        await manager.discoverPlugins();

        expect(manager.getLoadedPlugins()).toEqual([]);
    });

    it("should report the reason a package.json could not be parsed", async () => {
        const local = join(root, "plugins", "broken-manifest");
        mkdirSync(local, { recursive: true });
        writeFileSync(join(local, "package.json"), "{ not json", "utf-8");
        writeFileSync(join(local, "index.js"), PLUGIN_BODY, "utf-8");
        mkdirSync(join(root, "node_modules"), { recursive: true });

        const manager = PluginManager.getInstance();
        await manager.discoverPlugins({ localPluginsPath: "plugins" });

        expect(spyOutput(spies.warn())).toContain(
            "Failed to parse package.json for local:broken-manifest:",
        );
    });
});
