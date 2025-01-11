// ============================================================================
// Import
// ============================================================================

import { readdirSync } from "fs";
import { join } from "path";
import { coreActions } from "../../actions/CoreActions";
import { ActionInterface } from "../../interface/ActionInterface";
import { ActionPlugin } from "../../interface/ActionPlugin";
import { AbstractProcess } from "../abstract/AbstractProcess";


// ============================================================================
// Class
// ============================================================================

/**
 * ActionRegistry is a singleton registry for step actions, mapping action
 * names to their corresponding classes. This registry allows dynamic
 * resolution of step actions within the pipeline and supports custom
 * developer integrations.
 */
export class ActionRegistry extends AbstractProcess {

    // Parameters
    // ========================================================================

    /**
     * Singleton instance
     */
    private static instance: ActionRegistry | null = null;

    /**
     * Map to store registered actions
     */
    private registry: Map<string, new () => ActionInterface>;


    // Constructor
    // ========================================================================

    /**
     * Constructs an ActionRegistry instance and automatically registers core
     * actions. The constructor is private to enforce the singleton pattern.
     */
    constructor() {
        // Initialize logging through AbstractProcess
        super();
        this.registry = new Map();
        // Automatically register core actions
        this.registerCoreActions();
        this.discoverPlugins();
        this.logInfo("ActionRegistry initialized.");
    }


    // Singleton Methods
    // ========================================================================

    /**
     * Initializes the singleton instance of ActionRegistry.
     * Should only be called once during application startup.
     *
     * @throws Error if the registry has already been initialized.
     */
    public static initialize(): void {
        if (ActionRegistry.instance) {
            throw new Error(
                "ActionRegistry has already been initialized."
            );
        }
        ActionRegistry.instance = new ActionRegistry();
    }

    /**
     * Retrieves the singleton instance of ActionRegistry, initializing it if
     * necessary.
     *
     * @returns The ActionRegistry instance.
     */
    public static getInstance(): ActionRegistry {
        if (!ActionRegistry.instance) {
            ActionRegistry.instance = new ActionRegistry();
        }
        return ActionRegistry.instance;
    }

    /**
     * Resets the singleton instance of ActionRegistry.
     * This is useful for testing or resetting the registry state during
     * runtime.
     */
    public static resetInstance(): void {
        ActionRegistry.instance = null;
    }


    // Instance Methods
    // ========================================================================

    /**
     * Registers a new action in the registry.
     *
     * @param actionClass - The class implementing `ActionInterface`.
     * @throws Error if the action name is already registered or missing.
     */
    public registerAction(
        actionClass: new () => ActionInterface
    ): void {
        const actionInstance = new actionClass();
        const name = actionInstance.name;

        if (!name || typeof name !== "string") {
            throw new Error(
                `[ActionRegistry] Action class must have a valid 'name' property.`
            );
        }
        if (this.registry.has(name)) {
            throw new Error(
                `[ActionRegistry] Action "${name}" is already registered.`
            );
        }

        this.registry.set(name, actionClass);
        this.logInfo(`Action "${name}" registered successfully.`);
    }

    /**
     * Retrieves a step action class from the registry.
     * This method looks up an action by name and returns the corresponding
     * class that implements the ActionInterface.
     *
     * @param name - The name of the action to retrieve.
     * @returns The action class constructor if found, or undefined if no such
     *  action is registered.
     */
    public getAction(
        name: string
    ): (new () => ActionInterface) | undefined {

        // Validate the input name
        if (!name || typeof name !== "string") {
            this.logWarn(`Invalid action name requested: "${name}".`);
            return undefined;
        }

        // Retrieve the action from the registry
        const action = this.registry.get(name);

        // Log a warning if the action is not found
        if (!action) {
            this.logWarn(`Action "${name}" not found in the registry.`);
        } else {
            this.logDebug(`Retrieved action "${name}" from the registry.`);
        }

        return action;
    }

    /**
     * Lists all registered step actions.
     * Provides a utility to view currently registered actions, useful for
     * debugging and validation.
     *
     * @returns An array of registered action names.
     */
    public listRegisteredActions(): string[] {
        this.logDebug("Listing all registered actions.");
        return Array.from(this.registry.keys());
    }

    /**
     * Pre-registers core actions that are included with the pipeline by
     * default. Developers can extend this by registering additional custom
     * actions as needed.
     */
    private registerCoreActions(): void {
        Object.values(coreActions).forEach((actionClass) => {
            this.registerAction(actionClass);
        });
        this.logInfo("Core actions registered successfully.");
    }

    private discoverPlugins(): void {
        this.logInfo("Discovering external plugins...");

        const nodeModulesPath = join(process.cwd(), "node_modules");
        const pluginPrefix = "@pack/plugin-";

        try {
            const directories = readdirSync(nodeModulesPath, {
                withFileTypes: true,
            });

            for (const dir of directories) {
                if (dir.isDirectory() && dir.name.startsWith(pluginPrefix)) {
                    const pluginPath = join(nodeModulesPath, dir.name);
                    const plugin: ActionPlugin = require(pluginPath).default;

                    if (plugin && typeof plugin.registerActions === "function") {
                        const actions = plugin.registerActions();
                        for (const [name, actionClass] of Object.entries(
                            actions
                        )) {
                            this.registerAction(actionClass);
                        }
                    }
                }
            }

            this.logInfo("Plugins loaded successfully.");
        } catch (error) {
            this.logError("Failed to discover plugins.", error);
        }
    }

    /**
     * Clears all registered actions in the registry.
     * Useful for testing or resetting the pipeline.
     */
    public clearRegistry(): void {
        this.registry.clear();
        this.logInfo("Registry cleared.");
    }

}
