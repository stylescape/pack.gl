"use strict";
// class/VersionManager.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2023 Scape Agency BV
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ============================================================================
// Import
// ============================================================================
var semver_1 = __importDefault(require("semver"));
var child_process_1 = require("child_process");
var util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
class VersionManager {
    constructor(currentVersion) {
        if (!semver_1.default.valid(currentVersion)) {
            throw new Error('Invalid initial version');
        }
        this.currentVersion = currentVersion;
    }
    async updateVersion(releaseType) {
        const newVersion = semver_1.default.inc(this.currentVersion, releaseType);
        if (!newVersion) {
            throw new Error('Version increment failed');
        }
        this.currentVersion = newVersion;
        return newVersion;
    }
    async generateChangelog() {
        // Implement changelog generation logic
        // This could be as simple as running a script or using a tool like 'conventional-changelog'
        console.log('Changelog generation logic goes here');
    }
    async createGitTag() {
        try {
            await execAsync(`git tag v${this.currentVersion}`);
            await execAsync('git push --tags');
            console.log(`Tag v${this.currentVersion} created and pushed`);
        }
        catch (error) {
            console.error('Error creating Git tag:', error);
            throw error;
        }
    }
}
exports.default = VersionManager;
// import VersionManager from './VersionManager';
// const versionManager = new VersionManager('1.0.0'); // Replace '1.0.0' with the current version of your package
// versionManager.updateVersion('minor') // 'major', 'minor', or 'patch'
//     .then(newVersion => {
//         console.log(`Version updated to: ${newVersion}`);
//         return versionManager.generateChangelog();
//     })
//     .then(() => versionManager.createGitTag())
//     .catch(error => console.error(error));
