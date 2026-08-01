// ============================================================================
// Logger Tests
// ============================================================================

import { Logger } from "../src/ts/logger/Logger";
import { LoggerStyles } from "../src/ts/logger/LoggerStyles";

describe("LoggerStyles", () => {
    it("should expose ANSI escape codes", () => {
        expect(LoggerStyles.Reset).toBe("\x1b[0m");
        expect(LoggerStyles.Bold).toBe("\x1b[1m");
        expect(LoggerStyles.Dim).toBe("\x1b[2m");
        expect(LoggerStyles.Red).toBe("\x1b[31m");
        expect(LoggerStyles.Green).toBe("\x1b[32m");
        expect(LoggerStyles.Yellow).toBe("\x1b[33m");
        expect(LoggerStyles.Blue).toBe("\x1b[34m");
        expect(LoggerStyles.Magenta).toBe("\x1b[35m");
        expect(LoggerStyles.Cyan).toBe("\x1b[36m");
        expect(LoggerStyles.Gray).toBe("\x1b[90m");
        expect(LoggerStyles.BgRed).toBe("\x1b[41m");
        expect(LoggerStyles.BgGreen).toBe("\x1b[42m");
        expect(LoggerStyles.BgYellow).toBe("\x1b[43m");
        expect(LoggerStyles.BgBlue).toBe("\x1b[44m");
        expect(LoggerStyles.BgMagenta).toBe("\x1b[45m");
        expect(LoggerStyles.BgCyan).toBe("\x1b[46m");
        expect(LoggerStyles.BgGray).toBe("\x1b[100m");
    });
});

describe("Logger", () => {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        Logger.resetInstance();
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

    describe("getInstance", () => {
        it("should return the same instance on repeated calls", () => {
            const first = Logger.getInstance();
            const second = Logger.getInstance();
            expect(first).toBe(second);
        });

        it("should ignore the log level once an instance exists", () => {
            const first = Logger.getInstance("error");
            const second = Logger.getInstance("debug");
            expect(second).toBe(first);
            // Still at "error": a debug message must not be emitted.
            second.logDebug("Ctx", "hidden");
            expect(logSpy).not.toHaveBeenCalled();
        });

        it("should default to the info level", () => {
            const logger = Logger.getInstance();
            logger.logDebug("Ctx", "hidden");
            expect(logSpy).not.toHaveBeenCalled();
            logger.logInfo("Ctx", "visible");
            expect(logSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("resetInstance", () => {
        it("should allow a fresh instance to be created", () => {
            const first = Logger.getInstance();
            Logger.resetInstance();
            expect(Logger.getInstance()).not.toBe(first);
        });
    });

    describe("logging methods", () => {
        it("should route info messages to console.log", () => {
            const logger = Logger.getInstance("debug");
            logger.logInfo("MyContext", "hello");
            expect(logSpy).toHaveBeenCalledTimes(1);
            const message = logSpy.mock.calls[0][0] as string;
            expect(message).toContain("[INFO]");
            expect(message).toContain("MyContext");
            expect(message).toContain("hello");
            expect(message).toContain(LoggerStyles.Blue);
        });

        it("should route debug messages to console.log", () => {
            const logger = Logger.getInstance("debug");
            logger.logDebug("MyContext", "debugging");
            expect(logSpy).toHaveBeenCalledTimes(1);
            const message = logSpy.mock.calls[0][0] as string;
            expect(message).toContain("[DEBUG]");
            expect(message).toContain(LoggerStyles.Magenta);
        });

        it("should route warnings to console.warn", () => {
            const logger = Logger.getInstance("debug");
            logger.logWarn("MyContext", "careful");
            expect(warnSpy).toHaveBeenCalledTimes(1);
            const message = warnSpy.mock.calls[0][0] as string;
            expect(message).toContain("[WARN]");
            expect(message).toContain(LoggerStyles.Yellow);
        });

        it("should route errors to console.error with a background style", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("MyContext", "boom");
            expect(errorSpy).toHaveBeenCalledTimes(1);
            const message = errorSpy.mock.calls[0][0] as string;
            expect(message).toContain("[ERROR]");
            expect(message).toContain(LoggerStyles.Red);
            expect(message).toContain(LoggerStyles.BgYellow);
        });
    });

    describe("setLogLevel", () => {
        it("should suppress messages below the configured level", () => {
            const logger = Logger.getInstance("debug");
            logger.setLogLevel("error");
            logger.logDebug("Ctx", "no");
            logger.logInfo("Ctx", "no");
            logger.logWarn("Ctx", "no");
            expect(logSpy).not.toHaveBeenCalled();
            expect(warnSpy).not.toHaveBeenCalled();
            logger.logError("Ctx", "yes");
            expect(errorSpy).toHaveBeenCalledTimes(1);
        });

        it("should emit everything at the debug level", () => {
            const logger = Logger.getInstance("error");
            logger.setLogLevel("debug");
            logger.logDebug("Ctx", "a");
            logger.logInfo("Ctx", "b");
            logger.logWarn("Ctx", "c");
            logger.logError("Ctx", "d");
            expect(logSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("error formatting", () => {
        it("should append the message of an Error instance", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("Ctx", "failed", new Error("root cause"));
            expect(errorSpy.mock.calls[0][0]).toContain("failed: root cause");
        });

        it("should append a string error verbatim", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("Ctx", "failed", "plain reason");
            expect(errorSpy.mock.calls[0][0]).toContain(
                "failed: plain reason",
            );
        });

        it("should JSON-stringify other truthy error values", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("Ctx", "failed", { code: 42 });
            expect(errorSpy.mock.calls[0][0]).toContain('failed: {"code":42}');
        });

        it("should leave the message untouched when no error is given", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("Ctx", "failed");
            expect(errorSpy.mock.calls[0][0]).toContain("failed");
            expect(errorSpy.mock.calls[0][0]).not.toContain("failed:");
        });

        it("should leave the message untouched for falsy error values", () => {
            const logger = Logger.getInstance("debug");
            logger.logError("Ctx", "failed", 0);
            expect(errorSpy.mock.calls[0][0]).not.toContain("failed:");
        });
    });
});
