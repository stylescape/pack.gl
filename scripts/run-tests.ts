import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

async function runTests() {
    try {
        console.log("Running tests...");

        // Resolve paths
        const jestConfigPath = resolve(__dirname, "../jest.config.cjs");

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

runTests();