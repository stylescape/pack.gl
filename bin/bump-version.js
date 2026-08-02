#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * This script helps automate version bumping and changelog updates.
 *
 * Usage:
 *   node scripts/bump-version.js [major|minor|patch]
 *
 * Examples:
 *   node scripts/bump-version.js patch  # 0.1.45 -> 0.1.46
 *   node scripts/bump-version.js minor  # 0.1.45 -> 0.2.0
 *   node scripts/bump-version.js major  # 0.1.45 -> 1.0.0
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function getCurrentVersion() {
    const versionFile = join(rootDir, "VERSION");
    return readFileSync(versionFile, "utf-8").trim();
}

function bumpVersion(current, type) {
    const parts = current.split(".").map(Number);

    switch (type) {
        case "major":
            return `${parts[0] + 1}.0.0`;
        case "minor":
            return `${parts[0]}.${parts[1] + 1}.0`;
        case "patch":
        default:
            return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
}

function updateVersionFile(version) {
    const versionFile = join(rootDir, "VERSION");
    writeFileSync(versionFile, version + "\n", "utf-8");
    console.log(`✓ Updated VERSION file to ${version}`);
}

function updateVersionModule(version) {
    // `src/ts/version.ts` is what `kist --version` prints; it must move in
    // lockstep with package.json or the CLI reports a stale number.
    const modulePath = join(rootDir, "src/ts/version.ts");
    const source = readFileSync(modulePath, "utf-8");
    writeFileSync(
        modulePath,
        source.replace(
            /export const VERSION = "[^"]*";/,
            `export const VERSION = "${version}";`,
        ),
        "utf-8",
    );
    console.log(`✓ Updated src/ts/version.ts to ${version}`);
}

function updatePackageJson(version) {
    const packageFile = join(rootDir, "package.json");
    const pkg = JSON.parse(readFileSync(packageFile, "utf-8"));
    pkg.version = version;

    // Update version_short
    const versionParts = version.split(".");
    pkg.config.version_short = `${versionParts[0]}.${versionParts[1]}`;

    writeFileSync(packageFile, JSON.stringify(pkg, null, 4) + "\n", "utf-8");
    console.log(`✓ Updated package.json to ${version}`);
}

function updateChangelog(version) {
    const changelogFile = join(rootDir, "CHANGELOG.md");
    const changelog = readFileSync(changelogFile, "utf-8");

    const today = new Date().toISOString().split("T")[0];
    const newEntry = `\n## [${version}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n`;

    const updated = changelog.replace(
        "## [Unreleased]",
        `## [Unreleased]${newEntry}`,
    );

    writeFileSync(changelogFile, updated, "utf-8");
    console.log(`✓ Updated CHANGELOG.md with ${version} section`);
}

function main() {
    const bumpType = process.argv[2] || "patch";

    if (!["major", "minor", "patch"].includes(bumpType)) {
        console.error("Error: Invalid bump type. Use major, minor, or patch.");
        process.exit(1);
    }

    const currentVersion = getCurrentVersion();
    const newVersion = bumpVersion(currentVersion, bumpType);

    console.log(
        `\nBumping version from ${currentVersion} to ${newVersion} (${bumpType})\n`,
    );

    updateVersionFile(newVersion);
    updateVersionModule(newVersion);
    updatePackageJson(newVersion);
    updateChangelog(newVersion);

    console.log(`\n✓ Version bump complete!`);
    console.log(`\nNext steps:`);
    console.log(`1. Update CHANGELOG.md with your changes`);
    console.log(`2. git add -A`);
    console.log(`3. git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`4. git tag v${newVersion}`);
    console.log(`5. git push && git push --tags\n`);
}

main();
