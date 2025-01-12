// ============================================================================
// Import
// ============================================================================

import { exec } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

// ============================================================================
// Constants
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

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

        // Run Jest
        const command = `npx jest --config ${jestConfigPath}`;
        const { stdout, stderr } = await execAsync(command);

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
