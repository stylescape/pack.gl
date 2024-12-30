// ============================================================================
// Default Configuration
// ============================================================================

import { ConfigInterface } from "../../interface/ConfigInterface";

export const defaultConfig: ConfigInterface = {
    metadata: {
        name: "pack.gl pipeline",
        version: "1.0.0",
        author: "Anonymous",
    },
    options: {
        mode: "none",
        live: false,
        liveReload: {
            port: 3000,
            root: "public", // Default path for serving files
            watchPaths: ["src/**/*", "config/**/*", "pack.yaml"],
            ignoredPaths: ["node_modules/*"],
        },
        logLevel: "info",
        stepTimeout: 30000,
        haltOnFailure: true,
        maxConcurrentStages: 0,
        retryStrategy: {
            retries: 3,
            delay: 1000,
        },
        tags: {},
        dryRun: false,
        defaultPriority: "normal",
        enableTimingLogs: false,
    },
    stages: [],
};
