/**
 * LiveOptionsInterface defines the configuration settings for live reload
 * functionality, which enables dynamic updates to the application during
 * development.
 */
export interface LiveOptionsInterface {
    /**
     * Enables or disables the live reload feature.
     * - `true`: Live reload is enabled, and the server will listen for changes.
     * - `false`: Live reload is disabled.
     *
     * @default false
     */
    enabled?: boolean;

    /**
     * The port number on which the live reload server will listen.
     * If not specified, a default port (e.g., 3000) may be used.
     *
     * @example 3000
     * @default 3000
     */
    port?: number;

    /**
     * The root directory for serving static files during live reload.
     * This path is relative to the project root and is used to serve public
     * assets.
     *
     * @example "public"
     * @default "public"
     */
    root?: string;

    /**
     * An array of paths to monitor for file changes. These paths can use glob
     * patterns for flexibility
     */
    watchPaths?: string[];

    /**
     * An array of paths or patterns to exclude from monitoring. Use this to
     * ignore directories or files that do not need to trigger reloads
     */
    ignoredPaths?: string[];
}
