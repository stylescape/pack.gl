// ============================================================================
// Constants
// ============================================================================

/**
 * JSON Schema describing a kist configuration file.
 *
 * This module is the source of truth. The copy published at
 * `schema/kist.schema.json` (and shipped in `dist/schema`) is emitted from
 * it by `npm run schema:emit`, and `tst/config.schema.test.ts` fails if the
 * two drift apart.
 *
 * Two consumers depend on it:
 * 1. {@link SchemaValidator}, which validates `kist.yml` before the pipeline
 *    is built, so a malformed file fails with a pointer to the offending key.
 * 2. Editors. Registered with SchemaStore and referenced by the
 *    `# yaml-language-server: $schema=...` modeline that `kist init` writes,
 *    it drives completion, hover documentation, and inline validation.
 *
 * Note that step and stage `hooks` are intentionally absent: they hold
 * functions and can only be supplied programmatically, never from YAML.
 */
export const KIST_SCHEMA = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://www.getkist.com/schema.json",
    title: "kist pipeline configuration",
    description:
        "Configuration for kist, a lightweight plugin-based package pipeline processor. See https://www.getkist.com for the full reference.",
    type: "object",
    required: ["stages"],
    additionalProperties: false,
    properties: {
        $schema: {
            type: "string",
            description:
                "URL of the JSON Schema describing this file. Editors use it for validation and completion.",
        },
        extends: {
            description:
                "Path or paths to parent configuration files to inherit from. Values in this file override inherited ones; stages are merged by name.",
            oneOf: [
                {
                    type: "string",
                },
                {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            ],
        },
        metadata: {
            $ref: "#/definitions/metadata",
        },
        options: {
            $ref: "#/definitions/options",
        },
        stages: {
            type: "array",
            description:
                "The stages that make up the pipeline. Stages run concurrently unless constrained by 'dependsOn' or the concurrency limit.",
            items: {
                $ref: "#/definitions/stage",
            },
        },
    },
    definitions: {
        metadata: {
            type: "object",
            description:
                "Descriptive information about this pipeline. Not used for execution.",
            additionalProperties: false,
            properties: {
                name: {
                    type: "string",
                },
                version: {
                    type: "string",
                },
                description: {
                    type: "string",
                },
                author: {
                    type: "string",
                },
                tags: {
                    type: "object",
                    additionalProperties: {
                        type: "string",
                    },
                },
                timestamp: {
                    type: "string",
                },
                license: {
                    type: "string",
                },
                documentation: {
                    type: "string",
                },
                contact: {
                    type: "string",
                },
                dependencies: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                environments: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            },
        },
        options: {
            type: "object",
            description: "Global settings applied across the whole pipeline.",
            properties: {
                mode: {
                    type: "string",
                    description:
                        "Free-form build mode label, available to actions.",
                    examples: ["development", "production"],
                },
                logLevel: {
                    enum: ["debug", "info", "warn", "error"],
                    default: "info",
                    description: "Lowest severity that is printed.",
                },
                configPath: {
                    type: "string",
                    description:
                        "Path to the configuration file, when overriding discovery.",
                },
                haltOnFailure: {
                    type: "boolean",
                    default: true,
                    description:
                        "Whether the first failing step aborts the run.",
                },
                maxConcurrentStages: {
                    type: "integer",
                    minimum: 0,
                    deprecated: true,
                    description:
                        "Deprecated. Use options.performance.maxConcurrentStages.",
                },
                live: {
                    $ref: "#/definitions/liveOptions",
                },
                cache: {
                    $ref: "#/definitions/cacheOptions",
                },
                performance: {
                    $ref: "#/definitions/performanceOptions",
                },
                pipeline: {
                    $ref: "#/definitions/pipelineOptions",
                },
            },
        },
        liveOptions: {
            type: "object",
            description:
                "Live reload: serves a directory and rebuilds when watched files change.",
            additionalProperties: false,
            properties: {
                enabled: {
                    type: "boolean",
                    default: false,
                },
                port: {
                    type: "integer",
                    minimum: 1,
                    maximum: 65535,
                    default: 3000,
                },
                root: {
                    type: "string",
                    default: "public",
                    description: "Directory served over HTTP.",
                },
                watchPaths: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description:
                        "Glob patterns that trigger a rebuild when changed.",
                },
                ignoredPaths: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description: "Glob patterns excluded from watching.",
                },
            },
        },
        cacheOptions: {
            type: "object",
            description:
                "Content-hash caching. A step is skipped when every file matched by its 'inputs' is unchanged.",
            additionalProperties: false,
            properties: {
                enabled: {
                    type: "boolean",
                    default: false,
                },
                cacheDir: {
                    type: "string",
                    default: ".kist-cache",
                },
                maxCacheSize: {
                    type: "integer",
                    minimum: 0,
                    description: "Maximum cache size in bytes.",
                },
                ttl: {
                    type: "integer",
                    minimum: 0,
                    description: "Entry lifetime in milliseconds.",
                },
                persistent: {
                    type: "boolean",
                    default: true,
                },
            },
        },
        performanceOptions: {
            type: "object",
            additionalProperties: false,
            properties: {
                maxConcurrentStages: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "Stages allowed to run at once. 0 means no limit.",
                },
                maxConcurrentSteps: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "Steps allowed to run at once inside a parallel stage.",
                },
                parallelProcessing: {
                    type: "boolean",
                    default: true,
                },
                streamingThreshold: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "File size in bytes above which actions stream instead of buffering.",
                },
                showProgress: {
                    type: "boolean",
                    default: true,
                },
                progressMinDuration: {
                    type: "integer",
                    minimum: 0,
                },
            },
        },
        pipelineOptions: {
            type: "object",
            additionalProperties: false,
            properties: {
                stepTimeout: {
                    type: "integer",
                    minimum: 0,
                    default: 0,
                    description:
                        "Default timeout in milliseconds for steps that do not set their own. 0 disables it.",
                },
                haltOnFailure: {
                    type: "boolean",
                    default: true,
                },
                maxConcurrentStages: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "Overridden by options.performance.maxConcurrentStages when both are set.",
                },
                retryStrategy: {
                    type: "object",
                    description: "Applies to every step. Off by default.",
                    additionalProperties: false,
                    properties: {
                        retries: {
                            type: "integer",
                            minimum: 0,
                            default: 0,
                        },
                        delay: {
                            type: "integer",
                            minimum: 0,
                            default: 0,
                            description:
                                "Milliseconds to wait between attempts.",
                        },
                    },
                },
            },
        },
        stage: {
            type: "object",
            required: ["name", "steps"],
            additionalProperties: false,
            properties: {
                name: {
                    type: "string",
                    minLength: 1,
                    description:
                        "Unique name, referenced by other stages' 'dependsOn'.",
                },
                steps: {
                    type: "array",
                    items: {
                        $ref: "#/definitions/step",
                    },
                },
                dependsOn: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description:
                        "Names of stages that must finish before this one starts.",
                },
                description: {
                    type: "string",
                },
                enabled: {
                    type: "boolean",
                    default: true,
                    description:
                        "Set false to skip the stage without deleting it.",
                },
                timeout: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "Milliseconds before the stage is treated as failed.",
                },
                priority: {
                    enum: ["low", "normal", "high"],
                    default: "normal",
                    description:
                        "Order preference among stages that are ready at the same time. Only matters when a concurrency limit forces a choice.",
                },
                tags: {
                    type: "object",
                    additionalProperties: {
                        type: "string",
                    },
                },
                parallel: {
                    type: "boolean",
                    default: false,
                    description:
                        "Run this stage's steps concurrently instead of in order.",
                },
                maxConcurrentSteps: {
                    type: "integer",
                    minimum: 1,
                },
                cacheEnabled: {
                    type: "boolean",
                    default: true,
                    description:
                        "Set false to make this stage's steps always run, even when caching is on globally.",
                },
            },
        },
        step: {
            type: "object",
            required: ["name", "action"],
            additionalProperties: false,
            properties: {
                name: {
                    type: "string",
                    minLength: 1,
                },
                action: {
                    type: "string",
                    minLength: 1,
                    description:
                        "Registered action name, from kist core or an installed @getkist/action-* plugin.",
                },
                options: {
                    type: "object",
                    description:
                        "Options passed to the action. The accepted keys depend on the action.",
                },
                enabled: {
                    type: "boolean",
                    default: true,
                },
                timeout: {
                    type: "integer",
                    minimum: 0,
                    description:
                        "Milliseconds before this step is treated as failed. Overrides options.pipeline.stepTimeout.",
                },
                description: {
                    type: "string",
                },
                tags: {
                    type: "object",
                    additionalProperties: {
                        type: "string",
                    },
                },
                inputs: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description:
                        "Files this step reads, as paths or globs. Declaring them opts the step into caching: it is skipped when they are all unchanged. A step with no inputs always runs.",
                    examples: [["src/**/*.ts", "tsconfig.json"]],
                },
                outputs: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description:
                        "Files this step produces. Archived on a miss and restored on a hit.",
                    examples: [["dist/**"]],
                },
                env: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                    description:
                        "Environment variables whose values are part of this step's cache key.",
                    examples: [["NODE_ENV"]],
                },
            },
        },
    },
} as const;
