// // ============================================================================
// // Import
// // ============================================================================

// import { main } from "../ts/pack";

// // Mock the `main` function
// jest.mock("../ts/pack", () => ({
//     main: jest.fn(),
// }));

// // ============================================================================
// // Test Suite
// // ============================================================================

// describe("CLI Entry Point", () => {
//     let originalExit: typeof process.exit;
//     let originalConsoleError: typeof console.error;

//     beforeEach(() => {
//         // Save original implementations
//         originalExit = process.exit;
//         originalConsoleError = console.error;

//         // Mock process.exit and console.error
//         process.exit = jest.fn() as unknown as typeof process.exit;
//         console.error = jest.fn();
//     });

//     afterEach(() => {
//         // Restore original implementations
//         process.exit = originalExit;
//         console.error = originalConsoleError;
//         jest.clearAllMocks();
//     });

//     const importCLI = async () => {
//         jest.resetModules(); // Clear module cache to ensure top-level IIFE re-executes
//         return await import("../ts/cli");
//     };

//     test("should call main function successfully", async () => {
//         // Arrange
//         const mockedMain = main as jest.MockedFunction<typeof main>;
//         mockedMain.mockResolvedValueOnce();

//         // Act
//         await importCLI();

//         // Assert
//         expect(mockedMain).toHaveBeenCalledTimes(1);
//         expect(process.exit).not.toHaveBeenCalled();
//         expect(console.error).not.toHaveBeenCalled();
//     });

//     test("should handle errors and exit with code 1", async () => {
//         // Arrange
//         const mockedMain = main as jest.MockedFunction<typeof main>;
//         const error = new Error("Test error");
//         mockedMain.mockRejectedValueOnce(error);

//         // Act
//         await importCLI();

//         // Assert
//         expect(mockedMain).toHaveBeenCalledTimes(1);
//         expect(console.error).toHaveBeenCalledWith(
//             "An unexpected error occurred:",
//             error.message
//         );
//         expect(process.exit).toHaveBeenCalledWith(1);
//     });

//     test("should handle non-Error objects and exit with code 1", async () => {
//         // Arrange
//         const mockedMain = main as jest.MockedFunction<typeof main>;
//         const nonErrorObject = "Unexpected failure";
//         mockedMain.mockRejectedValueOnce(nonErrorObject);

//         // Act
//         await importCLI();

//         // Assert
//         expect(mockedMain).toHaveBeenCalledTimes(1);
//         expect(console.error).toHaveBeenCalledWith(
//             "An unexpected error occurred:",
//             nonErrorObject
//         );
//         expect(process.exit).toHaveBeenCalledWith(1);
//     });
// });