"use strict";
// class/TestRunner.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================================
// Import
// ============================================================================
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
// ============================================================================
// Classes
// ============================================================================
/**
 * A utility class for running tests from Node.js applications. It simplifies the process of
 * executing shell commands for testing by providing a wrapper around the child_process module.
 */
class TestRunner {
    /**
     * Constructs a TestRunner with a specific test command.
     * @param {string} testCommand - The command used to run tests (e.g., "npm test").
     */
    constructor(testCommand) {
        this.testCommand = testCommand;
    }
    /**
     * Executes the test command in a child process and returns the results.
     * This method captures both stdout and stderr streams, handling any errors by re-throwing them.
     *
     * @returns {Promise<string>} A promise that resolves with the test results as a string if successful.
     * @throws {Error} Throws an error if the test command fails or if stderr captures any error output.
     */
    runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { stdout, stderr } = yield execAsync(this.testCommand);
                if (stderr) {
                    throw new Error(stderr);
                }
                return stdout;
            }
            catch (error) {
                console.error("Error occurred while running tests:", error);
                throw error;
            }
        });
    }
}
// ============================================================================
// Export
// ============================================================================
exports.default = TestRunner;
// ============================================================================
// Example
// ============================================================================
// import TestRunner from "./TestRunner";
// const runner = new TestRunner("npm test"); // Replace "npm test" with your actual test command
// runner.runTests()
//     .then(results => {
//         console.log("Test Results:", results);
//     })
//     .catch(error => {
//         console.error("Test Runner Error:", error);
//     });
