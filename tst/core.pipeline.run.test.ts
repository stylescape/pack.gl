// ============================================================================
// Pipeline / PipelineManager Tests
// ============================================================================

import type { ChildProcess } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { EventEmitter } from "events";
import { BuildCache } from "../src/ts/core/cache/BuildCache";
import { FileCache } from "../src/ts/core/cache/FileCache";
import { ConfigStore } from "../src/ts/core/config/ConfigStore";
import { Action } from "../src/ts/core/pipeline/Action";
import { ActionRegistry } from "../src/ts/core/pipeline/ActionRegistry";
import { Pipeline } from "../src/ts/core/pipeline/Pipeline";
import { PipelineManager } from "../src/ts/core/pipeline/PipelineManager";
import { PluginManager } from "../src/ts/core/plugin/PluginManager";
import type { ConfigInterface } from "../src/ts/interface/ConfigInterface";
import type { LiveServer } from "../src/ts/live/LiveServer";
import type { StageInterface } from "../src/ts/interface/StageInterface";
import type { StepInterface } from "../src/ts/interface/StepInterface";
import { silenceConsole, spyOutput } from "./helpers/silence";

// `child_process.spawn` is non-configurable, so it is replaced through the
// module registry rather than with a spy. Everything else is left intact —
// the core actions loaded by ActionRegistry rely on `execFile`.
const mockSpawn = jest.fn();

jest.mock("child_process", () => {
    const actual =
        jest.requireActual<typeof import("child_process")>("child_process");
    return {
        ...actual,
        spawn: (...args: unknown[]) => mockSpawn(...args),
    };
});

// ----------------------------------------------------------------------------
// Test doubles
// ----------------------------------------------------------------------------

const executed: string[] = [];

class RecordingAction extends Action {
    async execute(options: Record<string, unknown>): Promise<void> {
        executed.push(String(options.id ?? "anonymous"));
    }
}

/** Never resolves, so a stage timeout is the only way it can end. */
class ThrowingStageAction extends Action {
    async execute(): Promise<void> {
        await new Promise(() => undefined);
    }
}

/** Fails at execution time, like a real compiler or copy error would. */
class FailingAction extends Action {
    async execute(): Promise<void> {
        throw new Error("action exploded");
    }
}

/** Records how many instances run at the same moment. */
let activeCount = 0;
let maxActiveCount = 0;

class ConcurrencyProbeAction extends Action {
    async execute(): Promise<void> {
        activeCount++;
        maxActiveCount = Math.max(maxActiveCount, activeCount);
        await new Promise((resolve) => setImmediate(resolve));
        activeCount--;
    }
}

function step(id: string, action = "RecordingAction"): StepInterface {
    return {
        name: id,
        action: action as unknown as StepInterface["action"],
        options: { id } as never,
    };
}

function stage(
    name: string,
    over: Partial<StageInterface> = {},
): StageInterface {
    return { name, steps: [step(name)], ...over };
}

describe("Pipeline", () => {
    const spies = silenceConsole();
    let root: string;

    beforeEach(() => {
        executed.length = 0;
        root = mkdtempSync(join(tmpdir(), "kist-pipeline-"));
        // FileCopyAction claims the FileCache singleton in its constructor,
        // with no options — so the default `<cwd>/.kist-cache` must point
        // somewhere disposable before ActionRegistry instantiates the core
        // actions, or the suite would read and write the real repo cache.
        jest.spyOn(process, "cwd").mockReturnValue(root);
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        FileCache.resetInstance();
        BuildCache.resetInstance();
        const registry = ActionRegistry.getInstance();
        registry.registerAction(RecordingAction);
        registry.registerAction(ThrowingStageAction);
        registry.registerAction(FailingAction);
        registry.registerAction(ConcurrencyProbeAction);
        activeCount = 0;
        maxActiveCount = 0;
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        FileCache.resetInstance();
        BuildCache.resetInstance();
        rmSync(root, { recursive: true, force: true });
    });

    // ------------------------------------------------------------------------
    // Happy path
    // ------------------------------------------------------------------------

    describe("run", () => {
        it("should execute every stage", async () => {
            const config: ConfigInterface = {
                stages: [stage("first"), stage("second")],
            };

            await new Pipeline(config).run();

            expect(executed.sort()).toEqual(["first", "second"]);
            expect(spyOutput(spies.log())).toContain(
                "Pipeline execution completed successfully",
            );
        });

        it("should run with no stages at all", async () => {
            await new Pipeline({ stages: [] }).run();
            expect(executed).toEqual([]);
        });

        it("should respect performance.maxConcurrentStages", async () => {
            const config: ConfigInterface = {
                stages: [stage("a"), stage("b"), stage("c")],
                options: { performance: { maxConcurrentStages: 1 } },
            };

            await new Pipeline(config).run();
            expect(executed).toHaveLength(3);
        });

        it("should actually limit how many stages run at once", async () => {
            const probeStage = (name: string): StageInterface => ({
                name,
                steps: [
                    {
                        name,
                        action: "ConcurrencyProbeAction",
                    },
                ],
            });

            await new Pipeline({
                stages: [probeStage("a"), probeStage("b"), probeStage("c")],
                options: { performance: { maxConcurrentStages: 1 } },
            }).run();

            expect(maxActiveCount).toBe(1);
        });

        it("should run a stage only after its dependencies, regardless of declaration order", async () => {
            const config: ConfigInterface = {
                stages: [
                    stage("second", { dependsOn: ["first"] }),
                    stage("first"),
                ],
            };

            await new Pipeline(config).run();

            expect(executed).toEqual(["first", "second"]);
        });

        it("should respect the deprecated top-level maxConcurrentStages", async () => {
            const config: ConfigInterface = {
                stages: [stage("a"), stage("b")],
                options: { maxConcurrentStages: 1 },
            };

            await new Pipeline(config).run();
            expect(executed).toHaveLength(2);
        });
    });

    // ------------------------------------------------------------------------
    // Duration formatting
    // ------------------------------------------------------------------------

    describe("duration reporting", () => {
        /** Returns a `performance.now` stub that jumps by `deltaMs` once. */
        const clockJump = (deltaMs: number): void => {
            const real = performance.now.bind(performance);
            const start = real();
            let calls = 0;
            jest.spyOn(performance, "now").mockImplementation(() => {
                calls++;
                return calls === 1 ? start : start + deltaMs;
            });
        };

        it("should report sub-second runs in milliseconds", async () => {
            clockJump(250);
            await new Pipeline({ stages: [] }).run();
            expect(spyOutput(spies.log())).toContain("in 250ms");
        });

        it("should report multi-second runs in seconds", async () => {
            clockJump(4_500);
            await new Pipeline({ stages: [] }).run();
            expect(spyOutput(spies.log())).toContain("in 4.50s");
        });

        it("should report long runs in minutes and seconds", async () => {
            clockJump(125_000);
            await new Pipeline({ stages: [] }).run();
            expect(spyOutput(spies.log())).toContain("in 2m 5.0s");
        });
    });

    // ------------------------------------------------------------------------
    // Caching
    // ------------------------------------------------------------------------

    describe("caching", () => {
        it("should skip cache setup when caching is disabled", async () => {
            await new Pipeline({
                stages: [],
                options: { cache: { enabled: false } },
            }).run();

            expect(spyOutput(spies.log())).not.toContain(
                "Initializing build cache",
            );
        });

        it("should skip cache setup when no cache options are present", async () => {
            await new Pipeline({ stages: [] }).run();
            expect(spyOutput(spies.log())).not.toContain(
                "Initializing build cache",
            );
        });

        it("should initialize, save and report both caches when enabled", async () => {
            await new Pipeline({
                stages: [stage("first")],
                options: {
                    cache: {
                        enabled: true,
                        cacheDir: join(root, "cache"),
                        ttl: 60_000,
                        maxCacheSize: 1024,
                    },
                },
            }).run();

            const output = spyOutput(spies.log());
            expect(output).toContain("Initializing build cache");
            expect(output).toContain("Build cache initialized.");
            expect(output).toContain("File cache: 0 entries, N/A hit rate");
            expect(output).toContain("Build cache: 0 entries, N/A hit rate");
        });

        it("should report that every cacheable step was up to date", async () => {
            const cacheOptions = {
                cache: {
                    enabled: true,
                    cacheDir: join(root, "cache"),
                },
            };
            const cached: ConfigInterface = {
                options: cacheOptions,
                stages: [
                    {
                        name: "build",
                        steps: [
                            {
                                ...step("build"),
                                inputs: ["package.json"],
                            },
                        ],
                    },
                ],
            };

            // First run populates the cache, second run should skip.
            await new Pipeline(cached).run();
            spies.log().mockClear();
            await new Pipeline(cached).run();

            expect(spyOutput(spies.log())).toContain(
                "All 1 cacheable step(s) were up to date.",
            );
        });

        it("should report a partial hit rate when only some steps are cached", async () => {
            const cacheOptions = {
                cache: {
                    enabled: true,
                    cacheDir: join(root, "cache"),
                },
            };

            await new Pipeline({
                options: cacheOptions,
                stages: [
                    {
                        name: "build",
                        steps: [{ ...step("one"), inputs: ["package.json"] }],
                    },
                ],
            }).run();

            spies.log().mockClear();

            // The second pipeline adds a step the cache has never seen.
            await new Pipeline({
                options: cacheOptions,
                stages: [
                    {
                        name: "build",
                        steps: [
                            { ...step("one"), inputs: ["package.json"] },
                            { ...step("two"), inputs: ["package.json"] },
                        ],
                    },
                ],
            }).run();

            expect(spyOutput(spies.log())).toContain(
                "Step cache: 1/2 step(s) up to date",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Progress
    // ------------------------------------------------------------------------

    describe("progress reporting", () => {
        it("should report progress by default", async () => {
            await new Pipeline({ stages: [stage("first")] }).run();
            expect(spyOutput(spies.log())).toContain("Pipeline 0/1");
        });

        it("should suppress progress when showProgress is false", async () => {
            await new Pipeline({
                stages: [stage("first")],
                options: { performance: { showProgress: false } },
            }).run();

            expect(spyOutput(spies.log())).not.toContain("Pipeline 0/1");
        });

        it("should keep progress when showProgress is explicitly true", async () => {
            await new Pipeline({
                stages: [stage("first")],
                options: { performance: { showProgress: true } },
            }).run();

            expect(spyOutput(spies.log())).toContain("Pipeline 0/1");
        });
    });

    // ------------------------------------------------------------------------
    // Dependency validation
    // ------------------------------------------------------------------------

    describe("dependency validation", () => {
        it("should reject a dependency on an unknown stage", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [stage("a", { dependsOn: ["ghost"] })],
                    }),
            ).toThrow(/depends on unknown stage "ghost"/);
        });

        it("should reject a circular dependency", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [
                            stage("a", { dependsOn: ["b"] }),
                            stage("b", { dependsOn: ["a"] }),
                        ],
                    }),
            ).toThrow(/circular 'dependsOn' dependency/);
        });

        it("should reject a stage that depends on itself", () => {
            expect(
                () =>
                    new Pipeline({
                        stages: [stage("a", { dependsOn: ["a"] })],
                    }),
            ).toThrow(/circular 'dependsOn' dependency/);
        });

        it("should fail instead of spinning when the scheduler stalls", async () => {
            // The constructor validation makes this state unreachable via the
            // public API, so it is provoked by mutating the config afterwards.
            const pipeline = new Pipeline({ stages: [stage("a")] });
            const internals = pipeline as unknown as {
                config: ConfigInterface;
                runWithConcurrencyControl(
                    completedStages: Set<string>,
                ): Promise<void>;
            };
            internals.config.stages[0].dependsOn = ["ghost"];

            await expect(
                internals.runWithConcurrencyControl(new Set()),
            ).rejects.toThrow(/cannot be scheduled/);
        });
    });

    // ------------------------------------------------------------------------
    // Failure handling
    // ------------------------------------------------------------------------

    describe("failure handling", () => {
        /** A stage whose timeout always trips, so `Stage.execute` rejects. */
        const failingStage = (): StageInterface => ({
            name: "failing",
            steps: [step("stall", "ThrowingStageAction")],
            timeout: 10,
        });

        it("should fail the build when an action throws at execution time", async () => {
            await expect(
                new Pipeline({
                    stages: [
                        {
                            name: "broken",
                            steps: [step("boom", "FailingAction")],
                        },
                    ],
                }).run(),
            ).rejects.toThrow(/FailingAction/);

            expect(spyOutput(spies.error())).toContain(
                'Action "FailingAction" failed',
            );
        });

        it("should reject when haltOnFailure is left at its default", async () => {
            await expect(
                new Pipeline({ stages: [failingStage()] }).run(),
            ).rejects.toThrow();

            expect(spyOutput(spies.error())).toContain(
                "Pipeline execution failed",
            );
        });

        it("should reject when haltOnFailure is true", async () => {
            await expect(
                new Pipeline({
                    stages: [failingStage()],
                    options: { haltOnFailure: true },
                }).run(),
            ).rejects.toThrow();
        });

        it("should not exit the process on failure", async () => {
            // The pipeline reports failure to its caller rather than ending
            // the process itself: live mode has to survive a failed build.
            const exit = jest
                .spyOn(process, "exit")
                .mockImplementation((() => undefined) as never);

            await expect(
                new Pipeline({ stages: [failingStage()] }).run(),
            ).rejects.toThrow();

            expect(exit).not.toHaveBeenCalled();
        });

        it("should still fail overall when haltOnFailure is false", async () => {
            // "Do not halt" means the other stages still get to run, not that
            // the failure is forgotten: reporting success for a failed build
            // gave CI a green run over broken output.
            await expect(
                new Pipeline({
                    stages: [failingStage()],
                    options: { haltOnFailure: false },
                }).run(),
            ).rejects.toThrow(/1 stage\(s\) failed: "failing"/);
        });

        it("should run independent stages when haltOnFailure is false", async () => {
            const pipeline = new Pipeline({
                stages: [
                    failingStage(),
                    {
                        name: "independent",
                        steps: [step("ok", "RecordingAction")],
                    },
                ],
                options: { haltOnFailure: false },
            });

            await expect(pipeline.run()).rejects.toThrow(/failing/);

            // The stage that does not depend on the failure still ran.
            expect(spyOutput(spies.log())).toContain(
                'Stage "independent" completed successfully',
            );
        });

        it("should skip stages that depend on a failed one", async () => {
            const pipeline = new Pipeline({
                stages: [
                    failingStage(),
                    {
                        name: "dependent",
                        dependsOn: ["failing"],
                        steps: [step("ok", "RecordingAction")],
                    },
                ],
                options: { haltOnFailure: false },
            });

            await expect(pipeline.run()).rejects.toThrow(/failing/);

            expect(spyOutput(spies.warn())).toContain(
                'Stage "dependent" skipped: it depends on a stage that failed',
            );
        });

        it("should report a stage that failed with a non-Error value", async () => {
            const pipeline = new Pipeline({
                stages: [
                    {
                        name: "hooked",
                        steps: [step("ok", "RecordingAction")],
                        hooks: {
                            before: async () => {
                                throw "not an Error";
                            },
                        },
                    },
                ],
                options: { haltOnFailure: false },
            });

            await expect(pipeline.run()).rejects.toThrow(
                /1 stage\(s\) failed: "hooked"/,
            );
        });

        it("should cancel progress and still save caches on failure", async () => {
            await expect(
                new Pipeline({
                    stages: [failingStage()],
                    options: {
                        cache: {
                            enabled: true,
                            cacheDir: join(root, "cache"),
                        },
                    },
                }).run(),
            ).rejects.toThrow();

            expect(spyOutput(spies.warn())).toContain("Cancelled at");
        });
    });
});

// ----------------------------------------------------------------------------
// PipelineManager
// ----------------------------------------------------------------------------

describe("PipelineManager", () => {
    const spies = silenceConsole();

    /** A stand-in for a spawned child process. */
    class FakeChild extends EventEmitter {
        public killed = false;
        public kill = jest.fn((): boolean => {
            this.killed = true;
            return true;
        });
    }

    let child: FakeChild;
    let liveServer: { reloadClients: jest.Mock; shutdown: jest.Mock };

    beforeEach(() => {
        executed.length = 0;
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        ActionRegistry.getInstance().registerAction(RecordingAction);

        child = new FakeChild();
        mockSpawn.mockReset();
        mockSpawn.mockReturnValue(child as unknown as ChildProcess);
        liveServer = { reloadClients: jest.fn(), shutdown: jest.fn() };
    });

    afterEach(() => {
        ActionRegistry.resetInstance();
        PluginManager.resetInstance();
        jest.useRealTimers();
    });

    const managerWithServer = (): PipelineManager =>
        new PipelineManager(liveServer as unknown as LiveServer);

    // ------------------------------------------------------------------------
    // runPipeline
    // ------------------------------------------------------------------------

    describe("runPipeline", () => {
        it("should run the configured stages and reload clients", async () => {
            const store = ConfigStore.getInstance();
            store.merge({ stages: [stage("first")] });

            await managerWithServer().runPipeline();

            expect(executed).toEqual(["first"]);
            expect(liveServer.reloadClients).toHaveBeenCalledTimes(1);
            store.merge({ stages: [] });
        });

        it("should work without a live server", async () => {
            const store = ConfigStore.getInstance();
            store.merge({ stages: [stage("solo")] });

            await new PipelineManager().runPipeline();

            expect(executed).toEqual(["solo"]);
            store.merge({ stages: [] });
        });

        it("should reject when 'stages' is missing", async () => {
            const store = ConfigStore.getInstance();
            const original = store.getConfig().stages;
            store.set("stages", undefined);

            await expect(managerWithServer().runPipeline()).rejects.toThrow(
                "Invalid configuration: 'stages' must be an array.",
            );

            store.set("stages", original);
        });

        it("should reject when 'stages' is not an array", async () => {
            const store = ConfigStore.getInstance();
            const original = store.getConfig().stages;
            store.set("stages", "nope");

            await expect(managerWithServer().runPipeline()).rejects.toThrow(
                "Invalid configuration: 'stages' must be an array.",
            );

            store.set("stages", original);
        });

        it("should propagate a step whose action cannot be resolved", async () => {
            const store = ConfigStore.getInstance();
            store.merge({
                stages: [
                    {
                        name: "broken",
                        steps: [step("x", "MissingAction")],
                    },
                ],
            });

            // Thrown from the Pipeline constructor, before `run` is reached.
            await expect(managerWithServer().runPipeline()).rejects.toThrow(
                /Unknown action "MissingAction"/,
            );

            store.merge({ stages: [] });
        });

        it("should log and rethrow when the pipeline run rejects", async () => {
            const store = ConfigStore.getInstance();
            store.merge({ stages: [stage("first")] });
            jest.spyOn(Pipeline.prototype, "run").mockRejectedValue(
                new Error("pipeline exploded"),
            );

            await expect(managerWithServer().runPipeline()).rejects.toThrow(
                "pipeline exploded",
            );
            expect(spyOutput(spies.error())).toContain(
                "Error during pipeline execution",
            );
            expect(liveServer.reloadClients).not.toHaveBeenCalled();

            store.merge({ stages: [] });
        });
    });

    // ------------------------------------------------------------------------
    // Process lifecycle
    // ------------------------------------------------------------------------

    describe("restartPipeline", () => {
        it("should respawn the original CLI invocation in a child process", () => {
            managerWithServer().restartPipeline();

            expect(mockSpawn).toHaveBeenCalledWith(
                process.execPath,
                process.argv.slice(1),
                expect.objectContaining({ stdio: "inherit" }),
            );
        });

        it("should mark the child as a rebuild so it does not go live", () => {
            // Without the marker the child starts its own server and watcher,
            // fights the parent for the port, and spawns a rebuild child of
            // its own.
            managerWithServer().restartPipeline();

            const options = mockSpawn.mock.calls[0][2] as {
                env: Record<string, string>;
            };
            expect(options.env[PipelineManager.REBUILD_ENV]).toBe("1");
            expect(PipelineManager.isRebuildChild()).toBe(false);
        });

        it("should drop --live from the rebuild invocation", () => {
            const original = process.argv;
            process.argv = [
                process.execPath,
                "/bin/kist",
                "--live",
                "--config",
                "kist.yml",
            ];

            try {
                managerWithServer().restartPipeline();

                expect(mockSpawn.mock.calls[0][1]).toEqual([
                    "/bin/kist",
                    "--config",
                    "kist.yml",
                ]);
            } finally {
                process.argv = original;
            }
        });

        it("should report a rebuild child from the environment", () => {
            const previous = process.env[PipelineManager.REBUILD_ENV];
            process.env[PipelineManager.REBUILD_ENV] = "1";

            expect(PipelineManager.isRebuildChild()).toBe(true);

            if (previous === undefined) {
                delete process.env[PipelineManager.REBUILD_ENV];
            } else {
                process.env[PipelineManager.REBUILD_ENV] = previous;
            }
        });

        it("should stop an existing process before starting a new one", () => {
            const manager = managerWithServer();
            manager.restartPipeline();
            manager.restartPipeline();

            expect(child.kill).toHaveBeenCalledWith("SIGTERM");
            expect(mockSpawn).toHaveBeenCalledTimes(2);
        });

        it("should skip a restart that is already in progress", () => {
            const manager = managerWithServer();
            const internal = manager as unknown as { isRestarting: boolean };
            internal.isRestarting = true;

            manager.restartPipeline();

            expect(mockSpawn).not.toHaveBeenCalled();
            expect(spyOutput(spies.warn())).toContain(
                "Pipeline restart already in progress",
            );
        });
    });

    describe("process events", () => {
        it("should log a clean exit and reload clients", () => {
            managerWithServer().restartPipeline();
            child.emit("close", 0);

            expect(spyOutput(spies.log())).toContain(
                "Pipeline process exited successfully",
            );
            expect(liveServer.reloadClients).toHaveBeenCalled();
        });

        it("should log a non-zero exit code", () => {
            managerWithServer().restartPipeline();
            child.emit("close", 3);

            expect(spyOutput(spies.error())).toContain(
                "Pipeline process exited with code 3",
            );
        });

        it("should log spawn errors", () => {
            managerWithServer().restartPipeline();
            child.emit("error", new Error("ENOENT"));

            expect(spyOutput(spies.error())).toContain(
                "Error starting pipeline process",
            );
        });

        it("should warn when the process is terminated by a signal", () => {
            managerWithServer().restartPipeline();
            child.emit("exit", null, "SIGKILL");

            expect(spyOutput(spies.warn())).toContain(
                "terminated with signal: SIGKILL",
            );
        });

        it("should log the exit code when there is no signal", () => {
            managerWithServer().restartPipeline();
            child.emit("exit", 0, null);

            expect(spyOutput(spies.log())).toContain(
                "Pipeline process exited with code: 0",
            );
        });

        it("should tolerate a missing live server on close", () => {
            const manager = new PipelineManager();
            manager.restartPipeline();
            expect(() => child.emit("close", 0)).not.toThrow();
        });

        it("should do nothing when there is no process to attach to", () => {
            const manager = managerWithServer() as unknown as {
                attachProcessListeners: () => void;
            };
            expect(() => manager.attachProcessListeners()).not.toThrow();
        });
    });

    describe("stopPipeline", () => {
        it("should kill a running process", () => {
            const manager = managerWithServer();
            manager.restartPipeline();
            manager.stopPipeline();

            expect(child.kill).toHaveBeenCalledWith("SIGTERM");
            expect(spyOutput(spies.log())).toContain(
                "Pipeline process stopped",
            );
        });

        it("should warn when nothing is running", () => {
            managerWithServer().stopPipeline();
            expect(spyOutput(spies.warn())).toContain(
                "No pipeline process is currently running",
            );
        });
    });

    describe("isPipelineRunning", () => {
        it("should report false before a process is started", () => {
            expect(managerWithServer().isPipelineRunning()).toBe(false);
        });

        it("should report true while a process is live", () => {
            const manager = managerWithServer();
            manager.restartPipeline();
            expect(manager.isPipelineRunning()).toBe(true);
        });

        it("should report false once the process has been killed", () => {
            const manager = managerWithServer();
            manager.restartPipeline();
            child.killed = true;
            expect(manager.isPipelineRunning()).toBe(false);
        });
    });

    describe("restartPipelineWithDelay", () => {
        it("should restart after the default delay", () => {
            jest.useFakeTimers();
            managerWithServer().restartPipelineWithDelay();

            expect(mockSpawn).not.toHaveBeenCalled();
            jest.advanceTimersByTime(1000);
            expect(mockSpawn).toHaveBeenCalledTimes(1);
        });

        it("should restart after an explicit delay", () => {
            jest.useFakeTimers();
            managerWithServer().restartPipelineWithDelay(250);

            jest.advanceTimersByTime(249);
            expect(mockSpawn).not.toHaveBeenCalled();
            jest.advanceTimersByTime(1);
            expect(mockSpawn).toHaveBeenCalledTimes(1);
        });
    });
});
