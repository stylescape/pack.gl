// ============================================================================
// Import
// ============================================================================

import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// ============================================================================
// Constants
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Functions
// ============================================================================

function runTests() {
    console.log("Running tests...");

    // Resolve paths
    const jestConfigPath = resolve(__dirname, "../jest.config.cjs");

    // Run Jest with stdio inherited so output streams directly to console
    const child = spawn("npx", ["jest", "--config", jestConfigPath], {
        stdio: "inherit",
        shell: false,
    });

    child.on("exit", (code) => {
        process.exit(code ?? 1);
    });

    child.on("error", (error) => {
        console.error("Error running tests:", error);
        process.exit(1);
    });
}

// ============================================================================
// Main
// ============================================================================

runTests();
