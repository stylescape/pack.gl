// class/NodemonServer.ts

// Copyright 2024 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



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
