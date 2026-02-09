// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Action } from "../../core/pipeline/Action.js";
import { FileCache } from "../../core/cache/FileCache.js";
import { ActionOptionsType } from "../../types/ActionOptionsType.js";

// ============================================================================
// Constants
// ============================================================================

/** Threshold for using streaming copy (5MB) */
const STREAMING_THRESHOLD = 5 * 1024 * 1024;

// ============================================================================
// Classes
// ============================================================================

/**
 * FileCopyAction is a step action responsible for copying files from a source
 * location to a destination directory. This action handles file path
 * resolution and ensures that existing files in the destination can be
 * replaced if necessary.
 *
 * Performance features:
 * - Uses streaming for large files to reduce memory usage
 * - Supports file caching to skip unchanged files
 * - Parallel batch copy support
 */
export class FileCopyAction extends Action {
    // Parameters
    // ========================================================================

    private fileCache: FileCache;

    // Constructor
    // ========================================================================

    constructor() {
        super();
        this.fileCache = FileCache.getInstance();
    }

    // Methods
    // ========================================================================

    /**
     * Executes the file copy action.
     * @param options - The options specific to file copying, including source
     * file and destination directory.
     * @returns A Promise that resolves when the file has been successfully
     * copied, or rejects with an error if the action fails.
     */
    async execute(options: ActionOptionsType): Promise<void> {
        const srcFile = options.srcFile as string | undefined;
        const srcFiles = options.srcFiles as string[] | undefined;
        const destDir = options.destDir as string;
        const useCache = options.useCache as boolean | undefined;
        const parallel = options.parallel as boolean | undefined;

        if ((!srcFile && !srcFiles) || !destDir) {
            throw new Error(
                "Missing required options: srcFile/srcFiles or destDir.",
            );
        }

        // Handle batch copy
        if (srcFiles && srcFiles.length > 0) {
            await this.copyMultipleFiles(srcFiles, destDir, {
                useCache,
                parallel,
            });
            return;
        }

        // Handle single file copy
        if (srcFile) {
            await this.copySingleFile(srcFile, destDir, { useCache });
        }
    }

    /**
     * Copies a single file with optional caching.
     */
    private async copySingleFile(
        srcFile: string,
        destDir: string,
        options: { useCache?: boolean } = {},
    ): Promise<void> {
        // Check cache if enabled
        if (options.useCache) {
            const hasChanged = await this.fileCache.hasFileChanged(srcFile);
            if (!hasChanged) {
                this.logDebug(`Skipping unchanged file: ${srcFile}`);
                return;
            }
        }

        this.logInfo(`Copying file from ${srcFile} to ${destDir}.`);

        try {
            await this.copyFileToDirectory(srcFile, destDir);

            // Update cache
            if (options.useCache) {
                await this.fileCache.updateFileEntry(srcFile);
            }

            this.logInfo(
                `File copied successfully from ${srcFile} to ${destDir}.`,
            );
        } catch (error) {
            this.logError(
                `Error copying file from ${srcFile} to ${destDir}: ${error}`,
            );
            throw error;
        }
    }

    /**
     * Copies multiple files with optional parallel execution.
     */
    private async copyMultipleFiles(
        srcFiles: string[],
        destDir: string,
        options: { useCache?: boolean; parallel?: boolean } = {},
    ): Promise<void> {
        const startTime = performance.now();
        let filesToCopy = srcFiles;

        // Filter unchanged files if caching is enabled
        if (options.useCache) {
            filesToCopy = await this.fileCache.getChangedFiles(srcFiles);
            const skipped = srcFiles.length - filesToCopy.length;
            if (skipped > 0) {
                this.logInfo(`Skipping ${skipped} unchanged files.`);
            }
        }

        if (filesToCopy.length === 0) {
            this.logInfo("All files are up to date, nothing to copy.");
            return;
        }

        this.logInfo(`Copying ${filesToCopy.length} files to ${destDir}.`);

        try {
            if (options.parallel) {
                // Parallel copy with concurrency limit
                await this.copyFilesInParallel(filesToCopy, destDir, 10);
            } else {
                // Sequential copy
                for (const file of filesToCopy) {
                    await this.copyFileToDirectory(file, destDir);
                }
            }

            // Update cache for all copied files
            if (options.useCache) {
                await this.fileCache.updateFileEntries(filesToCopy);
            }

            const duration = performance.now() - startTime;
            this.logInfo(
                `Copied ${filesToCopy.length} files in ${duration.toFixed(2)}ms.`,
            );
        } catch (error) {
            this.logError(`Error copying files: ${error}`);
            throw error;
        }
    }

    /**
     * Copies files in parallel with concurrency control.
     */
    private async copyFilesInParallel(
        srcFiles: string[],
        destDir: string,
        maxConcurrent: number = 10,
    ): Promise<void> {
        const executing = new Set<Promise<void>>();

        for (const srcFile of srcFiles) {
            const copyPromise = this.copyFileToDirectory(
                srcFile,
                destDir,
            ).finally(() => executing.delete(copyPromise));
            executing.add(copyPromise);

            if (executing.size >= maxConcurrent) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
    }

    /**
     * Copies a file from a specified source to a destination directory.
     * Uses streaming for large files to reduce memory usage.
     *
     * @param srcFile - The path of the source file to be copied.
     * @param destDir - The destination directory where the file should
     * be placed.
     * @returns A Promise that resolves when the file has been successfully
     * copied.
     * @throws {Error} If the file cannot be copied, including due to
     * permission errors or the source file not existing.
     */
    private async copyFileToDirectory(
        srcFile: string,
        destDir: string,
    ): Promise<void> {
        try {
            // Ensure the destination directory exists
            await this.ensureDirectoryExists(destDir);

            // Resolve the destination file path
            const fileName = path.basename(srcFile);
            const destFilePath = path.join(destDir, fileName);

            // Check file size to determine copy method
            const stat = await fs.promises.stat(srcFile);

            if (stat.size > STREAMING_THRESHOLD) {
                // Use streaming for large files
                await this.streamCopyFile(srcFile, destFilePath);
            } else {
                // Use standard copy for smaller files
                await fs.promises.copyFile(srcFile, destFilePath);
            }
        } catch (error) {
            this.logError(`Error copying file: ${error}`);
            throw error;
        }
    }

    /**
     * Copies a file using streams for memory-efficient handling of large files.
     */
    private async streamCopyFile(
        srcFile: string,
        destFile: string,
    ): Promise<void> {
        const readStream = fs.createReadStream(srcFile);
        const writeStream = fs.createWriteStream(destFile);

        await pipeline(readStream, writeStream);
    }

    /**
     * Ensures that the given directory exists, creating it if it does not.
     * @param dirPath - The path of the directory to check and create.
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error instanceof Error) {
                const nodeError = error as NodeJS.ErrnoException;
                if (nodeError.code !== "EEXIST") {
                    throw nodeError;
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Provides a description of the action.
     * @returns A string description of the action.
     */
    describe(): string {
        return "Copies a file from a source location to a destination directory, ensuring directories exist and handling errors gracefully.";
    }
}

// ============================================================================
// Export
// ============================================================================

// export default FileCopyAction;
