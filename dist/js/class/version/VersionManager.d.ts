import semver from "semver";
/**
 * Manages software versioning using semantic versioning principles. Provides
 * methods to update the version, generate changelogs, and manage version tags
 * in source control.
 */
declare class VersionManager {
    private currentVersion;
    /**
     * Initializes the version manager with a valid semantic version.
     *
     * @param {string} currentVersion - The current semantic version.
     * @throws {Error} If the initial version is not a valid semantic version.
     */
    constructor(currentVersion: string);
    /**
     * Updates the current version based on the specified release type.
     *
     * @param {semver.ReleaseType} releaseType - The type of version update
     *  (major, minor, patch).
     * @returns {Promise<string>} The new version.
     * @throws {Error} If the version increment fails.
     */
    updateVersion(releaseType: semver.ReleaseType): Promise<string>;
    /**
     * Generates a changelog based on commits since the last version.
     * This is a placeholder function to be implemented with actual logic,
     * potentially using tools like "conventional-changelog".
     */
    generateChangelog(): Promise<void>;
    /**
     * Creates a new Git tag for the current version and pushes it to the
     * remote repository.
     *
     * @throws {Error} If creating or pushing the tag fails.
     */
    createGitTag(): Promise<void>;
}
export default VersionManager;
