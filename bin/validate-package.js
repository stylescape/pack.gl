#!/usr/bin/env node

/**
 * Validate Package Script
 *
 * Validates package.json and ensures all critical fields are present.
 *
 * Usage:
 *   node scripts/validate-package.js
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function validatePackage() {
    console.log("📦 Validating package.json...\n");

    const packageFile = join(rootDir, "package.json");
    const pkg = JSON.parse(readFileSync(packageFile, "utf-8"));

    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = [
        "name",
        "version",
        "description",
        "license",
        "main",
        "types",
    ];
    for (const field of requiredFields) {
        if (!pkg[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Recommended fields
    const recommendedFields = [
        "keywords",
        "repository",
        "bugs",
        "homepage",
        "author",
    ];
    for (const field of recommendedFields) {
        if (!pkg[field]) {
            warnings.push(`Missing recommended field: ${field}`);
        }
    }

    // Validate version format
    if (pkg.version && !/^\d+\.\d+\.\d+/.test(pkg.version)) {
        errors.push(`Invalid version format: ${pkg.version}`);
    }

    // Check if VERSION file matches
    try {
        const versionFile = join(rootDir, "VERSION");
        const fileVersion = readFileSync(versionFile, "utf-8").trim();
        if (pkg.version !== fileVersion) {
            warnings.push(
                `Version mismatch: package.json (${pkg.version}) vs VERSION file (${fileVersion})`,
            );
        }
    } catch (e) {
        warnings.push("VERSION file not found or not readable");
    }

    // Check engines
    if (!pkg.engines) {
        warnings.push(
            "No engines specified - consider adding Node.js version requirements",
        );
    }

    // Check exports
    if (pkg.type === "module" && !pkg.exports) {
        warnings.push("Using ESM but no exports field defined");
    }

    // Display results
    if (errors.length > 0) {
        console.log("❌ Errors:\n");
        errors.forEach((err) => console.log(`  - ${err}`));
        console.log("");
    }

    if (warnings.length > 0) {
        console.log("⚠️  Warnings:\n");
        warnings.forEach((warn) => console.log(`  - ${warn}`));
        console.log("");
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log("✅ Package validation passed!\n");
        return 0;
    }

    if (errors.length > 0) {
        console.log("❌ Package validation failed!\n");
        return 1;
    }

    console.log("✅ Package validation passed with warnings\n");
    return 0;
}

process.exit(validatePackage());
