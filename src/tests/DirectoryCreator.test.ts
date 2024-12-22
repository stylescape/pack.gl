// ============================================================================
// Import
// ============================================================================

import DirectoryCreator from "../ts/class/directory/DirectoryCreator";
import fs from "fs/promises";
import path from "path";


// ============================================================================
// Tests
// ============================================================================

describe("DirectoryCreator", () => {
    const directoryCreator = new DirectoryCreator();
    const basePath = "./testDirectory";
    const directories = ["dir1", "dir2", "dir3"];

    beforeAll(async () => {
        // Ensure the base directory is clean before starting
        try {
            await fs.rmdir(basePath, { recursive: true });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                console.error("Error during setup:", error);
                throw error;
            }
        }
    });

    afterAll(async () => {
        // Cleanup after all tests
        try {
            await fs.rmdir(basePath, { recursive: true });
        } catch (error) {
            console.error("Error during cleanup:", error);
        }
    });

    it("should create directories correctly", async () => {
        await directoryCreator.createDirectories(basePath, directories);

        for (const dir of directories) {
            const dirPath = path.join(basePath, dir);
            const exists = await fs.stat(dirPath).then(
                () => true,
                () => false
            );
            expect(exists).toBe(true);
        }
    });

    it("should not throw an error if the base directory already exists", async () => {
        await expect(
            directoryCreator.createDirectories(basePath, directories)
        ).resolves.not.toThrow();

        for (const dir of directories) {
            const dirPath = path.join(basePath, dir);
            const exists = await fs.stat(dirPath).then(
                () => true,
                () => false
            );
            expect(exists).toBe(true);
        }
    });

    it("should handle empty directories array gracefully", async () => {
        await expect(
            directoryCreator.createDirectories(basePath, [])
        ).resolves.not.toThrow();

        const baseExists = await fs.stat(basePath).then(
            () => true,
            () => false
        );
        expect(baseExists).toBe(true);
    });
});
