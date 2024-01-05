import semver from 'semver';
declare class VersionManager {
    private currentVersion;
    constructor(currentVersion: string);
    updateVersion(releaseType: semver.ReleaseType): Promise<string>;
    generateChangelog(): Promise<void>;
    createGitTag(): Promise<void>;
}
export default VersionManager;
