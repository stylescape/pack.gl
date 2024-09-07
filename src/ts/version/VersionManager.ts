// ============================================================================
// Import
// ============================================================================

import semver from "semver";
import { exec } from "child_process";
import util from "util";


// ============================================================================
// Constants
// ============================================================================

const execAsync = util.promisify(exec);


// ============================================================================
// Classes
// ============================================================================

/**
 * Manages software versioning using semantic versioning principles. Provides
 * methods to update the version, generate changelogs, and manage version tags
 * in source control.
 */
class VersionManager {

    private currentVersion: string;

    /**
     * Initializes the version manager with a valid semantic version.
     * 
     * @param {string} currentVersion - The current semantic version.
     * @throws {Error} If the initial version is not a valid semantic version.
     */
    constructor(currentVersion: string) {
        if (!semver.valid(currentVersion)) {
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
    async updateVersion(releaseType: semver.ReleaseType): Promise<string> {
        const newVersion = semver.inc(this.currentVersion, releaseType);
        if (!newVersion) {
            throw new Error(
                "Version increment failed"
            );
        }
        this.currentVersion = newVersion;
        return newVersion;
    }

    /**
     * Generates a changelog based on commits since the last version.
     * This is a placeholder function to be implemented with actual logic,
     * potentially using tools like "conventional-changelog".
     */
    async generateChangelog(): Promise<void> {
        try {
            // Placeholder for actual changelog generation logic.
            console.log('Generating changelog...');
            // Example: Using conventional-changelog-cli
            // await execAsync('npx conventional-changelog -p angular -i CHANGELOG.md -s');
            console.log('Changelog generation logic goes here');
        } catch (error) {
            console.error('Error generating changelog:', error);
            throw error;
        }
    }

    /**
     * Creates a new Git tag for the current version and pushes it to the
     * remote repository.
     * 
     * @throws {Error} If creating or pushing the tag fails.
     */
    async createGitTag() {
        try {
            await execAsync(`git tag v${this.currentVersion}`);
            await execAsync("git push --tags");
            console.log(`Tag v${this.currentVersion} created and pushed`);
        } catch (error) {
            console.error("Error creating Git tag:", error);
            throw error;
        }
    }
}


// ============================================================================
// Exports
// ============================================================================

export default VersionManager;


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
