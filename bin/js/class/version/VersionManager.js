import { __awaiter } from "tslib";
import semver from "semver";
import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);
class VersionManager {
    constructor(currentVersion) {
        if (!semver.valid(currentVersion)) {
            throw new Error("Invalid initial version");
        }
        this.currentVersion = currentVersion;
    }
    updateVersion(releaseType) {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = semver.inc(this.currentVersion, releaseType);
            if (!newVersion) {
                throw new Error("Version increment failed");
            }
            this.currentVersion = newVersion;
            return newVersion;
        });
    }
    generateChangelog() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Generating changelog...");
                console.log("Changelog generation logic goes here");
            }
            catch (error) {
                console.error("Error generating changelog:", error);
                throw error;
            }
        });
    }
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
export default VersionManager;
//# sourceMappingURL=VersionManager.js.map