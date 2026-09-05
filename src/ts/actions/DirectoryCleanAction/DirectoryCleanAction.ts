// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import micromatch from "micromatch"; // For glob pattern matching
import path from "path";
import { Action } from "../../core/pipeline/Action.js";
import type { ActionOptionsType } from "../../types/ActionOptionsType.js";

// ============================================================================
// Classes
// ============================================================================

/**
 * DirectoryCleanAction is a step action responsible for cleaning a directory
 * by deleting all its contents while optionally retaining files and
 * directories that match specified glob patterns.
 */
export class DirectoryCleanAction extends Action {
    // Methods
    // ========================================================================

    /**
     * Executes the directory cleaning action.
     *
     * @param options - The options specific to directory cleaning, including
     * the directory path and glob patterns to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned, or silently resolves if the directory does not
     * exist.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const dirPath = options.dirPath as string;
        const keepPatterns = options.keep as string[] | undefined;

        if (!dirPath) {
            throw new Error("Missing required option: dirPath.");
        }

        if (!fs.existsSync(dirPath)) {
            this.logWarn(`Directory does not exist, skipping: ${dirPath}`);
            return; // Exit gracefully if directory does not exist
        }

        this.logInfo(`Cleaning directory: ${dirPath}`);

        try {
            await this.cleanDirectoryContents(dirPath, keepPatterns);
            this.logInfo(`Directory cleaned successfully: ${dirPath}`);
        } catch (error) {
            this.logError(`Error cleaning directory "${dirPath}":`, error);
            // A clean that did not clean has to fail the step. Logging and
            // returning let the pipeline carry on believing the directory was
            // empty, so later steps ran against leftover files.
            throw error;
        }
    }

    /**
     * Deletes all contents of a specified directory, excluding files and
     * directories that match specified glob patterns.
     *
     * @param dirPath - The path to the directory to be cleaned.
     * @param keepPatterns - An optional array of glob patterns for files
     * and directories to retain.
     * @returns A Promise that resolves when the directory has been
     * successfully cleaned.
     * @throws {Error} Throws an error if deleting any file or directory fails.
     */
    private async cleanDirectoryContents(
        dirPath: string,
        keepPatterns?: string[],
        root: string = dirPath,
    ): Promise<void> {
        const files = await fs.promises.readdir(dirPath);

        for (const file of files) {
            const curPath = path.join(dirPath, file);
            // Matched against the path relative to the directory being
            // cleaned, not to the current recursion level, so a pattern like
            // "cache/index.json" means what it says.
            const relativePath = path
                .relative(root, curPath)
                .split(path.sep)
                .join("/");

            // Skip files/directories matching keep patterns
            if (
                keepPatterns &&
                micromatch.isMatch(relativePath, keepPatterns)
            ) {
                this.logInfo(`Skipping: ${relativePath}`);
                continue;
            }

            try {
                const stat = await fs.promises.lstat(curPath);
                if (stat.isDirectory()) {
                    if (this.mayHoldKeepers(relativePath, keepPatterns)) {
                        // Something under here is meant to survive, so clean
                        // it entry by entry instead of removing the whole
                        // tree — which used to delete kept files along with
                        // the directory containing them.
                        await this.cleanDirectoryContents(
                            curPath,
                            keepPatterns,
                            root,
                        );
                        await this.removeIfEmpty(curPath, relativePath);
                    } else {
                        await fs.promises.rm(curPath, { recursive: true });
                        this.logInfo(`Deleted directory: ${relativePath}`);
                    }
                } else {
                    // Delete file
                    await fs.promises.unlink(curPath);
                    this.logInfo(`Deleted file: ${relativePath}`);
                }
            } catch (error) {
                this.logError(`Error deleting: ${relativePath}`, error);
                throw error;
            }
        }
    }

    /**
     * Whether any keep pattern could match something inside a directory.
     *
     * Only directories that might contain a kept entry are walked; the rest
     * are removed wholesale, which is both faster and what the caller means
     * by "clean".
     *
     * @param relativePath - The directory, relative to the cleaning root.
     * @param keepPatterns - The configured keep patterns, if any.
     * @returns True when the directory has to be walked rather than removed.
     */
    private mayHoldKeepers(
        relativePath: string,
        keepPatterns?: string[],
    ): boolean {
        if (!keepPatterns?.length) return false;

        const directory = relativePath.split("/");

        return keepPatterns.some((pattern) => {
            const segments = pattern.split("/");

            // A globstar matches any number of segments, so everything from
            // that point down is potentially kept.
            const globstar = segments.indexOf("**");
            if (globstar !== -1 && globstar <= directory.length) {
                return (
                    globstar === 0 ||
                    micromatch.isMatch(
                        directory.slice(0, globstar).join("/"),
                        segments.slice(0, globstar).join("/"),
                    )
                );
            }

            // Otherwise the pattern has to reach deeper than this directory
            // to name anything inside it, and its leading segments have to
            // match the directory itself.
            if (segments.length <= directory.length) return false;
            return micromatch.isMatch(
                relativePath,
                segments.slice(0, directory.length).join("/"),
            );
        });
    }

    /**
     * Removes a directory if cleaning left it empty, so keeping one nested
     * file does not also keep every empty directory above it.
     *
     * @param dirPath - Absolute path of the directory.
     * @param relativePath - Its path relative to the cleaning root, for logs.
     */
    private async removeIfEmpty(
        dirPath: string,
        relativePath: string,
    ): Promise<void> {
        const remaining = await fs.promises.readdir(dirPath);
        if (remaining.length > 0) return;

        await fs.promises.rmdir(dirPath);
        this.logInfo(`Deleted directory: ${relativePath}`);
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        const description = `
            Cleans a directory by deleting all its contents while retaining
            files and directories matching specified glob patterns. If the
            directory does not exist, the action will skip gracefully.
        `;
        return description;
    }
}

// ============================================================================
// Export
// ============================================================================

// export default DirectoryCleanAction;
