// ============================================================================
// LiveServer Tests
// ============================================================================

import { EventEmitter } from "events";
import type { NextFunction, Request, Response } from "express";
import {
    promises as fsPromises,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { silenceConsole, spyOutput } from "./helpers/silence";

// ----------------------------------------------------------------------------
// Module mocks
// ----------------------------------------------------------------------------

// Express and ws are replaced wholesale so that constructing a LiveServer
// never binds a port. Only `express.static` is kept real, since LiveServer
// passes its return value straight to `app.use`.
const mockUse = jest.fn();
const mockListen = jest.fn();
const mockStatic = jest.fn((root: string) => `static:${root}`);

jest.mock("express", () => {
    const factory = () => ({ use: mockUse, listen: mockListen });
    factory.static = (root: string) => mockStatic(root);
    return { __esModule: true, default: factory };
});

jest.mock("ws", () => {
    const { EventEmitter: Emitter } =
        jest.requireActual<typeof import("events")>("events");

    class MockWebSocketServer extends Emitter {
        public close = jest.fn();
        constructor(_options: unknown) {
            super();
            void _options;
        }
    }

    return {
        __esModule: true,
        WebSocketServer: MockWebSocketServer,
        WebSocket: { OPEN: 1, CLOSED: 3 },
    };
});

import { ConfigStore } from "../src/ts/core/config/ConfigStore";
import { LiveServer } from "../src/ts/live/LiveServer";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** A stand-in for the http.Server returned by `app.listen`. */
class FakeHttpServer extends EventEmitter {
    public closeError: unknown = null;
    public close = jest.fn((callback?: (err?: Error) => void) => {
        callback?.(this.closeError as Error | undefined);
        return this;
    });
}

/** Internal shape of LiveServer used for white-box assertions. */
interface LiveServerInternals {
    port: number;
    root: string;
    watchPaths: string[];
    ignoredPaths: string[];
    server: FakeHttpServer;
    wss: EventEmitter & { close: jest.Mock };
    clients: Set<{ readyState: number; send: jest.Mock; close: jest.Mock }>;
    injectLiveReloadScript: (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => void;
}

const internals = (server: LiveServer): LiveServerInternals =>
    server as unknown as LiveServerInternals;

describe("LiveServer", () => {
    const spies = silenceConsole();
    let httpServer: FakeHttpServer;

    beforeEach(() => {
        mockUse.mockReset();
        mockStatic.mockClear();
        httpServer = new FakeHttpServer();
        mockListen.mockReset();
        mockListen.mockImplementation(
            (_port: number, callback?: () => void) => {
                callback?.();
                return httpServer;
            },
        );
        ConfigStore.getInstance().merge({ options: { live: {} } });
    });

    /** Applies a live-reload configuration and builds a server. */
    function build(live: Record<string, unknown> | undefined): LiveServer {
        ConfigStore.getInstance().set("options.live", live);
        return new LiveServer();
    }

    // ------------------------------------------------------------------------
    // Listen errors
    // ------------------------------------------------------------------------

    describe("listen errors", () => {
        it("should report a port conflict with guidance", () => {
            const server = build({ port: 4321 });
            const error = Object.assign(new Error("bind failed"), {
                code: "EADDRINUSE",
            });

            internals(server).server.emit("error", error);

            expect(spyOutput(spies.error())).toContain(
                "Port 4321 is already in use",
            );
        });

        it("should report other listen failures", () => {
            const server = build({});

            internals(server).server.emit("error", new Error("boom"));

            expect(spyOutput(spies.error())).toContain(
                "Live Server failed to start",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Construction
    // ------------------------------------------------------------------------

    describe("construction", () => {
        it("should apply the configured options", () => {
            const server = build({
                port: 4321,
                root: "web",
                watchPaths: ["lib/**/*"],
                ignoredPaths: ["tmp"],
            });

            expect(internals(server).port).toBe(4321);
            expect(internals(server).root).toBe(resolve(process.cwd(), "web"));
            // Reported as configured: resolving a glob to an absolute path
            // produced a value that matches nothing.
            expect(internals(server).watchPaths).toEqual(["lib/**/*"]);
            expect(internals(server).ignoredPaths).toEqual(["tmp"]);
        });

        it("should fall back to defaults for an empty live block", () => {
            const server = build({});

            expect(internals(server).port).toBe(3000);
            expect(internals(server).root).toBe(
                resolve(process.cwd(), "public"),
            );
            expect(internals(server).watchPaths).toEqual([
                "src/**/*",
                "config/**/*",
                "kist.yaml",
                "kist.yml",
            ]);
            expect(internals(server).ignoredPaths).toEqual(["node_modules"]);
        });

        it("should fall back to defaults when live options are absent", () => {
            const server = build(undefined);
            expect(internals(server).port).toBe(3000);
        });

        it("should log its configuration", () => {
            build({ port: 4321 });
            const output = spyOutput(spies.log());
            expect(output).toContain("LiveServer initialized with port: 4321");
            expect(output).toContain("Serving static files from:");
            expect(output).toContain("Watching paths:");
            expect(output).toContain("Ignoring paths:");
        });

        it("should start listening and announce the URL", () => {
            build({ port: 4321 });
            expect(mockListen).toHaveBeenCalledWith(
                4321,
                expect.any(Function),
            );
            expect(spyOutput(spies.log())).toContain(
                "Live Server running at http://localhost:4321",
            );
        });

        it("should install the rate limiter and static middleware", () => {
            const server = build({ root: "web" });
            const root = internals(server).root;

            expect(mockStatic).toHaveBeenCalledWith(root);
            expect(mockUse).toHaveBeenCalledWith(`static:${root}`);
            // Rate limiter plus static plus the injector.
            expect(mockUse).toHaveBeenCalledTimes(3);
        });

        it("should register the injector before the static handler", () => {
            // Order is the whole point: registered after `express.static`,
            // the injector never ran for a file that existed, so no page
            // ever received the reload script.
            const server = build({ root: "web" });
            const root = internals(server).root;

            const staticIndex = mockUse.mock.calls.findIndex(
                (call) => call[0] === `static:${root}`,
            );
            const injectorIndex = mockUse.mock.calls.findIndex(
                (call) => typeof call[0] === "function",
            );

            expect(injectorIndex).toBeGreaterThanOrEqual(0);
            expect(injectorIndex).toBeLessThan(staticIndex);
        });

        it("should log a WebSocket server error instead of crashing", () => {
            // The socket server re-emits the HTTP server's errors, so without
            // its own handler an EADDRINUSE became an unhandled 'error' event
            // and took the process down despite the handler on the server.
            const server = build({ port: 4321 });

            expect(() =>
                internals(server).wss.emit(
                    "error",
                    Object.assign(new Error("bind failed"), {
                        code: "EADDRINUSE",
                    }),
                ),
            ).not.toThrow();

            expect(spyOutput(spies.error())).toContain(
                "Live Server WebSocket error",
            );
        });
    });

    // ------------------------------------------------------------------------
    // WebSocket handling
    // ------------------------------------------------------------------------

    describe("websocket handling", () => {
        /** Builds a fake client socket. */
        const fakeClient = (readyState = 1) => {
            const client = new EventEmitter() as EventEmitter & {
                readyState: number;
                send: jest.Mock;
                close: jest.Mock;
            };
            client.readyState = readyState;
            client.send = jest.fn();
            client.close = jest.fn();
            return client;
        };

        it("should track a new connection", () => {
            const server = build({ port: 4321 });
            const client = fakeClient();

            internals(server).wss.emit("connection", client);

            expect(internals(server).clients.size).toBe(1);
            expect(spyOutput(spies.log())).toContain(
                "New WebSocket connection established.",
            );
        });

        it("should log incoming messages", () => {
            const server = build({ port: 4321 });
            const client = fakeClient();
            internals(server).wss.emit("connection", client);

            client.emit("message", Buffer.from("hello"));

            expect(spyOutput(spies.log())).toContain(
                "WebSocket message received: hello",
            );
        });

        it("should drop a client that closes", () => {
            const server = build({ port: 4321 });
            const client = fakeClient();
            internals(server).wss.emit("connection", client);

            client.emit("close");

            expect(internals(server).clients.size).toBe(0);
            expect(spyOutput(spies.log())).toContain(
                "WebSocket connection closed.",
            );
        });

        it("should drop a client that errors", () => {
            const server = build({ port: 4321 });
            const client = fakeClient();
            internals(server).wss.emit("connection", client);

            client.emit("error", new Error("socket blew up"));

            expect(internals(server).clients.size).toBe(0);
            expect(spyOutput(spies.error())).toContain(
                "WebSocket encountered an error",
            );
        });
    });

    // ------------------------------------------------------------------------
    // reloadClients
    // ------------------------------------------------------------------------

    describe("reloadClients", () => {
        it("should send a reload to open clients only", () => {
            const server = build({ port: 4321 });
            const open = {
                readyState: 1,
                send: jest.fn(),
                close: jest.fn(),
            };
            const closed = {
                readyState: 3,
                send: jest.fn(),
                close: jest.fn(),
            };
            internals(server).clients.add(open);
            internals(server).clients.add(closed);

            server.reloadClients();

            expect(open.send).toHaveBeenCalledWith("reload");
            expect(closed.send).not.toHaveBeenCalled();
            expect(spyOutput(spies.log())).toContain(
                "Reloading all connected clients...",
            );
        });

        it("should tolerate having no clients", () => {
            const server = build({ port: 4321 });
            expect(() => server.reloadClients()).not.toThrow();
        });
    });

    // ------------------------------------------------------------------------
    // Live reload script injection
    // ------------------------------------------------------------------------

    describe("injectLiveReloadScript", () => {
        let webRoot: string;

        beforeEach(() => {
            webRoot = mkdtempSync(join(tmpdir(), "kist-live-root-"));
            writeFileSync(
                join(webRoot, "index.html"),
                "<html><body>hello</body></html>",
            );
        });

        afterEach(() => {
            rmSync(webRoot, { recursive: true, force: true });
        });

        /** Invokes the middleware and resolves once it has settled. */
        async function invoke(url: string): Promise<{
            next: jest.Mock;
            send: jest.Mock;
            status: jest.Mock;
        }> {
            const server = build({ port: 4321, root: webRoot });
            const next = jest.fn();
            const send = jest.fn();
            const status = jest.fn(() => ({ end: jest.fn() }));
            const response = {
                type: jest.fn(() => ({ send })),
                status,
            } as unknown as Response;

            internals(server).injectLiveReloadScript(
                { path: url } as Request,
                response,
                next as unknown as NextFunction,
            );

            // The middleware settles on a promise chain that includes a real
            // file read, so wait for it to reach one of its outcomes.
            const settled = (): boolean =>
                next.mock.calls.length > 0 ||
                send.mock.calls.length > 0 ||
                status.mock.calls.length > 0;
            for (let tick = 0; tick < 100 && !settled(); tick++) {
                await new Promise((resolveTick) => setImmediate(resolveTick));
            }

            return { next, send, status };
        }

        it("should pass non-HTML requests straight through", async () => {
            const { next, send } = await invoke("/app.js");
            expect(next).toHaveBeenCalledWith();
            expect(send).not.toHaveBeenCalled();
        });

        it("should serve the page with the reload script appended", async () => {
            const { send, next } = await invoke("/index.html");

            const body = send.mock.calls[0][0] as string;
            expect(body).toContain("<body>hello</body>");
            expect(body).toContain("new WebSocket(");
            expect(next).not.toHaveBeenCalled();
        });

        it("should derive the socket URL from the page location", async () => {
            // A hardcoded localhost URL breaks as soon as the page is opened
            // from another machine or over TLS.
            const { send } = await invoke("/index.html");
            const body = send.mock.calls[0][0] as string;

            expect(body).toContain("location.host");
            expect(body).not.toContain("localhost");
        });

        it("should serve index.html for a directory request", async () => {
            const { send } = await invoke("/");
            expect(send.mock.calls[0][0]).toContain("<body>hello</body>");
        });

        it("should defer a missing page to the next handler", async () => {
            const { next, send } = await invoke("/missing.html");

            expect(next).toHaveBeenCalledWith();
            expect(send).not.toHaveBeenCalled();
        });

        it("should refuse a path that escapes the served root", async () => {
            const { status, send } = await invoke("/../../etc/passwd.html");

            expect(status).toHaveBeenCalledWith(403);
            expect(send).not.toHaveBeenCalled();
        });

        it("should refuse a percent-encoded traversal", async () => {
            const { status, send } = await invoke(
                "/%2e%2e/%2e%2e/secret.html",
            );

            expect(status).toHaveBeenCalledWith(403);
            expect(send).not.toHaveBeenCalled();
        });

        it("should pass on a malformed percent-encoding", async () => {
            const { next, send } = await invoke("/%E0%A4%A.html");

            expect(next).toHaveBeenCalledWith();
            expect(send).not.toHaveBeenCalled();
        });

        it("should forward an unexpected read failure", async () => {
            const failure = Object.assign(new Error("EACCES"), {
                code: "EACCES",
            });
            jest.spyOn(fsPromises, "readFile").mockRejectedValueOnce(failure);

            const { next, send } = await invoke("/index.html");

            expect(next).toHaveBeenCalledWith(failure);
            expect(send).not.toHaveBeenCalled();
            expect(spyOutput(spies.error())).toContain(
                "Error reading HTML file",
            );
        });
    });

    // ------------------------------------------------------------------------
    // Shutdown
    // ------------------------------------------------------------------------

    describe("shutdown", () => {
        it("should close clients, the socket server and the http server", async () => {
            const server = build({ port: 4321 });
            const client = {
                readyState: 1,
                send: jest.fn(),
                close: jest.fn(),
            };
            internals(server).clients.add(client);

            await server.shutdown();

            expect(client.close).toHaveBeenCalled();
            expect(internals(server).wss.close).toHaveBeenCalled();
            expect(httpServer.close).toHaveBeenCalled();
            expect(spyOutput(spies.log())).toContain(
                "Live Reload Server has been shut down.",
            );
        });

        it("should treat ERR_SERVER_NOT_RUNNING as already stopped", async () => {
            const server = build({ port: 4321 });
            httpServer.closeError = Object.assign(new Error("not running"), {
                code: "ERR_SERVER_NOT_RUNNING",
            });

            await expect(server.shutdown()).resolves.toBeUndefined();
            expect(spyOutput(spies.warn())).toContain(
                "Server is not running, skipping shutdown.",
            );
        });

        it("should reject on any other close error", async () => {
            const server = build({ port: 4321 });
            httpServer.closeError = Object.assign(new Error("in use"), {
                code: "EADDRINUSE",
            });

            await expect(server.shutdown()).rejects.toThrow("in use");
            expect(spyOutput(spies.error())).toContain(
                "Error shutting down server:",
            );
        });

        it("should reject when the close error carries no code", async () => {
            const server = build({ port: 4321 });
            httpServer.closeError = new Error("plain failure");

            await expect(server.shutdown()).rejects.toThrow("plain failure");
        });

        it("should reject when the close error is not an object", async () => {
            const server = build({ port: 4321 });
            httpServer.closeError = "string failure";

            await expect(server.shutdown()).rejects.toBe("string failure");
        });

        it("should reject when the close error is null-like but truthy", async () => {
            const server = build({ port: 4321 });
            httpServer.closeError = 42;

            await expect(server.shutdown()).rejects.toBe(42);
        });
    });
});

// ----------------------------------------------------------------------------
// Listen failures
// ----------------------------------------------------------------------------

describe("LiveServer listen failures", () => {
    const spies = silenceConsole();
    let httpServer: FakeHttpServer;

    beforeEach(() => {
        mockUse.mockReset();
        mockStatic.mockClear();
        httpServer = new FakeHttpServer();
        mockListen.mockReset();
        mockListen.mockImplementation(
            (_port: number, callback?: () => void) => {
                callback?.();
                return httpServer;
            },
        );
        ConfigStore.getInstance().set("options.live", { port: 4321 });
    });

    it("should explain an in-use port", () => {
        new LiveServer();

        httpServer.emit(
            "error",
            Object.assign(new Error("listen EADDRINUSE"), {
                code: "EADDRINUSE",
            }),
        );

        const errors = spyOutput(spies.error());
        expect(errors).toContain("Port 4321 is already in use.");
        expect(errors).toContain("Set 'options.live.port' to a free port.");
    });

    it("should report any other listen failure", () => {
        new LiveServer();

        httpServer.emit(
            "error",
            Object.assign(new Error("permission denied"), { code: "EACCES" }),
        );

        expect(spyOutput(spies.error())).toContain(
            "Live Server failed to start.",
        );
    });
});
