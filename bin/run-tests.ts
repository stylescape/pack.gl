// ============================================================================
// Import
// ============================================================================

import { execFile } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

// ============================================================================
// Constants
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execFileAsync = promisify(execFile);

// ============================================================================
// Functions
// ============================================================================

async function runTests(): Promise<void> {
    try {
        console.log("Running tests...");

        // Resolve paths
        const jestConfigPath: string = resolve(
            __dirname,
            "../jest.config.cjs",
        );

        // Run Jest using execFile with array form (safe from shell injection)
        const { stdout, stderr } = await execFileAsync("npx", [
            "jest",
            "--config",
            jestConfigPath,
        ]);

        if (stderr) {
            console.error("Test errors:", stderr);
        }

        console.log("Test output:", stdout);
    } catch (error) {
        console.error("Error running tests:", error);
    }
}

// ============================================================================
// Main
// ============================================================================

runTests();
