// src/live/live_reload.ts


import { LiveReloadServer } from './LiveReloadServer';
import { FileWatcher } from './FileWatcher';
import { PipelineManager } from './PipelineManager';

const PORT = 3000;
const WATCH_PATHS = ['src/**/*', 'config/**/*', 'pack.yaml'];
const IGNORED_PATHS = /node_modules/;

// Initialize the live reload server
const liveReloadServer = new LiveReloadServer(PORT);

// Initialize the pipeline manager
const pipelineManager = new PipelineManager(liveReloadServer);

// Initialize the file watcher
const fileWatcher = new FileWatcher(WATCH_PATHS, IGNORED_PATHS, (filePath) => {
    console.log(`Detected change in: ${filePath}. Restarting pipeline...`);
    pipelineManager.restartPipeline();
});

// Start the initial pipeline process
pipelineManager.restartPipeline();