// import { main } from "../ts/pack";
// import { LiveReloadServer } from "../ts/live/LiveReloadServer";
// import { FileWatcher } from "../ts/live/FileWatcher";
// import { Pipeline } from "../ts/core/Pipeline";
// import { ConfigLoader } from "../ts/core/ConfigLoader";
// import { PipelineManager } from "../ts/core/PipelineManager";
// import { ConfigInterface } from "../ts/core/ConfigInterface";

// // Mock dependencies
// jest.mock("../ts/core/Pipeline");
// jest.mock("../ts/core/ConfigLoader");
// jest.mock("../ts/live/LiveReloadServer");
// jest.mock("../ts/live/FileWatcher");
// jest.mock("../ts/core/PipelineManager");

// describe("Main Functionality", () => {
//     let originalProcessExit: typeof process.exit;
//     let mockExit: jest.MockedFunction<typeof process.exit>;

//     beforeAll(() => {
//         originalProcessExit = process.exit;
//         mockExit = jest.fn() as jest.MockedFunction<typeof process.exit>;
//         process.exit = mockExit;
//     });

//     afterAll(() => {
//         process.exit = originalProcessExit;
//     });

//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     test("should run pipeline successfully without live reload", async () => {
//         const mockConfigLoader = ConfigLoader as jest.MockedClass<typeof ConfigLoader>;
//         const mockPipeline = Pipeline as jest.MockedClass<typeof Pipeline>;

//         const mockConfig: ConfigInterface = { stages: [] };
//         mockConfigLoader.prototype.loadConfig.mockReturnValue(mockConfig);
//         const mockPipelineInstance = new mockPipeline(mockConfig);
//         mockPipelineInstance.run.mockResolvedValueOnce();

//         await main();

//         expect(mockConfigLoader.prototype.loadConfig).toHaveBeenCalled();
//         expect(mockPipeline).toHaveBeenCalledWith(mockConfig);
//         expect(mockPipelineInstance.run).toHaveBeenCalled();
//         expect(mockExit).not.toHaveBeenCalled();
//     });

//     test("should handle errors and exit with code 1", async () => {
//         const mockConfigLoader = ConfigLoader as jest.MockedClass<typeof ConfigLoader>;
//         const mockPipeline = Pipeline as jest.MockedClass<typeof Pipeline>;

//         const mockConfig: ConfigInterface = { stages: [] };
//         const error = new Error("Pipeline error");

//         mockConfigLoader.prototype.loadConfig.mockReturnValue(mockConfig);
//         const mockPipelineInstance = new mockPipeline(mockConfig);
//         mockPipelineInstance.run.mockRejectedValueOnce(error);

//         await main();

//         expect(mockConfigLoader.prototype.loadConfig).toHaveBeenCalled();
//         expect(mockPipeline).toHaveBeenCalledWith(mockConfig);
//         expect(mockPipelineInstance.run).toHaveBeenCalled();
//         expect(console.error).toHaveBeenCalledWith(
//             "An error occurred during the pipeline execution:",
//             error
//         );
//         expect(mockExit).toHaveBeenCalledWith(1);
//     });

//     test("should handle SIGINT for graceful shutdown", async () => {
//         const mockLiveReloadServer = LiveReloadServer as jest.MockedClass<typeof LiveReloadServer>;
//         const mockPipelineManager = PipelineManager as jest.MockedClass<typeof PipelineManager>;

//         const mockLiveReloadInstance = new mockLiveReloadServer(3000);
//         const mockPipelineManagerInstance = new mockPipelineManager(mockLiveReloadInstance);

//         const shutdownHandler = process.listeners("SIGINT")[0] as Function;
//         expect(shutdownHandler).toBeDefined();

//         await shutdownHandler();

//         expect(mockPipelineManagerInstance.stopPipeline).toHaveBeenCalled();
//         expect(mockLiveReloadInstance.shutdown).toHaveBeenCalled();
//         expect(mockExit).toHaveBeenCalledWith(0);
//     });
// });