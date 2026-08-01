// ============================================================================
// PluginManager Tests
// ============================================================================

// `fs` is wrapped rather than replaced: every call hits the real filesystem
// except reads of `mockReaddirFailPath`, which is how the unreadable-scope
// branch is exercised without depending on chmod semantics or the test user.
let mockReaddirFailPath: string | null = null;

jest.mock("fs", () => {
    const actual = jest.requireActual<typeof import("fs")>("fs");
    return {
        ...actual,
        readdirSync: (target: unknown, options: unknown) => {
            if (
                mockReaddirFailPath !== null &&
                String(target) === mockReaddirFailPath
            ) {
                throw Object.assign(new Error("EACCES"), { code: "EACCES" });
            }
            return (actual.readdirSync as (a: unknown, b: unknown) => unknown)(
                target,
                options,
            );
        },
    };
});

import {
    mkdirSync,
    mkdtempSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { ActionPlugin } from "../src/ts/interface/ActionPlugin";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Fixture helpers
// ----------------------------------------------------------------------------

/**
 * Writes a CommonJS plugin module. `body` is the object literal assigned to
 * `module.exports`; it is evaluated by the real module loader when
 * PluginManager dynamically imports the entry point.
 */
function writePlugin(dir: string, entry: string, body: string): void {
    const entryPath = join(dir, entry);
    mkdirSync(join(entryPath, ".."), { recursive: true });
    writeFileSync(entryPath, body, "utf-8");
}

const VALID_PLUGIN_BODY = `
class SamplePluginAction {
    constructor() { this.name = "SamplePluginAction"; }
    async execute() {}
}
module.exports = {
    version: "2.1.0",
    description: "A sample plugin",
    registerActions() { return { SamplePluginAction }; },
};
`;

describe("PluginManager", () => {
    const spies = silenceConsole();
    let root: string;
    let cwdSpy: jest.SpyInstance;

    beforeEach(() => {
        PluginManager.resetInstance();
        mockReaddirFailPath = null;
        root = mkdtempSync(join(tmpdir(), "kist-plugins-"));
        cwdSpy = jest.spyOn(process, "cwd").mockReturnValue(root);
    });

    afterEach(() => {
        PluginManager.resetInstance();
        mockReaddirFailPath = null;
        rmSync(root, { recursive: true, force: true });
    });

    // ------------------------------------------------------------------------
    // Singleton
    // ------------------------------------------------------------------------

    describe("getInstance", () => {
        it("should return the same instance on repeated calls", () => {
            expect(PluginManager.getInstance()).toBe(
                PluginManager.getInstance(),
            );
        });

        it("should create a fresh instance after resetInstance", () => {
            const first = PluginManager.getInstance();
            PluginManager.resetInstance();
            expect(PluginManager.getInstance()).not.toBe(first);
        });
    });

    // ------------------------------------------------------------------------
    // Manual registration
    // ------------------------------------------------------------------------

    describe("registerPlugin", () => {
        class DummyAction {
            public name = "DummyAction";
            async execute(): Promise<void> {}
        }

        const plugin: ActionPlugin = {
            version: "1.2.3",
            description: "Dummy",
            registerActions: () => ({ DummyAction }),
        };

        it("should register the plugin's actions and metadata", () => {
            const manager = PluginManager.getInstance();
            manager.registerPlugin(plugin, "dummy");

            expect(manager.isPluginLoaded("dummy")).toBe(true);
            expect(manager.listPluginActions()).toEqual(["DummyAction"]);
            expect(manager.getPluginActions().get("DummyAction")).toBe(
                DummyAction,
            );
            expect(manager.getPluginMetadata("dummy")).toEqual({
                name: "dummy",
                version: "1.2.3",
                description: "Dummy",
                actions: ["DummyAction"],
            });
            expect(manager.getLoadedPlugins()).toHaveLength(1);
        });

        it("should fall back to 'unknown' version and undefined description", () => {
            const manager = PluginManager.getInstance();
            manager.registerPlugin(
                { registerActions: () => ({ DummyAction }) },
                "bare",
            );
            expect(manager.getPluginMetadata("bare")).toEqual({
                name: "bare",
                version: "unknown",
                description: undefined,
                actions: ["DummyAction"],
            });
        });

        it("should ignore non-string version and description values", () => {
            const manager = PluginManager.getInstance();
            manager.registerPlugin(
                {
                    version: 3 as unknown as string,
                    description: {} as unknown as string,
                    registerActions: () => ({ DummyAction }),
                },
                "odd",
            );
            const metadata = manager.getPluginMetadata("odd");
            expect(metadata?.version).toBe("unknown");
            expect(metadata?.description).toBeUndefined();
        });

        it("should return a defensive copy of the action map", () => {
            const manager = PluginManager.getInstance();
            manager.registerPlugin(plugin, "dummy");
            const actions = manager.getPluginActions();
            actions.delete("DummyAction");
            expect(manager.listPluginActions()).toEqual(["DummyAction"]);
        });

        it("should report unknown plugins as not loaded", () => {
            const manager = PluginManager.getInstance();
            expect(manager.isPluginLoaded("nope")).toBe(false);
            expect(manager.getPluginMetadata("nope")).toBeUndefined();
        });
    });

    describe("clearPlugins", () => {
        it("should drop all plugins and actions", () => {
            class A {
                public name = "A";
                async execute(): Promise<void> {}
            }
            const manager = PluginManager.getInstance();
            manager.registerPlugin({ registerActions: () => ({ A }) }, "p");
            manager.clearPlugins();
            expect(manager.getLoadedPlugins()).toEqual([]);
            expect(manager.listPluginActions()).toEqual([]);
        });
    });

    // ------------------------------------------------------------------------
    // Discovery
    // ------------------------------------------------------------------------

    describe("discoverPlugins", () => {
        it("should log an error when node_modules cannot be read", async () => {
            // `root` intentionally has no node_modules directory.
            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();
            expect(spyOutput(spies.error())).toContain(
                "Failed to discover npm plugins",
            );
            expect(manager.getLoadedPlugins()).toEqual([]);
        });

        it("should load scoped plugins matching the default prefixes", async () => {
            const scoped = join(
                root,
                "node_modules",
                "@getkist",
                "action-demo",
            );
            mkdirSync(scoped, { recursive: true });
            writeFileSync(
                join(scoped, "package.json"),
                JSON.stringify({ main: "index.js" }),
            );
            writePlugin(scoped, "index.js", VALID_PLUGIN_BODY);

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();

            expect(manager.isPluginLoaded("@getkist/action-demo")).toBe(true);
            expect(manager.listPluginActions()).toEqual([
                "SamplePluginAction",
            ]);
            expect(
                manager.getPluginMetadata("@getkist/action-demo")?.version,
            ).toBe("2.1.0");
        });

        it("should load non-scoped plugins matching the default prefixes", async () => {
            const pkg = join(root, "node_modules", "kist-plugin-demo");
            mkdirSync(pkg, { recursive: true });
            writeFileSync(
                join(pkg, "package.json"),
                JSON.stringify({ module: "lib/entry.js" }),
            );
            writePlugin(pkg, "lib/entry.js", VALID_PLUGIN_BODY);

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();

            expect(manager.isPluginLoaded("kist-plugin-demo")).toBe(true);
        });

        it("should ignore plain files and non-matching directories", async () => {
            const nodeModules = join(root, "node_modules");
            mkdirSync(join(nodeModules, "lodash"), { recursive: true });
            writeFileSync(join(nodeModules, "stray.txt"), "not a package");

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();
            expect(manager.getLoadedPlugins()).toEqual([]);
        });

        it("should honour custom plugin prefixes", async () => {
            const pkg = join(root, "node_modules", "custom-thing");
            mkdirSync(pkg, { recursive: true });
            writeFileSync(
                join(pkg, "package.json"),
                JSON.stringify({ main: "index.js" }),
            );
            writePlugin(pkg, "index.js", VALID_PLUGIN_BODY);

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins({ pluginPrefixes: ["custom-"] });
            expect(manager.isPluginLoaded("custom-thing")).toBe(true);
        });

        it("should follow symlinked scoped packages", async () => {
            const real = join(root, "real-plugin");
            mkdirSync(real, { recursive: true });
            writeFileSync(
                join(real, "package.json"),
                JSON.stringify({ main: "index.js" }),
            );
            writePlugin(real, "index.js", VALID_PLUGIN_BODY);

            const scope = join(root, "node_modules", "@getkist");
            mkdirSync(scope, { recursive: true });
            symlinkSync(real, join(scope, "action-linked"), "dir");

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();
            expect(manager.isPluginLoaded("@getkist/action-linked")).toBe(
                true,
            );
        });

        it("should skip scoped entries that do not match the prefix", async () => {
            const scope = join(root, "node_modules", "@getkist");
            mkdirSync(join(scope, "unrelated"), { recursive: true });

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();
            expect(manager.getLoadedPlugins()).toEqual([]);
        });

        it("should log a debug message when a scope directory is unreadable", async () => {
            const nodeModules = join(root, "node_modules");
            const scope = join(nodeModules, "@getkist");
            mkdirSync(scope, { recursive: true });

            mockReaddirFailPath = scope;

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins();

            expect(manager.getLoadedPlugins()).toEqual([]);
            expect(spyOutput(spies.log())).toContain(
                `No scoped plugins found in ${scope}`,
            );
        });
    });

    describe("discoverPlugins with a local plugins path", () => {
        beforeEach(() => {
            mkdirSync(join(root, "node_modules"), { recursive: true });
        });

        it("should load plugins from a local directory", async () => {
            const local = join(root, "plugins", "my-plugin");
            mkdirSync(local, { recursive: true });
            writeFileSync(
                join(local, "package.json"),
                JSON.stringify({ main: "index.js" }),
            );
            writePlugin(local, "index.js", VALID_PLUGIN_BODY);

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins({ localPluginsPath: "plugins" });
            expect(manager.isPluginLoaded("local:my-plugin")).toBe(true);
        });

        it("should ignore files inside the local plugins directory", async () => {
            mkdirSync(join(root, "plugins"), { recursive: true });
            writeFileSync(join(root, "plugins", "readme.md"), "# hi");

            const manager = PluginManager.getInstance();
            await manager.discoverPlugins({ localPluginsPath: "plugins" });
            expect(manager.getLoadedPlugins()).toEqual([]);
        });

        it("should log a debug message when the local path does not exist", async () => {
            const manager = PluginManager.getInstance();
            await manager.discoverPlugins({ localPluginsPath: "missing" });
            expect(spyOutput(spies.log())).toContain(
                "No local plugins found at missing",
            );
        });

        // --------------------------------------------------------------------
        // Entry point resolution, exercised through the local loader
        // --------------------------------------------------------------------

        async function loadLocal(
            name: string,
            packageJson: string | null,
            files: Record<string, string>,
        ): Promise<PluginManager> {
            const dir = join(root, "plugins", name);
            mkdirSync(dir, { recursive: true });
            if (packageJson !== null) {
                writeFileSync(join(dir, "package.json"), packageJson);
            }
            for (const [entry, body] of Object.entries(files)) {
                writePlugin(dir, entry, body);
            }
            const manager = PluginManager.getInstance();
            await manager.discoverPlugins({ localPluginsPath: "plugins" });
            return manager;
        }

        it("should prefer 'module' over 'main'", async () => {
            const manager = await loadLocal(
                "p",
                JSON.stringify({ module: "esm.js", main: "cjs.js" }),
                {
                    "esm.js": VALID_PLUGIN_BODY,
                    "cjs.js": "module.exports = {};",
                },
            );
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should fall back to exports['.'].import", async () => {
            const manager = await loadLocal(
                "p",
                JSON.stringify({ exports: { ".": { import: "e.js" } } }),
                { "e.js": VALID_PLUGIN_BODY },
            );
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should fall back to exports['.'].require", async () => {
            const manager = await loadLocal(
                "p",
                JSON.stringify({ exports: { ".": { require: "r.js" } } }),
                { "r.js": VALID_PLUGIN_BODY },
            );
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should fall back to a string exports['.']", async () => {
            const manager = await loadLocal(
                "p",
                JSON.stringify({ exports: { ".": "s.js" } }),
                { "s.js": VALID_PLUGIN_BODY },
            );
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should fall back to dist/index.js when no entry is declared", async () => {
            const manager = await loadLocal("p", JSON.stringify({}), {
                "dist/index.js": VALID_PLUGIN_BODY,
            });
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should use the directory itself when package.json is absent", async () => {
            const manager = await loadLocal("p", null, {
                "index.js": VALID_PLUGIN_BODY,
            });
            expect(manager.isPluginLoaded("local:p")).toBe(true);
        });

        it("should report a malformed package.json without throwing", async () => {
            const manager = await loadLocal("p", "{ not json", {
                "index.js": VALID_PLUGIN_BODY,
            });
            // The entry point falls back to the plugin directory, which the
            // module loader then also rejects because of the same bad
            // package.json — so the plugin is skipped rather than crashing.
            expect(manager.isPluginLoaded("local:p")).toBe(false);
            expect(spyOutput(spies.warn())).toContain(
                "Failed to parse package.json for local:p",
            );
            expect(spyOutput(spies.error())).toContain(
                "Failed to load plugin local:p",
            );
        });

        it("should warn when the module does not implement ActionPlugin", async () => {
            const manager = await loadLocal("p", JSON.stringify({}), {
                "dist/index.js": "module.exports = { hello: 'world' };",
            });
            expect(manager.isPluginLoaded("local:p")).toBe(false);
            expect(spyOutput(spies.warn())).toContain(
                "does not implement ActionPlugin interface",
            );
        });

        it("should warn when the module exports nothing usable", async () => {
            const manager = await loadLocal("p", JSON.stringify({}), {
                "dist/index.js": "module.exports = null;",
            });
            expect(manager.isPluginLoaded("local:p")).toBe(false);
            expect(spyOutput(spies.warn())).toContain(
                "does not implement ActionPlugin interface",
            );
        });

        it("should log an error when the entry point cannot be imported", async () => {
            const manager = await loadLocal(
                "p",
                JSON.stringify({ main: "nope.js" }),
                {},
            );
            expect(manager.isPluginLoaded("local:p")).toBe(false);
            expect(spyOutput(spies.error())).toContain(
                "Failed to load plugin local:p",
            );
        });

        it("should default missing plugin metadata", async () => {
            const manager = await loadLocal("p", JSON.stringify({}), {
                "dist/index.js": `
                    class X { constructor() { this.name = "X"; } async execute() {} }
                    module.exports = { registerActions() { return { X }; } };
                `,
            });
            expect(manager.getPluginMetadata("local:p")).toEqual({
                name: "local:p",
                version: "unknown",
                description: undefined,
                actions: ["X"],
            });
        });
    });

    it("should read the working directory through process.cwd", async () => {
        await PluginManager.getInstance().discoverPlugins();
        expect(cwdSpy).toHaveBeenCalled();
    });
});
