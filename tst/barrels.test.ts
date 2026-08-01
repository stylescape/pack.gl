// ============================================================================
// Public Surface / Barrel Tests
// ============================================================================

import {
    CORE_ACTIONS,
    MIGRATED_ACTIONS,
    MIGRATED_PACKAGES,
} from "../src/ts/config/actions.config";
import * as actionsBarrel from "../src/ts/actions";
import * as abstractBarrel from "../src/ts/core/abstract";
import * as cacheBarrel from "../src/ts/core/cache";
// Imported by its explicit `index` path: `../src/ts/cli` resolves to the
// sibling `cli.ts` CLI entry point (mocked above), not this barrel.
import * as cliBarrel from "../src/ts/cli/index";
import * as configBarrel from "../src/ts/core/config";
import * as coreBarrel from "../src/ts/core";
import * as loggerBarrel from "../src/ts/logger";
import * as pipelineBarrel from "../src/ts/core/pipeline";
import * as progressBarrel from "../src/ts/core/progress";
import * as interfaceBarrel from "../src/ts/interface";
import * as liveBarrel from "../src/ts/live";
import * as publicApi from "../src/ts/index";
import * as typesBarrel from "../src/ts/types";
import * as validationBarrel from "../src/ts/core/validation";
import { silenceConsole } from "./helpers/silence";

/**
 * Reads every own enumerable export so the lazy re-export getters emitted for
 * each barrel are executed. Type-only re-exports legitimately resolve to
 * `undefined` at runtime; the point is that the accessor runs.
 */
function readAllExports(module: object): string[] {
    const keys = Object.keys(module);
    for (const key of keys) {
        void (module as Record<string, unknown>)[key];
    }
    return keys;
}

describe("barrel modules", () => {
    silenceConsole();

    it("should expose the core pipeline and cache classes", () => {
        expect(readAllExports(coreBarrel)).toEqual(
            expect.arrayContaining([
                "Action",
                "Pipeline",
                "PipelineManager",
                "Stage",
                "Step",
                "FileCache",
                "BuildCache",
                "ProgressReporter",
                "createFileProgress",
                "createBuildProgress",
            ]),
        );
        expect(coreBarrel.Pipeline).toBeDefined();
        expect(coreBarrel.BuildCache).toBeDefined();
    });

    it("should expose the cache classes", () => {
        expect(readAllExports(cacheBarrel).sort()).toEqual([
            "BuildCache",
            "FileCache",
        ]);
    });

    it("should expose the progress reporter and its factories", () => {
        expect(readAllExports(progressBarrel).sort()).toEqual([
            "ProgressReporter",
            "createBuildProgress",
            "createFileProgress",
        ]);
        expect(typeof progressBarrel.createFileProgress).toBe("function");
    });

    it("should expose the live reload classes", () => {
        expect(readAllExports(liveBarrel).sort()).toEqual([
            "LiveServer",
            "LiveWatcher",
        ]);
    });

    it("should expose the interface re-exports", () => {
        expect(readAllExports(interfaceBarrel).sort()).toEqual([
            "ActionInterface",
            "ConfigInterface",
            "LiveOptionsInterface",
            "OptionsInterface",
            "StageInterface",
            "StepInterface",
            "StepOptionsInterface",
        ]);
    });

    it("should expose the type re-exports", () => {
        expect(readAllExports(typesBarrel)).toEqual(["ActionOptionsType"]);
    });

    it("should expose the core actions", () => {
        expect(readAllExports(actionsBarrel)).toEqual(
            expect.arrayContaining(["coreActions", ...CORE_ACTIONS]),
        );
        expect(actionsBarrel.FileCopyAction).toBeDefined();
    });

    it("should expose the abstract base classes", () => {
        expect(readAllExports(abstractBarrel).sort()).toEqual([
            "AbstractProcess",
            "AbstractSingleton",
            "AbstractValidator",
        ]);
    });

    it("should expose the configuration classes", () => {
        expect(readAllExports(configBarrel).sort()).toEqual([
            "ConfigLoader",
            "ConfigStore",
            "defaultConfig",
        ]);
    });

    it("should expose the pipeline classes", () => {
        expect(readAllExports(pipelineBarrel).sort()).toEqual([
            "Action",
            "ActionRegistry",
            "Pipeline",
            "PipelineManager",
            "Stage",
            "Step",
        ]);
    });

    it("should expose the validators", () => {
        expect(readAllExports(validationBarrel).sort()).toEqual([
            "ActionValidator",
            "ConfigValidator",
            "OptionsValidator",
            "StageValidator",
            "StepValidator",
        ]);
    });

    it("should expose the logger", () => {
        expect(readAllExports(loggerBarrel).sort()).toEqual([
            "Logger",
            "LoggerStyles",
        ]);
    });

    it("should expose the CLI argument parser", () => {
        expect(readAllExports(cliBarrel)).toEqual(["ArgumentParser"]);
    });
});

describe("public API surface", () => {
    silenceConsole();

    it("should export the Kist entry class and plugin system", () => {
        readAllExports(publicApi);

        expect(publicApi.Kist).toBeDefined();
        expect(publicApi.PluginManager).toBeDefined();
        expect(publicApi.Action).toBeDefined();
        expect(publicApi.ActionRegistry).toBeDefined();
    });

    it("should export the action configuration", () => {
        expect(publicApi.CORE_ACTIONS).toBe(CORE_ACTIONS);
        expect(publicApi.MIGRATED_ACTIONS).toBe(MIGRATED_ACTIONS);
        expect(publicApi.MIGRATED_PACKAGES).toBe(MIGRATED_PACKAGES);
    });

    it("should export every error class and the error codes", () => {
        expect(readAllExports(publicApi)).toEqual(
            expect.arrayContaining([
                "KistError",
                "ConfigError",
                "ConfigNotFoundError",
                "ConfigParseError",
                "ConfigValidationError",
                "BuildError",
                "ActionError",
                "StepError",
                "StageError",
                "PluginError",
                "PluginNotFoundError",
                "PluginInitError",
                "FileSystemError",
                "FileNotFoundError",
                "DirectoryNotFoundError",
                "PermissionError",
                "PathTraversalError",
                "CLIError",
                "InvalidArgumentError",
                "MissingArgumentError",
                "TimeoutError",
                "ResourceLimitError",
                "ErrorCodes",
            ]),
        );
        expect(publicApi.ErrorCodes.CONFIG_ERROR).toBe("CONFIG_ERROR");
        expect(new publicApi.KistError("x", "Y")).toBeInstanceOf(Error);
    });
});

describe("actions configuration", () => {
    it("should list every action shipped in the main package", () => {
        expect([...CORE_ACTIONS]).toEqual([
            "DirectoryCleanAction",
            "DirectoryCopyAction",
            "DirectoryCreateAction",
            "DocumentationAction",
            "FileCopyAction",
            "FileRenameAction",
            "PackageManagerAction",
            "RunScriptAction",
            "TypeScriptCompilerAction",
            "VersionWriteAction",
        ]);
    });

    it("should list every action that moved to a plugin package", () => {
        expect([...MIGRATED_ACTIONS]).toEqual([
            "StyleProcessingAction",
            "JavaScriptMinifyAction",
            "SvgPackagerAction",
            "SvgReaderAction",
            "SvgSpriteAction",
            "SvgToPngAction",
            "LintAction",
            "TemplateRenderAction",
        ]);
    });

    it("should map every migrated action to its package", () => {
        expect(Object.keys(MIGRATED_PACKAGES).sort()).toEqual(
            [...MIGRATED_ACTIONS].sort(),
        );

        for (const action of MIGRATED_ACTIONS) {
            const entry = MIGRATED_PACKAGES[action];
            expect(entry.package).toMatch(/^@getkist\/action-/);
            expect(entry.npm).toBe(`npm install --save-dev ${entry.package}`);
            expect(entry.github).toMatch(
                /^https:\/\/github\.com\/getkist\/kist-action-/,
            );
        }
    });

    it("should route every SVG action to the same package", () => {
        for (const action of [
            "SvgPackagerAction",
            "SvgReaderAction",
            "SvgSpriteAction",
            "SvgToPngAction",
        ] as const) {
            expect(MIGRATED_PACKAGES[action].package).toBe(
                "@getkist/action-svg",
            );
        }
    });
});
