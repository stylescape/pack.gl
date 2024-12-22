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

export class LiveReloadServer {

    private app = express();
    private server: Server;
    private wss: WebSocketServer;
    private clients: Set<WebSocket> = new Set();

    /**
     * Initializes the LiveReloadServer.
     * @param port - The port on which the server will listen.
     */
    constructor(private port: number) {
        this.server = this.app.listen(
            this.port, () => {
                console.log(
                    `Live Reload Server running at http://localhost:${this.port}`
                );
            }
        );

        this.wss = new WebSocketServer({ server: this.server });
        this.setupWebSocketHandlers();
        this.setupMiddleware();
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

        // Apply rate limiting to the live reload script injection middleware
        const rateLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per `windowMs`
            message: "Too many requests from this IP, please try again later.",
        });

        // Use rate limiter and inject middleware
        this.app.use(rateLimiter, this.injectLiveReloadScript.bind(this));
    }



    /**
     * Middleware function to inject the live reload script into HTML files.
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
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send("reload");
            }
        });
    }

    /**
     * Gracefully shuts down the server and all WebSocket connections.
     */
    public async shutdown(): Promise<void> {
        console.log("Shutting down Live Reload Server...");
        this.clients.forEach(client => client.close());
        this.wss.close();

        await new Promise<void>((resolve, reject) => {
            this.server.close((err) => {
                if (err) {
                    console.error("Error shutting down server:", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log("Live Reload Server has been shut down.");
    }

}
