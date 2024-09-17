import express from 'express';
import path from 'path';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { spawn, ChildProcess } from 'child_process';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
    console.log(`Live Reload Server running at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });
let clients: WebSocket[] = [];

// WebSocket connection handler
wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

// Notify all connected clients to reload
const reloadClients = () => {
    clients.forEach(client => client.send('reload'));
};

// Watch files using chokidar
const watcher = chokidar.watch(['src/**/*', 'config/**/*', 'pack.yaml'], {
    ignored: /node_modules/,
    persistent: true,
});

let pipelineProcess: ChildProcess | null = null;

// Function to restart the pipeline process
const restartPipeline = () => {
    if (pipelineProcess) {
        pipelineProcess.kill();
    }

    console.log('Restarting pipeline...');
    pipelineProcess = spawn('npm', ['run', 'start'], { stdio: 'inherit' });

    pipelineProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Pipeline process exited with code ${code}`);
        }
        reloadClients(); // Reload clients when pipeline restarts
    });
};

// Watch for file changes and restart pipeline
watcher.on('change', (path) => {
    console.log(`File ${path} changed. Restarting pipeline...`);
    restartPipeline();
});

// Serve static files and inject reload script
app.use(express.static(path.join(__dirname, 'public')));

// Inject live reload script into HTML files
app.use((req, res, next) => {
    if (req.url.endsWith('.html')) {
        res.sendFile(path.join(__dirname, 'public', req.url), (err) => {
            if (err) {
                next(err);
            } else {
                res.write(
                    `<script>
                        const ws = new WebSocket('ws://localhost:${port}');
                        ws.onmessage = () => {
                            window.location.reload();
                        };
                    </script>`
                );
                res.end();
            }
        });
    } else {
        next();
    }
});

// Start the initial pipeline process
restartPipeline();