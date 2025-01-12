import { OptionsValidator } from "../../core/validation/OptionsValidator";
import { ArgumentParser } from "../../ts/cli/ArgumentParser";

// Mock OptionsValidator to avoid actual validation
jest.mock("../core/validation/OptionsValidator");

describe("ArgumentParser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Initialization", () => {
        it("should initialize with default arguments", () => {
            process.argv = [
                "node",
                "script.js",
                "--live",
                "--mode",
                "development",
            ];
            const parser = new ArgumentParser();
            expect(parser).toBeDefined();
            expect(parser["args"]).toEqual([
                "--live",
                "--mode",
                "development",
            ]);
        });
    });

    describe("getOption", () => {
        it("should retrieve the value of a specified option", () => {
            process.argv = ["node", "script.js", "--mode", "development"];
            const parser = new ArgumentParser();
            const mode = parser.getOption("mode");
            expect(mode).toBe("development");
        });

        it("should return the default value if the option is not specified", () => {
            process.argv = ["node", "script.js"];
            const parser = new ArgumentParser();
            const mode = parser.getOption("mode", { default: "production" });
            expect(mode).toBe("production");
        });

        it("should validate the retrieved option using OptionsValidator", () => {
            process.argv = ["node", "script.js", "--mode", "development"];
            const parser = new ArgumentParser();
            parser.getOption("mode");
            expect(OptionsValidator.prototype.validate).toHaveBeenCalledWith({
                mode: "development",
            });
        });
    });

    describe("hasFlag", () => {
        it("should return true if the flag is present", () => {
            process.argv = ["node", "script.js", "--live"];
            const parser = new ArgumentParser();
            const hasLive = parser.hasFlag("live");
            expect(hasLive).toBe(true);
        });

        it("should return false if the flag is not present", () => {
            process.argv = ["node", "script.js"];
            const parser = new ArgumentParser();
            const hasLive = parser.hasFlag("live");
            expect(hasLive).toBe(false);
        });
    });

    describe("getAllFlags", () => {
        it("should parse all CLI arguments into a key-value object", () => {
            process.argv = [
                "node",
                "script.js",
                "--live",
                "--mode",
                "development",
            ];
            const parser = new ArgumentParser();
            const flags = parser.getAllFlags();
            expect(flags).toEqual({
                live: true,
                mode: "development",
            });
        });

        it("should treat standalone flags as boolean true", () => {
            process.argv = ["node", "script.js", "--live"];
            const parser = new ArgumentParser();
            const flags = parser.getAllFlags();
            expect(flags).toEqual({ live: true });
        });
    });

    describe("getFlag", () => {
        it("should retrieve a specific flag value", () => {
            process.argv = ["node", "script.js", "--mode", "development"];
            const parser = new ArgumentParser();
            const mode = parser.getFlag("mode");
            expect(mode).toBe("development");
        });

        it("should return the default value if the flag is not present", () => {
            process.argv = ["node", "script.js"];
            const parser = new ArgumentParser();
            const mode = parser.getFlag("mode", "production");
            expect(mode).toBe("production");
        });

        it("should treat standalone flags as boolean true", () => {
            process.argv = ["node", "script.js", "--live"];
            const parser = new ArgumentParser();
            const live = parser.getFlag("live", false);
            expect(live).toBe(true);
        });
    });
});
