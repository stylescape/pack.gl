// src/live/LiveReloadServer.ts


// ============================================================================
// Import
// ============================================================================

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";


// ============================================================================
// Class
// ============================================================================

/**
 * LiveReloadServer class provides functionality to serve static files,
 * inject live reload scripts into HTML responses, and manage WebSocket
 * connections to enable live reload capabilities.
 */
export class LiveReloadServer {

    // Parameters
    // ========================================================================

    // Express application
    private app = express();

    // HTTP server
    private server: Server;

    // WebSocket server
    private wss: WebSocketServer;

    // Set of connected WebSocket clients
    private clients: Set<WebSocket> = new Set();

    // Constructor
    // ========================================================================

    /**
     * Initializes the LiveReloadServer.
     * @param port - The port on which the server will listen.
     */
    constructor(private port: number) {

        // Start the HTTP server
        this.server = this.app.listen(
            this.port, () => {
                console.log(
                    `Live Reload Server running at http://localhost:${this.port}`
                );
            }
        );

        // Initialize WebSocket server
        this.wss = new WebSocketServer(
            { server: this.server }
        );

        // Set up middleware, rate limiting, and WebSocket handlers
        this.setupRateLimiter(); // Apply rate limiting
        this.setupWebSocketHandlers();
        this.setupMiddleware();
    }

    // Methods
    // ========================================================================

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

        this.wss.on(
            "connection",
            (ws: WebSocket) => {

                console.log(
                    "New WebSocket connection established."
                );
                this.clients.add(ws);

                ws.on(
                    "message",
                    (message) => {
                        console.log(
                            "WebSocket message received:",
                            message.toString()
                        );
                    }
                );

                ws.on(
                    "close",
                    () => {
                        console.log(
                            "WebSocket connection closed.",
                        );
                        this.clients.delete(ws);
                    }
                );

                ws.on(
                    "error",
                    (error) => {
                        console.error(
                            "WebSocket encountered an error:",
                            error
                        );
                        this.clients.delete(ws);
                    }
                );

            }
        );
    }

    /**
     * Sets up middleware for serving static files and injecting the live
     * reload script into HTML files.
     */
    private setupMiddleware(): void {

        // Serve static files from the "public" directory
        // Securely resolve public directory
        const publicPath = path.resolve(
            __dirname,
            "public"
        );
        this.app.use(express.static(publicPath));


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
        next: NextFunction
    ): void {
        if (req.url.endsWith(".html")) {
            const sanitizedPath = path.join(
                path.resolve(__dirname, "public"),
                // Prevent directory traversal
                path.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/g, "")
            );

            res.sendFile(sanitizedPath, (err) => {
                if (err) {
                    console.error("Error sending HTML file:", err);
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
                        </script>`
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

        console.log("Reloading all connected clients...");

        this.clients.forEach(
            client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("reload");
                }
            }
        );
    }

    /**
     * Gracefully shuts down the server and all WebSocket connections.
     */
    public async shutdown(): Promise<void> {

        console.log("Shutting down Live Reload Server...");

        this.clients.forEach(client => client.close());
        this.wss.close();

        await new Promise<void>(
            (resolve, reject) => {
                this.server.close(
                    (err) => {
                        if (err) {
                            console.error(
                                "Error shutting down server:",
                                err
                            );
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            }
        );

        console.log("Live Reload Server has been shut down.");

    }

}
