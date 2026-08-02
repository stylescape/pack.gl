// ============================================================================
// ConfigStore Tests
// ============================================================================

import type { ConfigStore as ConfigStoreClass } from "../src/ts/core/config/ConfigStore";

/**
 * ConfigStore holds a process-wide singleton whose backing object is the
 * shared `defaultConfig` literal, and `merge`/`set` mutate it in place. Each
 * test therefore starts from a freshly evaluated module graph.
 */
function freshStore(
    logLevel: "debug" | "info" | "warn" | "error" = "debug",
): ConfigStoreClass {
    jest.resetModules();
    const { Logger } =
        require("../src/ts/logger/Logger") as typeof import("../src/ts/logger/Logger");
    Logger.resetInstance();
    Logger.getInstance(logLevel);
    const { ConfigStore } =
        require("../src/ts/core/config/ConfigStore") as typeof import("../src/ts/core/config/ConfigStore");
    return ConfigStore.getInstance();
}

describe("ConfigStore", () => {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const output = (spy: jest.SpyInstance): string =>
        spy.mock.calls.map((call) => call.join(" ")).join("\n");

    // ------------------------------------------------------------------------
    // Singleton
    // ------------------------------------------------------------------------

    describe("getInstance", () => {
        it("should return the same instance on repeated calls", () => {
            jest.resetModules();
            const { ConfigStore } =
                require("../src/ts/core/config/ConfigStore") as typeof import("../src/ts/core/config/ConfigStore");
            expect(ConfigStore.getInstance()).toBe(ConfigStore.getInstance());
        });

        it("should seed the store with the default configuration", () => {
            const store = freshStore();
            expect(store.get<string>("metadata.name")).toBe("kist pipeline");
            expect(store.get<number>("options.live.port")).toBe(3000);
            expect(store.getConfig().stages).toEqual([]);
        });
    });

    // ------------------------------------------------------------------------
    // get
    // ------------------------------------------------------------------------

    describe("get", () => {
        it("should resolve a top-level key", () => {
            const store = freshStore();
            expect(store.get("stages")).toEqual([]);
        });

        it("should resolve a deeply nested key", () => {
            const store = freshStore();
            expect(
                store.get<number>("options.pipeline.retryStrategy.delay"),
            ).toBe(1000);
        });

        it("should return undefined for a missing key", () => {
            const store = freshStore();
            expect(store.get("nope")).toBeUndefined();
        });

        it("should return undefined when an intermediate key is missing", () => {
            const store = freshStore();
            expect(store.get("nope.deeper.still")).toBeUndefined();
        });

        it("should log a debug message on a successful lookup", () => {
            const store = freshStore("debug");
            store.get("stages");
            expect(output(logSpy)).toContain(
                'Configuration key "stages" retrieved',
            );
        });
    });

    // ------------------------------------------------------------------------
    // set
    // ------------------------------------------------------------------------

    describe("set", () => {
        it("should set a top-level key", () => {
            const store = freshStore();
            store.set("mode", "production");
            expect(store.get("mode")).toBe("production");
        });

        it("should set a nested key on an existing object", () => {
            const store = freshStore();
            store.set("options.logLevel", "warn");
            expect(store.get("options.logLevel")).toBe("warn");
        });

        it("should create intermediate objects that do not exist", () => {
            const store = freshStore();
            store.set("brand.new.path", 42);
            expect(store.get("brand.new.path")).toBe(42);
        });

        it("should replace a non-object intermediate value", () => {
            const store = freshStore();
            store.set("scalar", "text");
            store.set("scalar.nested", 1);
            expect(store.get("scalar.nested")).toBe(1);
        });

        it("should refuse to write through a polluting intermediate key", () => {
            const store = freshStore();
            store.set("__proto__.polluted", "bad");
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
            expect(output(warnSpy)).toContain(
                'Attempted prototype pollution detected: "__proto__"',
            );
        });

        it("should refuse to write a polluting final key", () => {
            const store = freshStore();
            store.set("constructor", "bad");
            expect(store.get("constructor")).not.toBe("bad");
            expect(output(warnSpy)).toContain(
                'Attempted prototype pollution detected: "constructor"',
            );
        });

        it("should refuse a polluting 'prototype' key", () => {
            const store = freshStore();
            store.set("prototype", "bad");
            expect(output(warnSpy)).toContain(
                'Attempted prototype pollution detected: "prototype"',
            );
        });

        it("should log a debug message describing the write", () => {
            const store = freshStore("debug");
            store.set("mode", "production");
            expect(output(logSpy)).toContain(
                'Set configuration key "mode" to: "production"',
            );
        });
    });

    // ------------------------------------------------------------------------
    // merge
    // ------------------------------------------------------------------------

    describe("merge", () => {
        it("should overwrite scalar values", () => {
            const store = freshStore();
            store.merge({ options: { logLevel: "error" } });
            expect(store.get("options.logLevel")).toBe("error");
        });

        it("should preserve untouched nested values", () => {
            const store = freshStore();
            store.merge({ options: { live: { port: 4000 } } });
            expect(store.get("options.live.port")).toBe(4000);
            expect(store.get("options.live.root")).toBe("public");
        });

        it("should replace arrays rather than merging them", () => {
            const store = freshStore();
            store.merge({
                options: { live: { watchPaths: ["only/**/*"] } },
            });
            expect(store.get("options.live.watchPaths")).toEqual([
                "only/**/*",
            ]);
        });

        it("should add keys that do not exist on the target", () => {
            const store = freshStore();
            store.merge({ brandNew: { nested: 1 } } as never);
            expect(store.get("brandNew.nested")).toBe(1);
        });

        it("should replace a non-object target value with a merged object", () => {
            const store = freshStore();
            store.set("scalar", "text");
            store.merge({ scalar: { nested: 1 } } as never);
            expect(store.get("scalar.nested")).toBe(1);
        });

        it("should return the source when the target branch is null", () => {
            const store = freshStore();
            store.set("nullable", null);
            store.merge({ nullable: { nested: 1 } } as never);
            expect(store.get("nullable.nested")).toBe(1);
        });

        it("should skip unsafe keys during a merge", () => {
            const store = freshStore();
            store.merge(
                JSON.parse('{"__proto__": {"polluted": "bad"}}') as never,
            );
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
            expect(output(warnSpy)).toContain(
                'Skipping unsafe key during merge: "__proto__"',
            );
        });

        it("should skip unsafe 'constructor' and 'prototype' keys", () => {
            const store = freshStore();
            store.merge({ constructor: 1, prototype: 2 } as never);
            expect(output(warnSpy)).toContain(
                'Skipping unsafe key during merge: "constructor"',
            );
            expect(output(warnSpy)).toContain(
                'Skipping unsafe key during merge: "prototype"',
            );
        });
    });

    // ------------------------------------------------------------------------
    // Misc
    // ------------------------------------------------------------------------

    describe("getConfig", () => {
        it("should expose the live configuration object", () => {
            const store = freshStore();
            store.set("mode", "test");
            expect(store.getConfig()).toMatchObject({ mode: "test" });
        });
    });

    describe("print", () => {
        it("should write the configuration to the console", () => {
            const store = freshStore();
            store.print();
            expect(logSpy).toHaveBeenCalledWith(
                "Current Configuration:",
                expect.stringContaining('"stages"'),
            );
        });
    });
});

describe("defaultConfig", () => {
    it("should describe a kist pipeline with no stages", () => {
        jest.resetModules();
        const { defaultConfig } =
            require("../src/ts/core/config/defaultConfig") as typeof import("../src/ts/core/config/defaultConfig");

        expect(defaultConfig.stages).toEqual([]);
        expect(defaultConfig.metadata?.name).toBe("kist pipeline");
        expect(defaultConfig.metadata?.license).toBe("MIT");
        expect(defaultConfig.metadata?.timestamp).toEqual(expect.any(String));
        expect(defaultConfig.options?.logLevel).toBe("info");
        expect(defaultConfig.options?.live?.enabled).toBe(false);
    });
});
