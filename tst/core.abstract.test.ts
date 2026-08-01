// ============================================================================
// Core Abstract Base Class Tests
// ============================================================================

import { AbstractProcess } from "../src/ts/core/abstract/AbstractProcess";
import { AbstractSingleton } from "../src/ts/core/abstract/AbstractSingleton";
import { AbstractValidator } from "../src/ts/core/abstract/AbstractValidator";
import { Logger } from "../src/ts/logger/Logger";

// ----------------------------------------------------------------------------
// Test doubles
// ----------------------------------------------------------------------------

/** Exposes AbstractProcess' protected logging API for assertions. */
class TestProcess extends AbstractProcess {
    public info(message: string): void {
        this.logInfo(message);
    }
    public debug(message: string): void {
        this.logDebug(message);
    }
    public warn(message: string): void {
        this.logWarn(message);
    }
    public error(message: string, error?: unknown): void {
        this.logError(message, error);
    }
    public success(message: string): void {
        this.logSuccess(message);
    }
}

interface Shape {
    count: number;
    enabled: boolean;
    name: string;
    meta: Record<string, unknown>;
}

/** Exposes AbstractValidator's protected helpers for assertions. */
class TestValidator extends AbstractValidator<Shape> {
    public validatedKeys: (keyof Shape)[] = [];

    protected validateProperty<K extends keyof Shape>(
        key: K,
        value: Shape[K],
    ): void {
        this.validatedKeys.push(key);
        switch (key) {
            case "count":
                this.validateNumber(key, value);
                break;
            case "enabled":
                this.validateBoolean(key, value);
                break;
            case "name":
                this.validateString(key, value);
                break;
            default:
                this.validateObject(key, value);
        }
        this.logValidationSuccess(key, value);
    }

    public checkNumber(value: unknown): void {
        this.validateNumber("count", value as number);
    }
    public checkBoolean(value: unknown): void {
        this.validateBoolean("enabled", value as boolean);
    }
    public checkString(value: unknown): void {
        this.validateString("name", value as string);
    }
    public checkObject(value: unknown): void {
        this.validateObject("meta", value as Record<string, unknown>);
    }
    public fail(): void {
        this.throwValidationError("name", "bad" as never, "Custom reason.");
    }
}

class SingletonA extends AbstractSingleton<SingletonA> {
    public value = "a";
    public constructor() {
        super();
    }
}

class SingletonB extends AbstractSingleton<SingletonB> {
    public value = "b";
    public constructor() {
        super();
    }
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe("AbstractProcess", () => {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        Logger.resetInstance();
        Logger.getInstance("debug");
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

    it("should tag log output with the subclass name", () => {
        new TestProcess().info("hello");
        expect(logSpy.mock.calls[0][0]).toContain("TestProcess");
        expect(logSpy.mock.calls[0][0]).toContain("hello");
    });

    it("should forward debug messages", () => {
        new TestProcess().debug("dbg");
        expect(logSpy.mock.calls[0][0]).toContain("[DEBUG]");
    });

    it("should forward warnings", () => {
        new TestProcess().warn("careful");
        expect(warnSpy.mock.calls[0][0]).toContain("[WARN]");
    });

    it("should forward success messages as info", () => {
        new TestProcess().success("done");
        expect(logSpy.mock.calls[0][0]).toContain("[INFO]");
        expect(logSpy.mock.calls[0][0]).toContain("done");
    });

    describe("logError formatting", () => {
        it("should append the message of an Error instance", () => {
            new TestProcess().error("failed", new Error("root"));
            expect(errorSpy.mock.calls[0][0]).toContain("failed: root");
        });

        it("should append a string error verbatim", () => {
            new TestProcess().error("failed", "reason");
            expect(errorSpy.mock.calls[0][0]).toContain("failed: reason");
        });

        it("should JSON-stringify other truthy error values", () => {
            new TestProcess().error("failed", { code: 7 });
            expect(errorSpy.mock.calls[0][0]).toContain('failed: {"code":7}');
        });

        it("should leave the message untouched when no error is given", () => {
            new TestProcess().error("failed");
            expect(errorSpy.mock.calls[0][0]).toContain("failed");
            expect(errorSpy.mock.calls[0][0]).not.toContain("failed:");
        });

        it("should leave the message untouched for falsy error values", () => {
            new TestProcess().error("failed", null);
            expect(errorSpy.mock.calls[0][0]).not.toContain("failed:");
        });
    });
});

describe("AbstractSingleton", () => {
    beforeEach(() => {
        SingletonA.clearInstance();
        SingletonB.clearInstance();
    });

    afterEach(() => {
        SingletonA.clearInstance();
        SingletonB.clearInstance();
    });

    it("should return the same instance for repeated getInstance calls", () => {
        const first = SingletonA.getInstance();
        const second = SingletonA.getInstance();
        expect(first).toBe(second);
        expect(first.value).toBe("a");
    });

    it("should keep instances of different subclasses separate", () => {
        const a = SingletonA.getInstance();
        const b = SingletonB.getInstance();
        expect(a).not.toBe(b);
        expect(b.value).toBe("b");
    });

    it("should throw when a second instance is constructed directly", () => {
        SingletonA.getInstance();
        expect(() => new SingletonA()).toThrow(
            "SingletonA is a singleton and has already been instantiated.",
        );
    });

    it("should allow re-instantiation after clearInstance", () => {
        const first = SingletonA.getInstance();
        SingletonA.clearInstance();
        const second = SingletonA.getInstance();
        expect(second).not.toBe(first);
    });

    it("should register an instance created via the constructor", () => {
        const direct = new SingletonA();
        expect(SingletonA.getInstance()).toBe(direct);
    });
});

describe("AbstractValidator", () => {
    let validator: TestValidator;

    beforeEach(() => {
        Logger.resetInstance();
        Logger.getInstance("debug");
        jest.spyOn(console, "log").mockImplementation(() => undefined);
        jest.spyOn(console, "error").mockImplementation(() => undefined);
        validator = new TestValidator();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Logger.resetInstance();
    });

    describe("validate", () => {
        it("should validate every own property", () => {
            validator.validate({
                count: 1,
                enabled: true,
                name: "kist",
                meta: {},
            });
            expect(validator.validatedKeys).toEqual([
                "count",
                "enabled",
                "name",
                "meta",
            ]);
        });

        it("should throw when the target is null", () => {
            expect(() => validator.validate(null as unknown as Shape)).toThrow(
                "Target must be a valid object.",
            );
        });

        it("should throw when the target is not an object", () => {
            expect(() =>
                validator.validate("nope" as unknown as Shape),
            ).toThrow("Target must be a valid object.");
        });

        it("should skip inherited properties", () => {
            const base = { count: 1 };
            const target = Object.create(base) as Shape;
            target.name = "kist";
            validator.validate(target);
            expect(validator.validatedKeys).toEqual(["name"]);
        });
    });

    describe("validateNumber", () => {
        it("should accept a non-negative number", () => {
            expect(() => validator.checkNumber(0)).not.toThrow();
        });

        it("should reject a non-number", () => {
            expect(() => validator.checkNumber("5")).toThrow(
                /Must be a non-negative number/,
            );
        });

        it("should reject a negative number", () => {
            expect(() => validator.checkNumber(-1)).toThrow(
                /Must be a non-negative number/,
            );
        });
    });

    describe("validateBoolean", () => {
        it("should accept a boolean", () => {
            expect(() => validator.checkBoolean(false)).not.toThrow();
        });

        it("should reject a non-boolean", () => {
            expect(() => validator.checkBoolean("true")).toThrow(
                /Must be a boolean/,
            );
        });
    });

    describe("validateString", () => {
        it("should accept a non-empty string", () => {
            expect(() => validator.checkString("kist")).not.toThrow();
        });

        it("should reject a non-string", () => {
            expect(() => validator.checkString(42)).toThrow(
                /Must be a non-empty string/,
            );
        });

        it("should reject a whitespace-only string", () => {
            expect(() => validator.checkString("   ")).toThrow(
                /Must be a non-empty string/,
            );
        });
    });

    describe("validateObject", () => {
        it("should accept a plain object", () => {
            expect(() => validator.checkObject({ a: 1 })).not.toThrow();
        });

        it("should reject a non-object", () => {
            expect(() => validator.checkObject("nope")).toThrow(
                /Must be a valid object/,
            );
        });

        it("should reject null", () => {
            expect(() => validator.checkObject(null)).toThrow(
                /Must be a valid object/,
            );
        });

        it("should reject an array", () => {
            expect(() => validator.checkObject([1, 2])).toThrow(
                /Must be a valid object/,
            );
        });
    });

    describe("throwValidationError", () => {
        it("should include the key, value and message", () => {
            expect(() => validator.fail()).toThrow(
                /Validation failed for "name"/,
            );
            expect(() => validator.fail()).toThrow(/Custom reason\./);
        });
    });
});
