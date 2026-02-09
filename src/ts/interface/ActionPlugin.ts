// ============================================================================
// Import
// ============================================================================

import type { ActionInterface } from "./ActionInterface.js";

// ============================================================================
// Interfaces
// ============================================================================

/**
 * ActionPlugin defines the contract for kist plugins.
 * Plugins can provide one or more actions to extend kist's functionality.
 *
 * Example plugin structure:
 * ```typescript
 * import { ActionPlugin, ActionInterface } from 'kist';
 *
 * export default {
 *   version: '1.0.0',
 *   description: 'My custom kist plugin',
 *   registerActions() {
 *     return {
 *       'MyCustomAction': MyCustomAction
 *     };
 *   }
 * } as ActionPlugin;
 * ```
 */
export interface ActionPlugin {
    /**
     * Returns a record of action classes provided by this plugin.
     * Keys are action names, values are action class constructors.
     */
    registerActions(): Record<string, new () => ActionInterface>;

    /**
     * Optional: Plugin version (semantic versioning recommended)
     */
    version?: string;

    /**
     * Optional: Plugin description
     */
    description?: string;

    /**
     * Optional: Plugin author information
     */
    author?: string;

    /**
     * Optional: Plugin repository URL
     */
    repository?: string;

    /**
     * Optional: Keywords for plugin discoverability
     */
    keywords?: string[];
}
