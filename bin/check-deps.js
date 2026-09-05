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

/**
 * Runs `npm outdated --json` and returns its report.
 *
 * npm exits 1 precisely *because* packages are outdated, which makes
 * `execSync` throw on the one path that has something to report. The JSON is
 * on the thrown error's `stdout`, so it is read from there rather than
 * treating the exit status as a failure — the previous version discarded it
 * and announced that everything was up to date, which was exactly backwards.
 *
 * @returns The parsed report, keyed by package name.
 */
function readOutdated() {
    let stdout;

    try {
        stdout = execSync("npm outdated --json", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "ignore"],
        });
    } catch (error) {
        // Exit code 1 means "there are outdated packages"; anything else is a
        // real failure to report.
        if (error.status !== 1) {
            throw error;
        }
        stdout = error.stdout;
    }

    if (!stdout || stdout.trim() === "") {
        return {};
    }

    return JSON.parse(stdout);
}

try {
    const outdated = readOutdated();
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
        // A package present in several workspaces is reported as an array.
        const info = Array.isArray(outdated[pkg])
            ? outdated[pkg][0]
            : outdated[pkg];
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
    console.error("Error checking dependencies:", error.message);
    process.exit(1);
}
