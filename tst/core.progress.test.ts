// ============================================================================
// ProgressReporter Tests
// ============================================================================

import {
    ProgressReporter,
    createBuildProgress,
    createFileProgress,
} from "../src/ts/core/progress/ProgressReporter";
import { silenceConsole, spyOutput } from "./helpers/silence";

describe("ProgressReporter", () => {
    const spies = silenceConsole();
    let now: number;
    let nowSpy: jest.SpyInstance;

    beforeEach(() => {
        now = 1000;
        nowSpy = jest.spyOn(performance, "now").mockImplementation(() => now);
    });

    /** Advances the mocked clock. */
    const advance = (ms: number): void => {
        now += ms;
    };

    describe("construction", () => {
        it("should apply defaults for optional settings", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            expect(spyOutput(spies.log())).toContain("Processing 0/10 (0.0%)");
        });

        it("should honour an explicit label", () => {
            const reporter = new ProgressReporter({
                total: 4,
                label: "Compiling",
            });
            reporter.start();
            expect(spyOutput(spies.log())).toContain("Compiling 0/4");
        });

        it("should allow percentage display to be disabled", () => {
            const reporter = new ProgressReporter({
                total: 4,
                showPercentage: false,
            });
            reporter.start();
            expect(spyOutput(spies.log())).not.toContain("%");
        });

        it("should use a custom format function when provided", () => {
            const reporter = new ProgressReporter({
                total: 4,
                formatFn: (state) =>
                    `custom:${state.completed}/${state.total}`,
            });
            reporter.start();
            expect(spyOutput(spies.log())).toContain("custom:0/4");
        });
    });

    describe("start", () => {
        it("should reset the completed count and report immediately", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.increment(5);
            reporter.start();
            expect(reporter.getState().completed).toBe(0);
            expect(nowSpy).toHaveBeenCalled();
        });
    });

    describe("increment", () => {
        it("should advance by one by default", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.increment();
            expect(reporter.getState().completed).toBe(1);
        });

        it("should advance by an explicit amount", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.increment(4);
            expect(reporter.getState().completed).toBe(4);
        });

        it("should clamp at the total", () => {
            const reporter = new ProgressReporter({ total: 3 });
            reporter.start();
            reporter.increment(99);
            expect(reporter.getState().completed).toBe(3);
        });
    });

    describe("setCompleted", () => {
        it("should set an in-range value", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.setCompleted(7);
            expect(reporter.getState().completed).toBe(7);
        });

        it("should clamp negative values to zero", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.setCompleted(-5);
            expect(reporter.getState().completed).toBe(0);
        });

        it("should clamp values above the total", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.setCompleted(50);
            expect(reporter.getState().completed).toBe(10);
        });
    });

    describe("reporting cadence", () => {
        it("should suppress reports inside the update interval", () => {
            const reporter = new ProgressReporter({
                total: 100,
                updateInterval: 500,
            });
            reporter.start();
            spies.log().mockClear();

            advance(100);
            reporter.increment(10);
            expect(spies.log()).not.toHaveBeenCalled();
        });

        it("should report once the update interval has elapsed", () => {
            const reporter = new ProgressReporter({
                total: 100,
                updateInterval: 100,
            });
            reporter.start();
            spies.log().mockClear();

            advance(150);
            reporter.increment(10);
            expect(spies.log()).toHaveBeenCalledTimes(1);
        });

        it("should skip a report when the whole-number percentage is unchanged", () => {
            const reporter = new ProgressReporter({
                total: 1000,
                updateInterval: 0,
            });
            reporter.start();
            reporter.increment(1); // 0.1% -> floor 0, same as start
            spies.log().mockClear();

            reporter.increment(1); // 0.2% -> floor 0, still unchanged
            expect(spies.log()).not.toHaveBeenCalled();
        });
    });

    describe("finish", () => {
        it("should force a final report at 100%", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            advance(500);
            spies.log().mockClear();

            reporter.finish();
            const output = spyOutput(spies.log());
            expect(output).toContain("10/10");
            expect(output).toContain("(100.0%)");
            expect(output).toContain("Done in 500ms");
        });

        it("should report again even when the percentage is unchanged", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            reporter.setCompleted(10);
            spies.log().mockClear();

            reporter.finish();
            expect(spies.log()).toHaveBeenCalledTimes(1);
        });
    });

    describe("cancel", () => {
        it("should warn with the percentage reached", () => {
            const reporter = new ProgressReporter({ total: 4 });
            reporter.start();
            reporter.setCompleted(1);
            reporter.cancel();
            expect(spyOutput(spies.warn())).toContain("Cancelled at 25.0%");
        });
    });

    describe("getPercentage", () => {
        it("should return zero when the total is zero", () => {
            const reporter = new ProgressReporter({ total: 0 });
            reporter.start();
            expect(reporter.getPercentage()).toBe(0);
        });

        it("should scale with completion", () => {
            const reporter = new ProgressReporter({ total: 8 });
            reporter.start();
            reporter.setCompleted(2);
            expect(reporter.getPercentage()).toBe(25);
        });
    });

    describe("getElapsed", () => {
        it("should measure time since start", () => {
            const reporter = new ProgressReporter({ total: 4 });
            reporter.start();
            advance(2500);
            expect(reporter.getElapsed()).toBe(2500);
        });
    });

    describe("getState", () => {
        it("should report a null ETA before any progress is made", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            advance(1000);
            const state = reporter.getState();
            expect(state.rate).toBe(0);
            expect(state.eta).toBeNull();
        });

        it("should derive rate and ETA from the observed throughput", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            advance(1000);
            reporter.setCompleted(5);
            const state = reporter.getState();
            expect(state.rate).toBe(5); // 5 items in 1 second
            expect(state.eta).toBe(1000); // 5 remaining at 5/s
            expect(state.label).toBe("Processing");
            expect(state.total).toBe(10);
        });
    });

    describe("duration formatting", () => {
        it("should render sub-second ETAs in milliseconds", () => {
            const reporter = new ProgressReporter({
                total: 100,
                updateInterval: 0,
            });
            reporter.start();
            advance(1000);
            reporter.setCompleted(99); // 99/s, 1 remaining -> ~10ms
            expect(spyOutput(spies.log())).toContain("ETA: 10ms");
        });

        it("should render multi-second ETAs in seconds", () => {
            const reporter = new ProgressReporter({
                total: 100,
                updateInterval: 0,
            });
            reporter.start();
            advance(1000);
            reporter.setCompleted(10); // 10/s, 90 remaining -> 9s
            expect(spyOutput(spies.log())).toContain("ETA: 9.0s");
        });

        it("should render long ETAs in minutes and seconds", () => {
            const reporter = new ProgressReporter({
                total: 1000,
                updateInterval: 0,
            });
            reporter.start();
            advance(1000);
            reporter.setCompleted(10); // 10/s, 990 remaining -> 99s
            expect(spyOutput(spies.log())).toContain("ETA: 1m 39s");
        });

        it("should render long elapsed times in minutes and seconds", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            advance(125_000);
            spies.log().mockClear();
            reporter.finish();
            expect(spyOutput(spies.log())).toContain("Done in 2m 5s");
        });

        it("should render mid-range elapsed times in seconds", () => {
            const reporter = new ProgressReporter({ total: 10 });
            reporter.start();
            advance(5_000);
            spies.log().mockClear();
            reporter.finish();
            expect(spyOutput(spies.log())).toContain("Done in 5.0s");
        });
    });

    describe("ETA visibility", () => {
        it("should omit the ETA when disabled", () => {
            const reporter = new ProgressReporter({
                total: 100,
                showEta: false,
                updateInterval: 0,
            });
            reporter.start();
            advance(1000);
            reporter.setCompleted(10);
            expect(spyOutput(spies.log())).not.toContain("ETA");
        });
    });
});

describe("createFileProgress", () => {
    silenceConsole();

    it("should build a reporter with the default label", () => {
        const reporter = createFileProgress(12);
        reporter.start();
        expect(reporter.getState().label).toBe("Processing files");
        expect(reporter.getState().total).toBe(12);
    });

    it("should accept a custom label", () => {
        const reporter = createFileProgress(3, "Copying");
        reporter.start();
        expect(reporter.getState().label).toBe("Copying");
    });
});

describe("createBuildProgress", () => {
    silenceConsole();

    it("should build a reporter with the default label", () => {
        const reporter = createBuildProgress(5);
        reporter.start();
        expect(reporter.getState().label).toBe("Building");
        expect(reporter.getState().total).toBe(5);
    });

    it("should accept a custom label", () => {
        const reporter = createBuildProgress(5, "Bundling");
        reporter.start();
        expect(reporter.getState().label).toBe("Bundling");
    });
});
