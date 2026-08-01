// ============================================================================
// ArgumentParser Tests
// ============================================================================

import { ArgumentParser } from "../src/ts/cli/ArgumentParser";
import { silenceConsole, spyOutput } from "./helpers/silence";

describe("ArgumentParser", () => {
    const spies = silenceConsole();
    let originalArgv: string[];

    beforeEach(() => {
        originalArgv = process.argv;
    });

    afterEach(() => {
        process.argv = originalArgv;
    });

    /** Builds a parser over the given CLI arguments. */
    function parserFor(...args: string[]): ArgumentParser {
        process.argv = ["node", "cli.js", ...args];
        return new ArgumentParser();
    }

    // ------------------------------------------------------------------------
    // getOption
    // ------------------------------------------------------------------------

    describe("getOption", () => {
        it("should read the value that follows the flag", () => {
            const parser = parserFor("--logLevel", "debug");
            expect(parser.getOption("logLevel")).toBe("debug");
        });

        it("should fall back to the supplied default", () => {
            const parser = parserFor();
            expect(parser.getOption("logLevel", { default: "warn" })).toBe(
                "warn",
            );
        });

        it("should fall back to the default when the flag has no value", () => {
            const parser = parserFor("--logLevel");
            expect(parser.getOption("logLevel", { default: "error" })).toBe(
                "error",
            );
        });

        it("should return undefined when neither flag nor default is given", () => {
            const parser = parserFor();
            expect(parser.getOption("logLevel")).toBeUndefined();
        });

        it("should skip validation when the value is undefined", () => {
            const parser = parserFor();
            expect(parser.getOption("configPath")).toBeUndefined();
        });

        it("should reject a value that fails validation", () => {
            const parser = parserFor("--logLevel", "verbose");
            expect(() => parser.getOption("logLevel")).toThrow(
                /Allowed values are/,
            );
        });

        it("should log the resolved value", () => {
            const parser = parserFor("--configPath", "./kist.yml");
            parser.getOption("configPath");
            expect(spyOutput(spies.log())).toContain(
                'Retrieved option "configPath" with value: ./kist.yml',
            );
        });
    });

    // ------------------------------------------------------------------------
    // hasFlag
    // ------------------------------------------------------------------------

    describe("hasFlag", () => {
        it("should detect a present flag", () => {
            const parser = parserFor("--live");
            expect(parser.hasFlag("live")).toBe(true);
            expect(spyOutput(spies.log())).toContain(
                'Flag "--live" is present.',
            );
        });

        it("should report an absent flag", () => {
            const parser = parserFor();
            expect(parser.hasFlag("live")).toBe(false);
            expect(spyOutput(spies.log())).toContain(
                'Flag "--live" is not present.',
            );
        });
    });

    // ------------------------------------------------------------------------
    // getAllFlags
    // ------------------------------------------------------------------------

    describe("getAllFlags", () => {
        it("should return an empty object with no arguments", () => {
            expect(parserFor().getAllFlags()).toEqual({});
        });

        it("should pair a flag with the value that follows it", () => {
            expect(parserFor("--mode", "development").getAllFlags()).toEqual({
                mode: "development",
            });
        });

        it("should treat a trailing flag as boolean true", () => {
            expect(parserFor("--live").getAllFlags()).toEqual({ live: true });
        });

        it("should treat a flag followed by another flag as boolean true", () => {
            expect(parserFor("--live", "--mode", "dev").getAllFlags()).toEqual(
                {
                    live: true,
                    mode: "dev",
                },
            );
        });

        it("should ignore positional arguments", () => {
            expect(parserFor("build", "--mode", "dev").getAllFlags()).toEqual({
                mode: "dev",
            });
        });

        it("should not consume a value as the next flag", () => {
            expect(
                parserFor("--config", "kist.yml", "--live").getAllFlags(),
            ).toEqual({ config: "kist.yml", live: true });
        });
    });

    // ------------------------------------------------------------------------
    // getFlag
    // ------------------------------------------------------------------------

    describe("getFlag", () => {
        it("should return the value of a present flag", () => {
            expect(parserFor("--config", "kist.yml").getFlag("config")).toBe(
                "kist.yml",
            );
        });

        it("should return false by default for a missing flag", () => {
            expect(parserFor().getFlag("config")).toBe(false);
        });

        it("should return the supplied default for a missing flag", () => {
            expect(parserFor().getFlag("config", "kist.yaml")).toBe(
                "kist.yaml",
            );
        });

        it("should prefer a present boolean flag over the default", () => {
            expect(parserFor("--live").getFlag("live", "no")).toBe(true);
        });
    });
});
