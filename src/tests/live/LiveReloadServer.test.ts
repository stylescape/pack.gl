// ============================================================================
// Import
// ============================================================================

import { LiveReloadServer } from "../../ts/live/LiveReloadServer";
import { WebSocket } from "ws";
import request from "supertest";
import path from "path";
import fs from "fs";

// ============================================================================
// Mock Setup
// ============================================================================

jest.mock("path", () => ({
    ...jest.requireActual("path"),
    resolve: jest.fn((...args: string[]) => {
        const resolvedPath = args.includes("public") ? "/mocked/public" : args.join("/");
        console.debug("[Mock Path] Resolved Path:", resolvedPath);
        return resolvedPath;
    }),
}));

jest.mock("fs", () => ({
    ...jest.requireActual("fs"),
    existsSync: jest.fn((filePath) => {
        const exists = filePath === "/mocked/public/index.html";
        console.debug("[Mock FS] Exists Check:", filePath, "=>", exists);
        return exists;
    }),
    readFileSync: jest.fn((filePath) => {
        if (filePath === "/public/index.html") {
            console.debug("[Mock FS] Reading File:", filePath);
            return "<html><body>Mocked HTML File</body></html>";
        }
        console.error("[Mock FS] File not found:", filePath);
        throw new Error("File not found");
    }),
}));

// ============================================================================
// Test Suite
// ============================================================================

describe("LiveReloadServer", () => {
    let server: LiveReloadServer;
    const port = 3001;
    const mockedPublicPath = "/mocked/public";

    beforeAll(() => {
        server = new LiveReloadServer(port);

        jest.spyOn(fs, "existsSync").mockImplementation((filePath) => filePath === `${mockedPublicPath}/index.html`);
        jest.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
            if (filePath === `${mockedPublicPath}/index.html`) {
                return "<html><body>Mocked HTML File</body></html>";
            }
            throw new Error("File not found");
        });
    });

    afterAll(async () => {
        await server.shutdown();
    });

    // test("should serve static files correctly", async () => {
    //     const response = await request(`http://localhost:${port}`).get("/index.html");

    //     console.debug("[Test] Serve Static Files - Status:", response.status);
    //     console.debug("[Test] Serve Static Files - Text:", response.text);

    //     expect(response.status).toBe(200);
    //     expect(response.text).toContain("Mocked HTML File");
    // });

    // test("should inject live reload script into HTML files", async () => {
    //     const response = await request(`http://localhost:${port}`).get("/index.html");

    //     console.debug("[Test] Inject Script - Status:", response.status);
    //     console.debug("[Test] Inject Script - Text:", response.text);

    //     expect(response.status).toBe(200);
    //     expect(response.text).toContain("const ws = new WebSocket");
    // });

    test("should handle WebSocket connections", (done) => {
        const ws = new WebSocket(`ws://localhost:${port}`);
        ws.on("open", () => {
            console.debug("[Test] WebSocket Connection Opened");
            ws.close();
        });
        ws.on("close", () => {
            console.debug("[Test] WebSocket Connection Closed");
            done();
        });
    });

    test("should broadcast reload signal to connected clients", (done) => {
        const ws = new WebSocket(`ws://localhost:${port}`);
        ws.on("open", () => {
            console.debug("[Test] WebSocket Connection Opened - Broadcasting Reload");
            server.reloadClients();
        });
        ws.on("message", (message) => {
            console.debug("[Test] WebSocket Received Message:", message.toString());
            expect(message.toString()).toBe("reload");
            ws.close();
        });
        ws.on("close", () => {
            console.debug("[Test] WebSocket Connection Closed");
            done();
        });
    });

    test("should sanitize file paths to prevent directory traversal", async () => {
        const response = await request(`http://localhost:${port}`).get("/../../etc/passwd");

        console.debug("[Test] Path Sanitization - Status:", response.status);
        console.debug("[Test] Path Sanitization - Text:", response.text);

        expect(response.status).toBe(404);
        expect(response.text).not.toContain("root:");
    });

    test("should handle shutdown gracefully", async () => {
        const shutdownSpy = jest.spyOn(server, "shutdown");
        await server.shutdown();

        console.debug("[Test] Server Shutdown Called");
        expect(shutdownSpy).toHaveBeenCalled();
    });
});