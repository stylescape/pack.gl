// ============================================================================
// Validation Tests
// ============================================================================

import type { ConfigInterface } from "../src/ts/interface/ConfigInterface";
import type { StageInterface } from "../src/ts/interface/StageInterface";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { ActionValidator } from "../src/ts/core/validation/ActionValidator";
import { ConfigValidator } from "../src/ts/core/validation/ConfigValidator";
import { OptionsValidator } from "../src/ts/core/validation/OptionsValidator";
import { StageValidator } from "../src/ts/core/validation/StageValidator";
import { StepValidator } from "../src/ts/core/validation/StepValidator";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import { silenceConsole } from "./helpers/silence";

/**
 * Builds a step definition in the shape StepValidator expects: an `action`
 * object carrying the registered action's `name`.
 *
 * Note: `Step` resolves actions with `String(step.action)`, so YAML configs
 * use a bare string, which the validator also accepts.
 */
function makeStep(name: string, action: string): StepInterface {
    return {
        name,
        action: { name: action } as unknown as StepInterface["action"],
    };
}

describe("validation", () => {
    silenceConsole();

    beforeEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    // ------------------------------------------------------------------------
    // ActionValidator
    // ------------------------------------------------------------------------

    describe("ActionValidator", () => {
        it("should accept a registered core action", () => {
            const validator = new ActionValidator();
            expect(() =>
                validator.validate({ action: "FileCopyAction" }),
            ).not.toThrow();
        });

        it("should reject an empty action name", () => {
            const validator = new ActionValidator();
            expect(() => validator.validate({ action: "" })).toThrow(
                /Action name must be a non-empty string/,
            );
        });

        it("should reject a non-string action name", () => {
            const validator = new ActionValidator();
            expect(() =>
                validator.validate({
                    action: 42 as unknown as string,
                }),
            ).toThrow(/Action name must be a non-empty string/);
        });

        it("should reject an action that is not in the registry", () => {
            const validator = new ActionValidator();
            expect(() =>
                validator.validate({ action: "GhostAction" }),
            ).toThrow(/is not registered in the ActionRegistry/);
        });

        it("should validate the 'action' property through validateProperty", () => {
            const validator = new ActionValidator();
            expect(() =>
                validator.validate({ action: "FileCopyAction" }),
            ).not.toThrow();
            // Exercised via the AbstractValidator contract.
            const asBase = validator as unknown as {
                validateProperty: (key: string, value: string) => void;
            };
            expect(() =>
                asBase.validateProperty("action", "FileCopyAction"),
            ).not.toThrow();
        });

        it("should reject an unknown property key", () => {
            const validator = new ActionValidator() as unknown as {
                validateProperty: (key: string, value: string) => void;
            };
            expect(() => validator.validateProperty("nope", "x")).toThrow(
                /Unknown property key: "nope"/,
            );
        });
    });

    // ------------------------------------------------------------------------
    // StepValidator
    // ------------------------------------------------------------------------

    describe("StepValidator", () => {
        it("should accept a well-formed step", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validate(makeStep("copy", "FileCopyAction")),
            ).not.toThrow();
        });

        it("should validate optional step options", () => {
            const validator = new StepValidator();
            const step = makeStep("copy", "FileCopyAction");
            step.options = { description: "copies things", enabled: true };
            expect(() => validator.validate(step)).not.toThrow();
        });

        it("should reject an empty step name", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validate(makeStep("", "FileCopyAction")),
            ).toThrow(/non-empty 'name' property/);
        });

        it("should reject a whitespace-only step name", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validate(makeStep("   ", "FileCopyAction")),
            ).toThrow(/non-empty 'name' property/);
        });

        it("should reject a non-string step name", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validate(
                    makeStep(7 as unknown as string, "FileCopyAction"),
                ),
            ).toThrow(/non-empty 'name' property/);
        });

        it("should reject a missing action", () => {
            const validator = new StepValidator();
            const step = { name: "copy" } as StepInterface;
            expect(() => validator.validate(step)).toThrow(
                /valid 'action' name/,
            );
        });

        it("should reject an action without a name", () => {
            const validator = new StepValidator();
            const step = {
                name: "copy",
                action: {} as StepInterface["action"],
            };
            expect(() => validator.validate(step)).toThrow(
                /valid 'action' name/,
            );
        });

        it("should reject an action whose name is blank", () => {
            const validator = new StepValidator();
            const step = {
                name: "copy",
                action: { name: "  " } as StepInterface["action"],
            };
            expect(() => validator.validate(step)).toThrow(
                /valid 'action' name/,
            );
        });

        it("should accept a registered bare string action", () => {
            const validator = new StepValidator();
            const step = {
                name: "copy",
                action: "FileCopyAction",
            };
            expect(() => validator.validate(step)).not.toThrow();
        });

        it("should reject a blank string action", () => {
            const validator = new StepValidator();
            const step = { name: "copy", action: "   " };
            expect(() => validator.validate(step)).toThrow(
                /valid 'action' name/,
            );
        });

        it("should surface a failure from the action validator", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validate(makeStep("copy", "GhostAction")),
            ).toThrow(/not registered in the ActionRegistry/);
        });

        it("should reject an unknown property key", () => {
            const validator = new StepValidator();
            expect(() =>
                validator.validateProperty(
                    "timeout" as keyof StepInterface,
                    1 as never,
                ),
            ).toThrow(/Unknown key provided for validation/);
        });

        describe("options validation", () => {
            const validate = (options: unknown): void => {
                const validator = new StepValidator();
                validator.validateProperty(
                    "options",
                    options as StepInterface["options"],
                );
            };

            it("should reject null options", () => {
                expect(() => validate(null)).toThrow(
                    /but 'null' was provided/,
                );
            });

            it("should reject array options", () => {
                expect(() => validate([1, 2])).toThrow(
                    /conforming to StepOptionsInterface/,
                );
            });

            it("should reject a non-object options value", () => {
                expect(() => validate("nope")).toThrow(
                    /conforming to StepOptionsInterface/,
                );
            });

            it("should accept undefined options", () => {
                expect(() => validate(undefined)).not.toThrow();
            });

            it("should accept an empty options object", () => {
                expect(() => validate({})).not.toThrow();
            });

            it("should reject a non-string description", () => {
                expect(() => validate({ description: 5 })).toThrow(
                    /must be a string/,
                );
            });

            it("should allow an undefined description", () => {
                expect(() =>
                    validate({ description: undefined }),
                ).not.toThrow();
            });

            it("should reject a non-boolean enabled flag", () => {
                expect(() => validate({ enabled: "yes" })).toThrow(
                    /must be a boolean/,
                );
            });

            it("should allow an undefined enabled flag", () => {
                expect(() => validate({ enabled: undefined })).not.toThrow();
            });

            it("should log and accept unrecognised custom keys", () => {
                expect(() => validate({ custom: "value" })).not.toThrow();
            });
        });
    });

    // ------------------------------------------------------------------------
    // StageValidator
    // ------------------------------------------------------------------------

    describe("StageValidator", () => {
        const stage = (
            over: Partial<StageInterface> = {},
        ): StageInterface => ({
            name: "build",
            steps: [makeStep("copy", "FileCopyAction")],
            ...over,
        });

        it("should accept a well-formed stage", () => {
            expect(() => new StageValidator().validate(stage())).not.toThrow();
        });

        it("should reject an empty stage name", () => {
            expect(() =>
                new StageValidator().validate(stage({ name: "" })),
            ).toThrow(/valid 'name' property/);
        });

        it("should reject a non-string stage name", () => {
            expect(() =>
                new StageValidator().validate(
                    stage({ name: 1 as unknown as string }),
                ),
            ).toThrow(/valid 'name' property/);
        });

        it("should reject a duplicate stage name", () => {
            const validator = new StageValidator();
            validator.validate(stage());
            expect(() => validator.validate(stage())).toThrow(
                /Duplicate stage name found: "build"/,
            );
        });

        it("should accept dependencies on already-validated stages", () => {
            const validator = new StageValidator();
            validator.validate(stage({ name: "first" }));
            expect(() =>
                validator.validate(
                    stage({ name: "second", dependsOn: ["first"] }),
                ),
            ).not.toThrow();
        });

        it("should reject a dependency on an unknown stage", () => {
            expect(() =>
                new StageValidator().validate(
                    stage({ dependsOn: ["missing"] }),
                ),
            ).toThrow(/Undefined dependency: "missing"/);
        });

        it("should reject non-array dependencies", () => {
            expect(() =>
                new StageValidator().validate(
                    stage({ dependsOn: "first" as unknown as string[] }),
                ),
            ).toThrow("Stage dependencies must be an array.");
        });

        it("should accept a stage with no dependencies", () => {
            expect(() =>
                new StageValidator().validate(stage({ dependsOn: undefined })),
            ).not.toThrow();
        });

        it("should reject an empty step list", () => {
            expect(() =>
                new StageValidator().validate(stage({ steps: [] })),
            ).toThrow(/at least one step/);
        });

        it("should reject a non-array step list", () => {
            expect(() =>
                new StageValidator().validate(
                    stage({
                        steps: "nope" as unknown as StepInterface[],
                    }),
                ),
            ).toThrow(/at least one step/);
        });

        it("should reject duplicate step names within a stage", () => {
            expect(() =>
                new StageValidator().validate(
                    stage({
                        steps: [
                            makeStep("copy", "FileCopyAction"),
                            makeStep("copy", "FileRenameAction"),
                        ],
                    }),
                ),
            ).toThrow(/Duplicate step name found in stage: "copy"/);
        });

        it("should reject an unknown property key", () => {
            expect(() =>
                new StageValidator().validateProperty(
                    "timeout" as keyof StageInterface,
                    1 as never,
                ),
            ).toThrow(/Unknown property provided for validation/);
        });
    });

    // ------------------------------------------------------------------------
    // ConfigValidator
    // ------------------------------------------------------------------------

    describe("ConfigValidator", () => {
        const config = (
            over: Partial<ConfigInterface> = {},
        ): ConfigInterface =>
            ({
                stages: [
                    {
                        name: "build",
                        steps: [makeStep("copy", "FileCopyAction")],
                    },
                ],
                ...over,
            }) as ConfigInterface;

        it("should accept a well-formed configuration", () => {
            expect(() =>
                new ConfigValidator().validate(config()),
            ).not.toThrow();
        });

        it("should accept optional metadata, options and validateConfig", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({
                        metadata: { name: "demo" },
                        options: { logLevel: "info" },
                        validateConfig: () => true,
                    }),
                ),
            ).not.toThrow();
        });

        it("should skip the already-resolved 'extends' property", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({ extends: "./base.yml" }),
                ),
            ).not.toThrow();
        });

        it("should accept a forward 'dependsOn' reference between stages", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({
                        stages: [
                            {
                                name: "second",
                                dependsOn: ["first"],
                                steps: [makeStep("copy", "FileCopyAction")],
                            },
                            {
                                name: "first",
                                steps: [makeStep("copy", "FileCopyAction")],
                            },
                        ],
                    }),
                ),
            ).not.toThrow();
        });

        it("should still reject an unknown 'dependsOn' reference", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({
                        stages: [
                            {
                                name: "only",
                                dependsOn: ["ghost"],
                                steps: [makeStep("copy", "FileCopyAction")],
                            },
                        ],
                    }),
                ),
            ).toThrow(/Undefined dependency: "ghost"/);
        });

        it("should reject a non-array 'stages' value", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({
                        stages: "nope" as unknown as ConfigInterface["stages"],
                    }),
                ),
            ).toThrow(/'stages' must be an array/);
        });

        it("should reject an unknown configuration property", () => {
            expect(() =>
                new ConfigValidator().validate(
                    config({ mystery: true } as unknown as ConfigInterface),
                ),
            ).toThrow(/Unknown or unsupported configuration property/);
        });

        it("should skip inherited properties", () => {
            const base = { mystery: true };
            const target = Object.create(base) as ConfigInterface;
            target.stages = [];
            expect(() => new ConfigValidator().validate(target)).not.toThrow();
        });
    });

    // ------------------------------------------------------------------------
    // OptionsValidator
    // ------------------------------------------------------------------------

    describe("OptionsValidator", () => {
        const validate = (options: Record<string, unknown>): void => {
            new OptionsValidator().validate(options);
        };

        it("should reject an undefined option value", () => {
            expect(() => validate({ configPath: undefined })).toThrow(
                /cannot be undefined/,
            );
        });

        describe("enumerated options", () => {
            it("should accept an allowed log level", () => {
                expect(() => validate({ logLevel: "debug" })).not.toThrow();
            });

            it("should reject a log level outside the allowed set", () => {
                expect(() => validate({ logLevel: "verbose" })).toThrow(
                    /Allowed values are: debug, info, warn, error/,
                );
            });
        });

        describe("numeric options", () => {
            it("should accept a non-negative stepTimeout", () => {
                expect(() => validate({ stepTimeout: 0 })).not.toThrow();
            });

            it("should accept a non-negative maxConcurrentStages", () => {
                expect(() =>
                    validate({ maxConcurrentStages: 4 }),
                ).not.toThrow();
            });

            it("should reject a negative stepTimeout", () => {
                expect(() => validate({ stepTimeout: -1 })).toThrow(
                    /Must be a non-negative number/,
                );
            });

            it("should reject a non-numeric stepTimeout", () => {
                expect(() => validate({ stepTimeout: "30s" })).toThrow(
                    /Must be a non-negative number/,
                );
            });
        });

        describe("object options", () => {
            it("should accept an object for haltOnFailure", () => {
                expect(() =>
                    validate({ haltOnFailure: { onError: true } }),
                ).not.toThrow();
            });

            it("should accept an object for tags", () => {
                expect(() => validate({ tags: { env: "ci" } })).not.toThrow();
            });

            it("should reject an array for tags", () => {
                expect(() => validate({ tags: ["ci"] })).toThrow(
                    /Must be a valid object/,
                );
            });

            it("should reject null for tags", () => {
                expect(() => validate({ tags: null })).toThrow(
                    /Must be a valid object/,
                );
            });

            it("should reject a primitive for tags", () => {
                expect(() => validate({ tags: "ci" })).toThrow(
                    /Must be a valid object/,
                );
            });
        });

        describe("string options", () => {
            it("should accept a non-empty string", () => {
                expect(() =>
                    validate({ configPath: "./kist.yml" }),
                ).not.toThrow();
            });

            it("should reject an empty string", () => {
                expect(() => validate({ configPath: "" })).toThrow(
                    /Must be a non-empty string/,
                );
            });

            it("should reject a whitespace-only string", () => {
                expect(() => validate({ configPath: "  " })).toThrow(
                    /Must be a non-empty string/,
                );
            });

            it("should reject a non-string value", () => {
                expect(() => validate({ configPath: 5 })).toThrow(
                    /Must be a non-empty string/,
                );
            });
        });

        describe("live options", () => {
            it("should accept a fully specified live block", () => {
                expect(() =>
                    validate({
                        live: {
                            port: 3000,
                            root: "public",
                            watchPaths: ["src/**/*"],
                            ignoredPaths: ["node_modules"],
                        },
                    }),
                ).not.toThrow();
            });

            it("should accept an empty live block", () => {
                expect(() => validate({ live: {} })).not.toThrow();
            });

            it("should reject a port below the valid range", () => {
                expect(() => validate({ live: { port: -1 } })).toThrow(
                    /Port must be a number between 1 and 65535/,
                );
            });

            it("should reject a port above the valid range", () => {
                expect(() => validate({ live: { port: 70000 } })).toThrow(
                    /Port must be a number between 1 and 65535/,
                );
            });

            it("should reject a non-string root", () => {
                expect(() => validate({ live: { root: 5 } })).toThrow(
                    /Root must be a valid string path/,
                );
            });

            it("should reject non-array watchPaths", () => {
                expect(() =>
                    validate({ live: { watchPaths: "src/**/*" } }),
                ).toThrow(/Must be an array of paths/);
            });

            it("should reject non-array ignoredPaths", () => {
                expect(() =>
                    validate({ live: { ignoredPaths: "node_modules" } }),
                ).toThrow(/Must be an array of paths/);
            });
        });
    });
});
