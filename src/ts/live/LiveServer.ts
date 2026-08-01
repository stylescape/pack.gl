// ============================================================================
// Import
// ============================================================================

import type { NextFunction, Request, Response } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
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
        this.watchPaths = (
            liveReloadOptions.watchPaths || [
                "src/**/*",
                "config/**/*",
                "kist.yaml",
                "kist.yml",
            ]
        ).map((p: string) => path.resolve(process.cwd(), p));
        this.ignoredPaths = (
            liveReloadOptions.ignoredPaths || ["node_modules"]
        ).map((p: string) => path.resolve(process.cwd(), p));

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

        // Initialize WebSocket server
        this.wss = new WebSocketServer({ server: this.server });

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
        this.app.use(express.static(this.root));
        // Middleware to inject the live reload script into HTML files
        this.app.use(this.injectLiveReloadScript.bind(this));
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
        if (req.url.endsWith(".html")) {
            // Serve HTML from the configured static root (not a path
            // relative to the compiled module, which does not exist).
            const sanitizedPath = path.join(
                this.root,
                // Prevent directory traversal
                path.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/g, ""),
            );

            res.sendFile(sanitizedPath, (err) => {
                if (err) {
                    this.logError("Error sending HTML file:", err);
                    next(err);
                } else {
                    res.write(
                        `<script>
                            const ws = new WebSocket("ws://localhost:${this.port}");
                            ws.onmessage = (event) => {
                                if (event.data === "reload") {
                                    console.log("Reloading page...");
                                    window.location.reload();
                                }
                            };
                        </script>`,
                    );
                    res.end();
                }
            });
        } else {
            next();
        }
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
