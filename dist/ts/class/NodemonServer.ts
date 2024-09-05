// class/NodemonServer.ts



// ============================================================================
// Import
// ============================================================================

// import express from 'express';
// import path from 'path';

// ============================================================================
// Classes
// ============================================================================

/**
 * Encapsulates server configuration and initialization, serving static files and additional routes.
 * This class can be extended or instantiated directly to set up a server quickly.
 */
// class CustomServer {
//     private app: express.Application;

//     constructor() {
//         this.app = express();
//         this.configureRoutes();
//     }

//     /**
//      * Configures the server routes including static files and any additional API endpoints.
//      */
//     private configureRoutes(): void {
//         // Serve static files from the 'public' directory
//         this.app.use(express.static(path.join(__dirname, 'public')));

//         // Additional routes can be configured here
//         this.app.get('/', (req, res) => {
//             res.send('Hello, world!');
//         });
//     }

//     /**
//      * Starts the server on the specified port.
//      * @param port The port number on which the server should listen.
//      */
//     public listen(port: number): void {
//         this.app.listen(port, () => {
//             console.log(`Server listening on port ${port}`);
//         });
//     }
// }

// ============================================================================
// Export
// ============================================================================

// export default CustomServer;

// ============================================================================
// Nodemon Configuration Example (package.json)
// ============================================================================

// "scripts": {
//     "start": "nodemon --watch src --ext ts,js,json --exec ts-node src/index.ts"
// }


// ============================================================================
// Example
// ============================================================================

/**
 * Usage Example:
 * 
 * import CustomServer from './CustomServer';
 * 
 * const server = new CustomServer();
 * server.listen(3000); // Listen on port 3000
 */
