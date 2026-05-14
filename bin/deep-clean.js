#!/usr/bin/env node

/**
 * Clean Script
 *
 * Removes build artifacts, cache files, and temporary directories.
 * More thorough than the regular clean script.
 *
 * Usage:
 *   node scripts/deep-clean.js
 */

import { rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const dirsToClean = [
    "dist",
    "build",
    "tmp",
    "coverage",
    ".cache",
    "node_modules/.cache",
    ".eslintcache",
    ".tsbuildinfo",
];

console.log("🧹 Deep cleaning project...\n");

for (const dir of dirsToClean) {
    const fullPath = join(rootDir, dir);
    try {
        rmSync(fullPath, { recursive: true, force: true });
        console.log(`✓ Removed ${dir}`);
    } catch (error) {
        // Directory might not exist, that's fine
        if (error.code !== "ENOENT") {
            console.log(`⚠ Could not remove ${dir}: ${error.message}`);
        }
    }
}

console.log("\n✨ Deep clean complete!");
console.log('\nRun "npm install" to reinstall dependencies.\n');
