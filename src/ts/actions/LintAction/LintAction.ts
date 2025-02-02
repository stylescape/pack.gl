// ============================================================================
// Import
// ============================================================================

import { ESLint } from "eslint";
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

// ============================================================================
// Classes
// ============================================================================

/**
 * LintAction handles linting TypeScript and JavaScript files using ESLint.
 * This action can be configured to run in strict mode or automatically fix issues.
 */
export class LintAction extends Action {
    private eslint: ESLint;

    constructor() {
        super(); // Call the parent class constructor
        this.eslint = new ESLint({}); // Initialize ESLint with default config
    }

    async execute(options: ActionOptionsType): Promise<void> {
        const {
            targetFiles = ["src/**/*.ts"],
            fix = false,
            configPath = ".eslintrc.js",
        } = options;

        if (!targetFiles || targetFiles.length === 0) {
            throw new Error(
                "Invalid options: 'targetFiles' is required and must contain at least one file or directory.",
            );
        }

        this.logInfo(`Starting ESLint on: ${targetFiles.join(", ")}`);

        try {
            // Update ESLint instance with correct configuration
            this.eslint = new ESLint({ fix, overrideConfigFile: configPath });
            const results = await this.eslint.lintFiles(targetFiles);

            if (fix) {
                await ESLint.outputFixes(results);
            }

            const formatter = await this.eslint.loadFormatter("stylish");
            console.log(formatter.format(results));

            this.logInfo("ESLint linting completed successfully.");
        } catch (error) {
            this.logError("ESLint encountered an error.", error);
            throw error;
        }
    }

    /**
     * Provides a description of the action.
     *
     * @returns A string description of the action.
     */
    describe(): string {
        return "Runs ESLint on specified files and directories, with optional auto-fixing.";
    }
}
