// ============================================================================
// Import
// ============================================================================

import { FileWatcher } from "../../ts/live/FileWatcher";
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
            on: jest.fn(function (
                this: any,
                event: string,
                callback: (path: string) => void
            ) {
                this[event] = callback;
                return this;
            }),
            close: jest.fn(() => Promise.resolve()),
        })),
    };
    return chokidarMock;
});

import chokidar, { FSWatcher } from "chokidar";

// Explicitly cast chokidar.watch as a mock function
const mockedChokidar = chokidar as jest.Mocked<typeof chokidar>;

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
        jest.spyOn(console, "error").mockImplementation(() => {}); // Mock console.error
        fileWatcher = new FileWatcher(mockPathsToWatch, mockIgnoredPaths, mockOnChange);
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore mocked console.error
    });

    test("should initialize file watcher with correct settings", () => {
        expect(chokidar.watch).toHaveBeenCalledWith(mockPathsToWatch, {
            ignored: mockIgnoredPaths,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                pollInterval: 100,
                stabilityThreshold: 100, // Match implementation
            },
        });
    });

    test("should call onChange callback on file change", () => {
        const watcherInstance = (chokidar.watch as jest.Mock).mock.results[0].value;
        const changeCallback = watcherInstance.on.mock.calls.find(
            (call: [string, Function]) => call[0] === "change"
        )?.[1]; // Explicitly typed as [string, Function]
        const mockFilePath = "src/example.js";

        // Simulate file change
        changeCallback(mockFilePath);

        // Validate callback execution
        expect(mockOnChange).toHaveBeenCalledWith(mockFilePath);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    test("should handle errors during onChange execution", () => {
        const watcherInstance = (chokidar.watch as jest.Mock).mock.results[0].value;
        const changeCallback = watcherInstance.on.mock.calls.find(
            (call: [string, Function]) => call[0] === "change"
        )?.[1]; // Explicitly typed as [string, Function]
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
            `Error handling file change for ${mockFilePath}:`,
            expect.any(Error)
        );
    });

    test("should stop the file watcher", async () => {
        await fileWatcher.stopWatching();

        const watcherInstance = (chokidar.watch as jest.Mock).mock.results[0].value;
        expect(watcherInstance.close).toHaveBeenCalled();
    });

    test("should restart the file watcher", async () => {
        const initialWatcherInstance = mockedChokidar.watch.mock.results[0].value;
    
        await fileWatcher.restartWatcher();
    
        // Ensure the initial watcher was stopped
        expect(initialWatcherInstance.close).toHaveBeenCalled();
    
        // Ensure a new watcher was started
        expect(mockedChokidar.watch).toHaveBeenCalledTimes(2); // Once during initialization, once during restart
    });

});