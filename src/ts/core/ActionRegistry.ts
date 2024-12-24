// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "./AbstractProcess";
import { ActionInterface } from "../interface/ActionInterface";
import { coreActions, CoreActionNames } from "../actions/CoreActions";


// ============================================================================
// Class
// ============================================================================

/**
 * A singleton registry for all step actions, mapping action names to their corresponding
 * classes. This registry allows dynamic resolution of step actions within the
 * pipeline, enabling the integration of custom actions by developers.
 */
export class ActionRegistry extends AbstractProcess {


    // Parameters
    // ========================================================================

    private static instance: ActionRegistry | null = null;

    // Map to store registered actions
    private registry: Map<string, new () => ActionInterface>;


    // Constructor
    // ========================================================================

    /**
     * Constructs an ActionRegistry instance and automatically registers core actions.
     */
    constructor() {
        // Initialize logging through AbstractProcess
        super();
        this.registry = new Map();
        // Automatically register core actions
        this.registerCoreActions();
        this.log("ActionRegistry initialized.");
    }


    // Singleton Methods
    // ========================================================================

    /**
     * Initializes the singleton instance of ActionRegistry.
     * Should only be called once during application startup.
     * @throws Error if the registry has already been initialized.
     */
    public static initialize(): void {
        if (ActionRegistry.instance) {
            throw new Error("ActionRegistry has already been initialized.");
        }
        ActionRegistry.instance = new ActionRegistry();
    }

    /**
     * Retrieves the singleton instance of ActionRegistry.
     * @returns The ActionRegistry instance.
     * @throws Error if the registry has not been initialized.
     */
    public static getInstance(): ActionRegistry {
        if (!ActionRegistry.instance) {
            throw new Error("ActionRegistry is not initialized. Call initialize() first.");
        }
        return ActionRegistry.instance;
    }

    // Instance Methods
    // ========================================================================


    /**
     * Registers a new step action in the registry.
     * This function allows developers to add custom step actions to the pipeline,
     * enhancing the extensibility of pack.gl.
     * 
     * @param name - The unique name of the action. Used as a key in the registry.
     * @param actionClass - The class that implements the ActionInterface.
     * @throws Error if the action name is already registered.
     */
    public registerAction(
        name: string,
        actionClass: new () => ActionInterface
    ): void {
        if (!name || typeof name !== "string") {
            throw new Error(`[ActionRegistry] Invalid action name provided: "${name}".`);
        }
        if (this.registry.has(name)) {
            throw new Error(`[ActionRegistry] Action "${name}" is already registered. Please choose a unique name.`);
        }
        this.registry.set(name, actionClass);
        this.log(`Action "${name}" registered successfully.`);
    }


    /**
     * Retrieves a step action class from the registry.
     * This method looks up an action by name and returns the corresponding class
     * that implements the ActionInterface.
     * 
     * @param name - The name of the action to retrieve.
     * @returns The action class constructor if found, or undefined if no such action is registered.
     */
    public getAction(name: string): (new () => ActionInterface) | undefined {
        if (!name || typeof name !== "string") {
            this.warn(`Invalid action name requested: "${name}".`);
            return undefined;
        }
        const action = this.registry.get(name);
        if (!action) {
            this.warn(`Action "${name}" not found in the registry.`);
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
        this.debug("Listing all registered actions.");
        return Array.from(this.registry.keys());
    }


    /**
     * Pre-registers core actions that are included with the pipeline by default.
     * Developers can extend this by registering additional custom actions as needed.
     */
    public registerCoreActions(): void {
        for (const [name, actionClass] of Object.entries(coreActions)) {
            this.registerAction(name, actionClass);
        }
        this.log("Core actions registered successfully.");
    }

    /**
     * Clears all registered actions in the registry.
     * Useful for testing or resetting the pipeline.
     */
    public clearRegistry(): void {
        this.registry.clear();
        this.log("Registry cleared.");
    }

}

// Initialize the registry with core actions
// ActionRegistry.registerCoreActions();