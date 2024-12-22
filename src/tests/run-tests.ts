// ============================================================================
// Import
// ============================================================================

import { exec } from "child_process";
import path from "path";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Executes a shell command and returns the output as a Promise.
 * @param command - The command to execute.
 * @returns A promise that resolves with the command's output or rejects with an error.
 */
function runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const process = exec(command);

        // Log output from the test process
        process.stdout?.on("data", (data) => console.log(data));
        process.stderr?.on("data", (data) => console.error(data));

        process.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
    });
}

// ============================================================================
// Main
// ============================================================================

/**
 * Runs all test files using Jest.
 */
async function runTests() {
    try {
        const testPath = path.resolve(__dirname, "../src/tests");
        console.log(`Running tests in: ${testPath}`);

        // Run Jest on all test files
        await runCommand(`npx jest ${testPath}`);
        console.log("All tests executed successfully.");
    } catch (error) {
        console.error("Error running tests:", error);
        process.exit(1);
    }
}

// Execute the test runner
runTests();
