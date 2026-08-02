// ============================================================================
// Schema Tests
// ============================================================================

import { readFileSync } from "fs";
import { join } from "path";
import { KIST_SCHEMA } from "../src/ts/config/kistSchema";
import { SchemaValidator } from "../src/ts/core/validation/SchemaValidator";
import { ConfigValidationError } from "../src/ts/errors/index";
import { VERSION } from "../src/ts/version";
import { silenceConsole } from "./helpers/silence";

/** A configuration that satisfies the schema, used as an edit base. */
function validConfig(): Record<string, unknown> {
    return {
        stages: [
            {
                name: "build",
                steps: [
                    {
                        name: "copy",
                        action: "FileCopyAction",
                        options: { srcFile: "./a", destDir: "./b" },
                    },
                ],
            },
        ],
    };
}

describe("kist schema", () => {
    silenceConsole();

    beforeEach(() => SchemaValidator.reset());

    // ------------------------------------------------------------------------
    // Published copy
    // ------------------------------------------------------------------------

    it("should match the JSON file published for editors", () => {
        // The file at schema/kist.schema.json is what SchemaStore and the
        // `$schema` modeline point at. If it drifts from the module the
        // runtime validates against, editors and kist would disagree.
        const published = JSON.parse(
            readFileSync(
                join(__dirname, "..", "schema", "kist.schema.json"),
                "utf-8",
            ),
        );

        expect(published).toEqual(JSON.parse(JSON.stringify(KIST_SCHEMA)));
    });

    it("should be the same version the CLI reports", () => {
        const pkg = JSON.parse(
            readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
        );
        expect(VERSION).toBe(pkg.version);
    });

    // ------------------------------------------------------------------------
    // Acceptance
    // ------------------------------------------------------------------------

    describe("accepts", () => {
        it("a minimal configuration", () => {
            expect(() =>
                new SchemaValidator().validate(validConfig()),
            ).not.toThrow();
        });

        it("an empty stage list", () => {
            expect(() =>
                new SchemaValidator().validate({ stages: [] }),
            ).not.toThrow();
        });

        it("the full option surface", () => {
            const config = {
                ...validConfig(),
                $schema: "https://www.getkist.com/schema.json",
                metadata: { name: "p", tags: { env: "ci" } },
                options: {
                    mode: "development",
                    logLevel: "debug",
                    haltOnFailure: false,
                    live: { enabled: true, port: 3000, root: "public" },
                    cache: { enabled: true, cacheDir: ".kist-cache" },
                    performance: {
                        maxConcurrentStages: 4,
                        maxConcurrentSteps: 8,
                    },
                    pipeline: {
                        stepTimeout: 1000,
                        retryStrategy: { retries: 1, delay: 10 },
                    },
                },
            };

            expect(() => new SchemaValidator().validate(config)).not.toThrow();
        });

        it("caching declarations on a step", () => {
            const config = validConfig();
            Object.assign((config.stages as never[])[0]["steps"][0], {
                inputs: ["src/**/*.ts"],
                outputs: ["dist/**"],
                env: ["NODE_ENV"],
            });

            expect(() => new SchemaValidator().validate(config)).not.toThrow();
        });

        it("extends as a string or a list", () => {
            expect(() =>
                new SchemaValidator().validate({
                    ...validConfig(),
                    extends: "./base.yml",
                }),
            ).not.toThrow();

            expect(() =>
                new SchemaValidator().validate({
                    ...validConfig(),
                    extends: ["./base.yml", "./more.yml"],
                }),
            ).not.toThrow();
        });
    });

    // ------------------------------------------------------------------------
    // Rejection
    // ------------------------------------------------------------------------

    describe("rejects", () => {
        it("a missing stages list", () => {
            expect(() => new SchemaValidator().validate({})).toThrow(
                ConfigValidationError,
            );
        });

        it("a misspelled top-level property, naming it", () => {
            expect(() =>
                new SchemaValidator().validate({
                    ...validConfig(),
                    stagez: [],
                }),
            ).toThrow(/unknown property "stagez"/);
        });

        it("a misspelled step property, pointing at the step", () => {
            const config = validConfig();
            Object.assign((config.stages as never[])[0]["steps"][0], {
                inptus: ["a"],
            });

            expect(() => new SchemaValidator().validate(config)).toThrow(
                /stages\.0\.steps\.0: unknown property "inptus"/,
            );
        });

        it("a log level outside the allowed set, listing them", () => {
            expect(() =>
                new SchemaValidator().validate({
                    ...validConfig(),
                    options: { logLevel: "verbose" },
                }),
            ).toThrow(/must be one of "debug", "info", "warn", "error"/);
        });

        it("a port outside the valid range", () => {
            expect(() =>
                new SchemaValidator().validate({
                    ...validConfig(),
                    options: { live: { port: 99999 } },
                }),
            ).toThrow(/options\.live\.port/);
        });

        it("a step without an action", () => {
            expect(() =>
                new SchemaValidator().validate({
                    stages: [{ name: "s", steps: [{ name: "no-action" }] }],
                }),
            ).toThrow(/stages\.0\.steps\.0/);
        });

        it("an empty step name", () => {
            expect(() =>
                new SchemaValidator().validate({
                    stages: [
                        { name: "s", steps: [{ name: "", action: "A" }] },
                    ],
                }),
            ).toThrow(ConfigValidationError);
        });

        it("a non-string entry in inputs", () => {
            const config = validConfig();
            Object.assign((config.stages as never[])[0]["steps"][0], {
                inputs: [42],
            });

            expect(() => new SchemaValidator().validate(config)).toThrow(
                /inputs\.0/,
            );
        });

        it("naming the root when the problem is the document itself", () => {
            expect(() => new SchemaValidator().validate({})).toThrow(
                /\(root\)/,
            );
        });

        it("and reports the file path it was given", () => {
            try {
                new SchemaValidator().validate({}, "/path/kist.yml");
                throw new Error("should have thrown");
            } catch (error) {
                expect((error as ConfigValidationError).context).toMatchObject(
                    { configPath: "/path/kist.yml" },
                );
            }
        });

        it("and reports every problem at once", () => {
            try {
                new SchemaValidator().validate({
                    stagez: [],
                    options: { logLevel: "nope" },
                });
                throw new Error("should have thrown");
            } catch (error) {
                const problems = (error as ConfigValidationError)
                    .validationErrors;
                expect(problems.length).toBeGreaterThan(1);
            }
        });
    });
});
