// ============================================================================
// Import
// ============================================================================

import type { NextFunction, Request, Response } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import { promises as fs } from "fs";
import type { Server } from "http";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { AbstractProcess } from "../core/abstract/AbstractProcess.js";
import { ConfigStore } from "../core/config/ConfigStore.js";
import type { LiveOptionsInterface } from "../interface/index.js";
import type { OptionsInterface } from "../interface/OptionsInterface.js";

// ============================================================================
// Class
// ============================================================================

/**
 * LiveServer class provides functionality to serve static files,
 * inject live reload scripts into HTML responses, and manage WebSocket
 * connections to enable live reload capabilities.
 */
export class LiveServer extends AbstractProcess {
    // Parameters
    // ========================================================================

    /**
     * Express application
     */
    private app = express();

    /**
     * The underlying HTTP server used by the LiveServer.
     * Handles incoming HTTP requests and serves static files.
     */
    private server: Server;

    /**
     * The WebSocket server responsible for managing WebSocket connections.
     * Enables real-time communication with connected clients.
     */
    private wss: WebSocketServer;

    /**
     * A set of WebSocket clients currently connected to the server.
     * Each client represents an active WebSocket connection.
     */
    private clients: Set<WebSocket> = new Set();

    /**
     * The port number on which the server is running.
     * Defaults to 3000 if not specified in the configuration.
     */
    private port: number;

    /**
     * The root directory from which static files are served.
     * Defaults to the "public" folder in the current working directory.
     */
    private root: string;

    /**
     * An array of paths to watch for changes.
     * When a file within these paths changes, the server triggers live reload.
     */
    private watchPaths: string[];

    /**
     * An array of paths or patterns to ignore during file watching.
     * Prevents unnecessary reloads caused by changes in these paths.
     * Defaults to ignoring the "node_modules" directory.
     */
    private ignoredPaths: string[];

    // Constructor
    // ========================================================================

    /**
     * Initializes the LiveServer.
    //  * @param port - The port on which the server will listen.
     */
    constructor() {
        super();

        const configStore = ConfigStore.getInstance();

        const liveReloadOptions: LiveOptionsInterface =
            configStore.get<OptionsInterface["live"]>("options.live") || {};

        // Extract and apply live reload options with defaults
        this.port = liveReloadOptions.port || 3000;
        this.root = path.resolve(
            process.cwd(),
            liveReloadOptions.root || "public",
        );
        // Reported for diagnostics only; LiveWatcher owns the watching. Kept
        // as written rather than resolved, because `path.resolve` on a glob
        // produces an absolute path that matches nothing and only made the
        // startup banner misleading.
        this.watchPaths = liveReloadOptions.watchPaths || [
            "src/**/*",
            "config/**/*",
            "kist.yaml",
            "kist.yml",
        ];
        this.ignoredPaths = liveReloadOptions.ignoredPaths || ["node_modules"];

        // Log initialization details
        this.logInitializationDetails();

        // Initialize server
        // this.initializeServer();

        // Start the HTTP server
        this.server = this.app.listen(this.port, () => {
            this.logInfo(
                `Live Server running at http://localhost:${this.port}`,
            );
        });

        // Surface listen failures (e.g. EADDRINUSE) instead of crashing
        // with an unhandled 'error' event.
        this.server.on("error", (error: NodeJS.ErrnoException) => {
            if (error.code === "EADDRINUSE") {
                this.logError(
                    `Port ${this.port} is already in use. ` +
                        `Set 'options.live.port' to a free port.`,
                    error,
                );
            } else {
                this.logError("Live Server failed to start.", error);
            }
        });

        // Initialize WebSocket server. It re-emits the HTTP server's errors,
        // so it needs its own handler: without one an EADDRINUSE became an
        // unhandled 'error' event and killed the process despite the handler
        // installed above.
        this.wss = new WebSocketServer({ server: this.server });
        this.wss.on("error", (error) => {
            this.logError("Live Server WebSocket error.", error);
        });

        // Set up rate limiting
        this.setupRateLimiter();

        // Set up WebSocket handlers
        this.setupWebSocketHandlers();

        // Set up middleware
        this.setupMiddleware();
    }

    // Methods
    // ========================================================================

    /** Logs initialization details for the LiveServer. */
    private logInitializationDetails(): void {
        this.logInfo(`LiveServer initialized with port: ${this.port}`);
        this.logInfo(`Serving static files from: ${this.root}`);
        this.logInfo(`Watching paths: ${JSON.stringify(this.watchPaths)}`);
        this.logInfo(`Ignoring paths: ${JSON.stringify(this.ignoredPaths)}`);
    }

    /**
     * Sets up rate limiting middleware to prevent abuse of HTTP requests.
     */
    private setupRateLimiter(): void {
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: "Too many requests from this IP, please try again later.",
        });
        this.app.use(limiter);
    }

    /**
     * Sets up WebSocket handlers to manage client connections.
     */
    private setupWebSocketHandlers(): void {
        this.wss.on("connection", (ws: WebSocket) => {
            this.logInfo("New WebSocket connection established.");
            this.clients.add(ws);

            ws.on("message", (message) => {
                this.logInfo(
                    `WebSocket message received: ${message.toString()}`,
                );
            });
            ws.on("close", () => {
                this.logInfo("WebSocket connection closed.");
                this.clients.delete(ws);
            });
            ws.on("error", (error) => {
                this.logError("WebSocket encountered an error:", error);
                this.clients.delete(ws);
            });
        });
    }

    /**
     * Sets up middleware for serving static files and injecting the live
     * reload script into HTML files.
     */
    private setupMiddleware(): void {
        // Securely serve static files from the "public" directory
        // const publicPath = path.resolve(
        //     __dirname,
        //     "public"
        // );
        this.logInfo(`Resolved public directory: ${this.root}`);
        this.logInfo(`Serving static files from: ${this.root}`);
        // The injector runs *before* the static handler. Registered after it,
        // every HTML file was served verbatim by `express.static` and the
        // injector never ran, so no page ever received the reload script.
        this.app.use(this.injectLiveReloadScript.bind(this));
        this.app.use(express.static(this.root));
    }

    /**
     * Middleware function to inject the live reload script into HTML
     * responses. Prevents directory traversal attacks by sanitizing the
     * requested file path.
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     * @param next - The next middleware function.
     */
    private injectLiveReloadScript(
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        // `req.path` excludes the query string, so "/index.html?v=2" is still
        // recognised as HTML. A bare directory request resolves to its
        // index.html, the page a browser actually loads.
        const requested = req.path.endsWith("/")
            ? `${req.path}index.html`
            : req.path;

        if (!requested.endsWith(".html")) {
            next();
            return;
        }

        // Resolve inside the static root and confirm the result stayed there,
        // so an encoded or nested traversal cannot escape the served
        // directory.
        let decoded: string;
        try {
            decoded = decodeURIComponent(requested);
        } catch {
            next();
            return;
        }

        const target = path.resolve(path.join(this.root, decoded));
        if (target !== this.root && !target.startsWith(this.root + path.sep)) {
            this.logWarn(`Refusing to serve path outside the root: ${target}`);
            res.status(403).end();
            return;
        }

        // Read the file and send it with the script appended. The previous
        // version called `res.write` from `res.sendFile`'s completion
        // callback, by which point the response had already been ended, so
        // the script was never appended.
        fs.readFile(target, "utf-8")
            .then((html) => {
                res.type("html").send(html + this.reloadScript());
            })
            .catch((error: NodeJS.ErrnoException) => {
                if (error.code === "ENOENT" || error.code === "EISDIR") {
                    // Not ours to serve; let the static handler or the 404
                    // path deal with it.
                    next();
                    return;
                }
                this.logError("Error reading HTML file:", error);
                next(error);
            });
    }

    /**
     * The client-side script that reconnects and reloads on rebuild.
     *
     * The WebSocket URL is derived from the page's own location rather than
     * hardcoded to localhost, so the page also works when opened from another
     * machine or behind TLS.
     *
     * @returns A script tag to append to served HTML.
     */
    private reloadScript(): string {
        return `<script>
            (() => {
                const scheme = location.protocol === "https:" ? "wss" : "ws";
                const ws = new WebSocket(scheme + "://" + location.host);
                ws.onmessage = (event) => {
                    if (event.data === "reload") {
                        window.location.reload();
                    }
                };
            })();
        </script>`;
    }

    /**
     * Sends a reload signal to all connected WebSocket clients.
     */
    public reloadClients(): void {
        this.logInfo("Reloading all connected clients...");

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send("reload");
            }
        });
    }

    /**
     * Gracefully shuts down the server and all WebSocket connections.
     */
    public async shutdown(): Promise<void> {
        this.logInfo("Shutting down Live Reload Server...");

        this.clients.forEach((client) => client.close());
        this.wss.close();

        await new Promise<void>((resolve, reject) => {
            this.server.close((err) => {
                if (err) {
                    if (
                        this.isErrnoException(err) &&
                        err.code === "ERR_SERVER_NOT_RUNNING"
                    ) {
                        this.logWarn(
                            "Server is not running, skipping shutdown.",
                        );
                        resolve();
                    } else {
                        this.logError("Error shutting down server:", err);
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
        });

        this.logInfo("Live Reload Server has been shut down.");
    }

    /**
     * Type guard to check if an error is an instance of NodeJS.ErrnoException.
     * @param error - The error to check.
     * @returns True if the error has a `code` property.
     */
    private isErrnoException(error: unknown): error is NodeJS.ErrnoException {
        return typeof error === "object" && error !== null && "code" in error;
    }
}
