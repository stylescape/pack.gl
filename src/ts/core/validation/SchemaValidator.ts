// ============================================================================
// Import
// ============================================================================

import Ajv from "ajv";
import type { ErrorObject, ValidateFunction } from "ajv";
import { KIST_SCHEMA } from "../../config/kistSchema.js";
import { ConfigValidationError } from "../../errors/index.js";
import { AbstractProcess } from "../abstract/AbstractProcess.js";

// ============================================================================
// Class
// ============================================================================

/**
 * Validates a configuration object against the published kist JSON Schema.
 *
 * This runs before any stage or step is constructed, so a malformed
 * `kist.yml` is reported as a list of concrete problems ("options.live.port
 * must be <= 65535") rather than surfacing later as a type error deep inside
 * the pipeline. The same schema powers editor completion, so what the editor
 * accepts and what the runtime accepts cannot drift.
 *
 * @example
 * ```typescript
 * new SchemaValidator().validate(config); // throws ConfigValidationError
 * ```
 */
export class SchemaValidator extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Compiled validator, built once and reused across calls.
     */
    private static compiled: ValidateFunction | null = null;

    // Methods
    // ========================================================================

    /**
     * Validates a configuration object.
     *
     * @param config - The parsed configuration, before defaults are merged.
     * @throws ConfigValidationError listing every schema violation found.
     */
    public validate(config: unknown, configPath?: string): void {
        const validate = SchemaValidator.getValidator();

        if (validate(config)) {
            this.logDebug("Configuration matches the kist schema.");
            return;
        }

        // ajv populates `errors` whenever the validator returns false, so the
        // cast is safe here and avoids an unreachable empty-list case.
        const problems = (validate.errors as ErrorObject[]).map((error) =>
            SchemaValidator.describe(error),
        );

        // De-duplicate: a failing `oneOf` reports both the branch failures and
        // the union failure, which reads as three problems for one mistake.
        const unique = Array.from(new Set(problems));

        this.logError(
            "Configuration does not match the kist schema. " +
                "The full reference is at https://www.getkist.com/schema.json",
        );

        throw new ConfigValidationError(unique, configPath);
    }

    // Static Methods
    // ========================================================================

    /**
     * Compiles the schema on first use.
     *
     * @returns The compiled ajv validation function.
     */
    private static getValidator(): ValidateFunction {
        if (!SchemaValidator.compiled) {
            // `allErrors` so one run reports every problem rather than making
            // the user fix them one at a time. `strict: false` because the
            // schema uses the annotation keyword `deprecated`, which ajv's
            // strict mode rejects for draft-07.
            const ajv = new Ajv({
                allErrors: true,
                strict: false,
                allowUnionTypes: true,
            });
            SchemaValidator.compiled = ajv.compile(KIST_SCHEMA);
        }
        return SchemaValidator.compiled;
    }

    /**
     * Renders one ajv error as a line a person can act on.
     *
     * @param error - A raw ajv error object.
     * @returns A human-readable description, prefixed with the config path.
     */
    private static describe(error: ErrorObject): string {
        // ajv reports "" for the document root; name it so the message is not
        // "  must have required property 'stages'".
        const where = error.instancePath
            ? error.instancePath.slice(1).split("/").join(".")
            : "(root)";

        if (error.keyword === "additionalProperties") {
            const extra = (error.params as { additionalProperty: string })
                .additionalProperty;
            return `${where}: unknown property "${extra}"`;
        }

        if (error.keyword === "enum") {
            const allowed = (error.params as { allowedValues: unknown[] })
                .allowedValues;
            return `${where}: must be one of ${allowed
                .map((value) => JSON.stringify(value))
                .join(", ")}`;
        }

        return `${where}: ${error.message}`;
    }

    /**
     * Drops the compiled validator. Used by tests.
     */
    public static reset(): void {
        SchemaValidator.compiled = null;
    }
}
