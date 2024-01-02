// DirectoryCreator.test.ts

import DirectoryCreator from '../src/ts/class/DirectoryCreator';
import fs from 'fs';
import path from 'path';

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
