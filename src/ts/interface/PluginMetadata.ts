// ============================================================================
// Interface
// ============================================================================

/**
 * Metadata for a loaded plugin
 */
export interface PluginMetadata {
    /**
     * The unique name of the plugin
     */
    name: string;

    /**
     * The version of the plugin
     */
    version: string;

    /**
     * Optional description of the plugin
     */
    description?: string;

    /**
     * List of action names provided by this plugin
     */
    actions: string[];

    /**
     * Optional author information
     */
    author?: string;

    /**
     * Optional repository URL
     */
    repository?: string;

    /**
     * Optional keywords for discoverability
     */
    keywords?: string[];
}
