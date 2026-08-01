// ============================================================================
// Shared Test Helpers
// ============================================================================

import { Logger } from "../../src/ts/logger/Logger";

/**
 * Silences the console for the duration of a suite and resets the Logger
 * singleton around each test so that log-level state never leaks between
 * suites. Returns the spies so individual tests can assert on output.
 */
export function silenceConsole(
    logLevel: "debug" | "info" | "warn" | "error" = "debug",
): {
    log: () => jest.SpyInstance;
    warn: () => jest.SpyInstance;
    error: () => jest.SpyInstance;
} {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        Logger.resetInstance();
        Logger.getInstance(logLevel);
        logSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        errorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Logger.resetInstance();
    });

    return {
        log: () => logSpy,
        warn: () => warnSpy,
        error: () => errorSpy,
    };
}

/** Concatenates every argument of every call to a console spy. */
export function spyOutput(spy: jest.SpyInstance): string {
    return spy.mock.calls.map((call) => call.join(" ")).join("\n");
}
