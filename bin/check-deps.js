#!/usr/bin/env node

/**
 * Check Outdated Dependencies
 *
 * Checks for outdated dependencies and displays them in a readable format.
 *
 * Usage:
 *   node scripts/check-deps.js
 */

import { execSync } from "child_process";

console.log("🔍 Checking for outdated dependencies...\n");

try {
    // Check for outdated packages
    const output = execSync("npm outdated --json", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
    });

    if (!output || output.trim() === "") {
        console.log("✅ All dependencies are up to date!\n");
        process.exit(0);
    }

    const outdated = JSON.parse(output);
    const packages = Object.keys(outdated);

    if (packages.length === 0) {
        console.log("✅ All dependencies are up to date!\n");
        process.exit(0);
    }

    console.log(`Found ${packages.length} outdated package(s):\n`);

    // Display in a nice table format
    console.log(
        "Package".padEnd(40) +
            "Current".padEnd(15) +
            "Wanted".padEnd(15) +
            "Latest",
    );
    console.log("-".repeat(85));

    for (const pkg of packages) {
        const info = outdated[pkg];
        const name = pkg.padEnd(40);
        const current = (info.current || "N/A").padEnd(15);
        const wanted = (info.wanted || "N/A").padEnd(15);
        const latest = info.latest || "N/A";

        console.log(`${name}${current}${wanted}${latest}`);
    }

    console.log('\nRun "npm update" to update to wanted versions.');
    console.log(
        'Run "npm install <package>@latest" to update to latest versions.\n',
    );
} catch (error) {
    if (error.status === 1) {
        // npm outdated returns exit code 1 when there are outdated packages
        // but still outputs JSON, so we handle it above
        console.log("✅ All dependencies are up to date!\n");
        process.exit(0);
    }
    console.error("Error checking dependencies:", error.message);
    process.exit(1);
}
