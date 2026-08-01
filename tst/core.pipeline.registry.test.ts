// ============================================================================
// ActionRegistry / Action / Step Tests
// ============================================================================

import { ActionError } from "../src/ts/errors";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Step } from "../src/ts/core/pipeline/Step";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { ActionInterface } from "../src/ts/interface/ActionInterface";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import type { ActionOptionsType } from "../src/ts/types/ActionOptionsType";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Test doubles
// ----------------------------------------------------------------------------

/** A minimal concrete Action used to exercise the abstract base class. */
class SampleAction extends Action {
    public static lastOptions: ActionOptionsType | null = null;
    public static shouldFail = false;

    async execute(options: ActionOptionsType): Promise<void> {
        SampleAction.lastOptions = options;
        this.logStart();
        if (SampleAction.shouldFail) {
            throw new Error("execute failed");
        }
        this.logSuccess();
    }
}

/** An action that reports its options as invalid. */
class RejectingAction extends Action {
    validateOptions(): boolean {
        return false;
    }
    async execute(): Promise<void> {
        throw new Error("should not run");
    }
}

/** A plain object action without the optional validateOptions hook. */
class BareAction implements ActionInterface {
    public name = "BareAction";
    public static executed = false;
    async execute(): Promise<void> {
        BareAction.executed = true;
    }
}

/** An action class whose instances report no name. */
class NamelessAction implements ActionInterface {
    public name = "";
    async execute(): Promise<void> {}
}

/** Builds a step definition using the bare-string action form Step expects. */
function makeStep(name: string, action: string): StepInterface {
    return { name, action: action as unknown as StepInterface["action"] };
}

// ----------------------------------------------------------------------------
// Action
// ----------------------------------------------------------------------------

describe("Action", () => {
    silenceConsole();

    it("should derive its name from the concrete class", () => {
        expect(new SampleAction().name).toBe("SampleAction");
    });

    it("should accept any options by default", () => {
        expect(new SampleAction().validateOptions({})).toBe(true);
    });

    it("should provide a default description", () => {
        expect(new SampleAction().describe()).toBe(
            "Base action for executing steps in the pipeline.",
        );
    });
});

// ----------------------------------------------------------------------------
// ActionRegistry
// ----------------------------------------------------------------------------

describe("ActionRegistry", () => {
    const spies = silenceConsole();

    beforeEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        SampleAction.lastOptions = null;
        SampleAction.shouldFail = false;
        BareAction.executed = false;
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    describe("singleton lifecycle", () => {
        it("should return the same instance on repeated calls", () => {
            expect(ActionRegistry.getInstance()).toBe(
                ActionRegistry.getInstance(),
            );
        });

        it("should create the instance via initialize", () => {
            ActionRegistry.initialize();
            expect(ActionRegistry.getInstance()).toBeInstanceOf(
                ActionRegistry,
            );
        });

        it("should refuse to initialize twice", () => {
            ActionRegistry.initialize();
            expect(() => ActionRegistry.initialize()).toThrow(
                "ActionRegistry has already been initialized.",
            );
        });

        it("should create a fresh instance after resetInstance", () => {
            const first = ActionRegistry.getInstance();
            ActionRegistry.resetInstance();
            expect(ActionRegistry.getInstance()).not.toBe(first);
        });
    });

    describe("core actions", () => {
        it("should pre-register every core action", () => {
            expect(
                ActionRegistry.getInstance().listRegisteredActions().sort(),
            ).toEqual([
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
    });

    describe("registerAction", () => {
        it("should register a new action class", () => {
            const registry = ActionRegistry.getInstance();
            registry.registerAction(SampleAction);
            expect(registry.getAction("SampleAction")).toBe(SampleAction);
        });

        it("should reject an action whose name is empty", () => {
            const registry = ActionRegistry.getInstance();
            expect(() => registry.registerAction(NamelessAction)).toThrow(
                /must have a valid 'name' property/,
            );
        });

        it("should reject an action whose name is not a string", () => {
            class NumericName implements ActionInterface {
                public name = 1 as unknown as string;
                async execute(): Promise<void> {}
            }
            const registry = ActionRegistry.getInstance();
            expect(() => registry.registerAction(NumericName)).toThrow(
                /must have a valid 'name' property/,
            );
        });

        it("should reject a duplicate registration", () => {
            const registry = ActionRegistry.getInstance();
            registry.registerAction(SampleAction);
            expect(() => registry.registerAction(SampleAction)).toThrow(
                /Action "SampleAction" is already registered/,
            );
        });
    });

    describe("getAction", () => {
        it("should return a registered action class", () => {
            expect(
                ActionRegistry.getInstance().getAction("FileCopyAction"),
            ).toBeDefined();
        });

        it("should warn and return undefined for an unknown action", () => {
            const registry = ActionRegistry.getInstance();
            expect(registry.getAction("GhostAction")).toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                'Action "GhostAction" not found in the registry',
            );
        });

        it("should warn and return undefined for an empty name", () => {
            const registry = ActionRegistry.getInstance();
            expect(registry.getAction("")).toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                "Invalid action name requested",
            );
        });

        it("should warn and return undefined for a non-string name", () => {
            const registry = ActionRegistry.getInstance();
            expect(registry.getAction(7 as unknown as string)).toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                "Invalid action name requested",
            );
        });
    });

    describe("clearRegistry", () => {
        it("should remove every registered action", () => {
            const registry = ActionRegistry.getInstance();
            registry.clearRegistry();
            expect(registry.listRegisteredActions()).toEqual([]);
        });
    });

    describe("plugin actions", () => {
        it("should register actions contributed by plugins", () => {
            PluginManager.getInstance().registerPlugin(
                { registerActions: () => ({ SampleAction }) },
                "sample-plugin",
            );

            const registry = ActionRegistry.getInstance();
            expect(registry.getAction("SampleAction")).toBe(SampleAction);
            expect(spyOutput(spies.log())).toContain(
                "Registered 1 actions from plugins",
            );
        });

        it("should log an error when a plugin action collides with a core action", () => {
            class FileCopyAction implements ActionInterface {
                public name = "FileCopyAction";
                async execute(): Promise<void> {}
            }
            PluginManager.getInstance().registerPlugin(
                { registerActions: () => ({ FileCopyAction }) },
                "colliding-plugin",
            );

            ActionRegistry.getInstance();
            expect(spyOutput(spies.error())).toContain(
                "Failed to register plugin action FileCopyAction",
            );
        });
    });
});

// ----------------------------------------------------------------------------
// Step
// ----------------------------------------------------------------------------

describe("Step", () => {
    const spies = silenceConsole();

    beforeEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        SampleAction.lastOptions = null;
        SampleAction.shouldFail = false;
        BareAction.executed = false;
        ActionRegistry.getInstance().registerAction(SampleAction);
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
    });

    describe("construction", () => {
        it("should resolve the action from the registry", () => {
            const step = new Step(makeStep("sample", "SampleAction"));
            expect(step).toBeInstanceOf(Step);
            expect(spyOutput(spies.log())).toContain(
                'Step "sample" initialized',
            );
        });

        it("should throw for an action that is not registered", () => {
            expect(() => new Step(makeStep("ghost", "GhostAction"))).toThrow(
                /Unknown action "GhostAction" for step "ghost"/,
            );
        });
    });

    describe("execute", () => {
        it("should invoke the action with the step options", async () => {
            const step = new Step({
                ...makeStep("sample", "SampleAction"),
                options: { flag: true } as never,
            });

            await step.execute();

            expect(SampleAction.lastOptions).toEqual({ flag: true });
            expect(spyOutput(spies.log())).toContain(
                'Step "sample" completed successfully',
            );
        });

        it("should pass an empty object when no options are configured", async () => {
            const step = new Step(makeStep("sample", "SampleAction"));
            await step.execute();
            expect(SampleAction.lastOptions).toEqual({});
        });

        it("should run an action that does not implement validateOptions", async () => {
            ActionRegistry.getInstance().registerAction(BareAction);
            const step = new Step(makeStep("bare", "BareAction"));

            await step.execute();

            expect(BareAction.executed).toBe(true);
        });

        it("should reject when the options are rejected", async () => {
            ActionRegistry.getInstance().registerAction(RejectingAction);
            const step = new Step(makeStep("rejecting", "RejectingAction"));

            await expect(step.execute()).rejects.toThrow(
                "Invalid options for step: rejecting",
            );

            expect(spyOutput(spies.error())).toContain(
                "Invalid options for step: rejecting",
            );
        });

        it("should rethrow when the action throws", async () => {
            SampleAction.shouldFail = true;
            const step = new Step(makeStep("sample", "SampleAction"));

            await expect(step.execute()).rejects.toThrow(
                'Action "SampleAction" failed',
            );

            expect(spyOutput(spies.error())).toContain(
                'Error executing step "sample"',
            );
        });

        it("should wrap a non-Error throw in an ActionError", async () => {
            class StringThrowingAction extends Action {
                async execute(): Promise<void> {
                    throw "nope";
                }
            }
            ActionRegistry.getInstance().registerAction(StringThrowingAction);
            const step = new Step(makeStep("stringy", "StringThrowingAction"));

            await expect(step.execute()).rejects.toThrow(
                'Action "StringThrowingAction" failed: nope',
            );
        });

        it("should pass a KistError through unwrapped", async () => {
            const original = new ActionError("Inner", "already wrapped");
            class KistThrowingAction extends Action {
                async execute(): Promise<void> {
                    throw original;
                }
            }
            ActionRegistry.getInstance().registerAction(KistThrowingAction);
            const step = new Step(makeStep("kisty", "KistThrowingAction"));

            await expect(step.execute()).rejects.toBe(original);
        });
    });
});
