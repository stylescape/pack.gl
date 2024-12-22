// ============================================================================
// Import
// ============================================================================

import { FileWatcher } from "../ts/live/FileWatcher";
import * as fs from "fs";

// ============================================================================
// Mock Setup
// ============================================================================

jest.mock("fs", () => ({
    promises: {
        writeFile: jest.fn(),
        unlink: jest.fn(),
        mkdir: jest.fn(),
    },
    existsSync: jest.fn(() => true),
}));

jest.mock("chokidar", () => {
    const chokidarMock = {
        watch: jest.fn(() => ({
            on: jest.fn(function (this: any, event: string, callback: (path: string) => void) {
                this[event] = callback;
                return this;
            }),
            close: jest.fn(() => Promise.resolve()),
        })),
    };
    return chokidarMock;
});

import chokidar from "chokidar";

// ============================================================================
// Test Suite
// ============================================================================

describe("FileWatcher", () => {
    let fileWatcher: FileWatcher;
    const mockPathsToWatch = ["src/**/*", "config/**/*"];
    const mockIgnoredPaths = /node_modules/;
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        fileWatcher = new FileWatcher(mockPathsToWatch, mockIgnoredPaths, mockOnChange);
    });

    test("should initialize file watcher with correct settings", () => {
        expect(chokidar.watch).toHaveBeenCalledWith(mockPathsToWatch, {
            ignored: mockIgnoredPaths,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 200,
                pollInterval: 100,
            },
        });
    });

    test("should call onChange callback on file change", () => {
        const changeCallback = (chokidar.watch as jest.Mock).mock.results[0].value.change;
        const mockFilePath = "src/example.js";

        // Simulate file change
        changeCallback(mockFilePath);

        // Validate callback execution
        expect(mockOnChange).toHaveBeenCalledWith(mockFilePath);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    test("should handle errors during onChange execution", () => {
        const changeCallback = (chokidar.watch as jest.Mock).mock.results[0].value.change;
        const mockFilePath = "src/example.js";

        // Simulate error in onChange callback
        mockOnChange.mockImplementation(() => {
            throw new Error("Test error");
        });

        // Simulate file change
        changeCallback(mockFilePath);

        // Validate error handling
        expect(mockOnChange).toHaveBeenCalledWith(mockFilePath);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
            `Error while processing file change for ${mockFilePath}:`,
            expect.any(Error)
        );
    });

    test("should stop the file watcher", async () => {
        await fileWatcher.stopWatching();

        const watcherInstance = (chokidar.watch as jest.Mock).mock.results[0].value;
        expect(watcherInstance.close).toHaveBeenCalled();
    });

    test("should restart the file watcher", () => {
        fileWatcher.startWatching();

        expect(chokidar.watch).toHaveBeenCalledTimes(2); // Once during initialization, once during restart
    });
});