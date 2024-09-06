// tests/DirectoryCreator.test.ts

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

import DirectoryCreator from '../ts/directory/DirectoryCreator';
import fs from 'fs';
import path from 'path';


// ============================================================================
// Tests
// ============================================================================

describe('DirectoryCreator', () => {
    const directoryCreator = new DirectoryCreator();
    const basePath = './testDirectory';
    const directories = ['dir1', 'dir2', 'dir3'];

    beforeAll(() => {
        // Optional: setup if required before all tests run
    });

    afterAll(() => {
        // Cleanup after all tests run
        // This is where you can delete the test directories created, if you wish
        directories.forEach(dir => {
            fs.rmdirSync(path.join(basePath, dir), { recursive: true });
        });
        fs.rmdirSync(basePath, { recursive: true });
    });

    it('should create directories correctly', async () => {
        await directoryCreator.createDirectories(basePath, directories);

        directories.forEach(dir => {
            const dirPath = path.join(basePath, dir);
            expect(fs.existsSync(dirPath)).toBeTruthy();
        });
    });

    // Add more tests here if needed
});
