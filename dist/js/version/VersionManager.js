"use strict";
// ============================================================================
// Import
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const child_process_1 = require("child_process");
const util_1 = require("util");
// ============================================================================
// Constants
// ============================================================================
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
/**
 * Manages software versioning using semantic versioning principles. Provides
 * methods to update the version, generate changelogs, and manage version tags
 * in source control.
 */
class VersionManager {
    /**
     * Initializes the version manager with a valid semantic version.
     *
     * @param {string} currentVersion - The current semantic version.
     * @throws {Error} If the initial version is not a valid semantic version.
     */
    constructor(currentVersion) {
        if (!semver_1.default.valid(currentVersion)) {
            throw new Error("Invalid initial version");
        }
        this.currentVersion = currentVersion;
    }
    /**
     * Updates the current version based on the specified release type.
     *
     * @param {semver.ReleaseType} releaseType - The type of version update
     *  (major, minor, patch).
     * @returns {Promise<string>} The new version.
     * @throws {Error} If the version increment fails.
     */
    updateVersion(releaseType) {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = semver_1.default.inc(this.currentVersion, releaseType);
            if (!newVersion) {
                throw new Error("Version increment failed");
            }
            this.currentVersion = newVersion;
            return newVersion;
        });
    }
    /**
     * Generates a changelog based on commits since the last version.
     * Placeholder function to be implemented with actual logic.
     */
    generateChangelog() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement changelog generation logic
            // This could be as simple as running a script or using a tool like
            // "conventional-changelog"
            console.log("Changelog generation logic goes here");
        });
    }
    /**
     * Creates a new Git tag for the current version and pushes it to the
     * remote repository.
     *
     * @throws {Error} If creating or pushing the tag fails.
     */
    createGitTag() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield execAsync(`git tag v${this.currentVersion}`);
                yield execAsync("git push --tags");
                console.log(`Tag v${this.currentVersion} created and pushed`);
            }
            catch (error) {
                console.error("Error creating Git tag:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Exports
// ============================================================================
exports.default = VersionManager;
// ============================================================================
// Example
// ============================================================================
// Here is an example of how you might use the VersionManager class in a project:
// import VersionManager from "./VersionManager";
// const versionManager = new VersionManager("1.0.0");
// versionManager.updateVersion("patch")
//     .then(newVersion => {
//         console.log(`Version updated to: ${newVersion}`);
//         return versionManager.createGitTag();
//     })
//     .then(() => versionManager.generateChangelog())
//     .catch(error => console.error("Version management error:", error));
