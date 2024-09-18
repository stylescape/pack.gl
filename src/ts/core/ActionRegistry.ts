// src/core/ActionRegistry.ts


// ============================================================================
// Import
// ============================================================================

import { DirectoryCleanAction } from '../actions/DirectoryCleanAction/DirectoryCleanAction';
import { DirectoryCopyAction } from '../actions/DirectoryCopyAction/DirectoryCopyAction';
import { FileCopyAction } from '../actions/FileCopyAction/FileCopyAction';
import { PackageManagerAction } from '../actions/PackageManagerAction/PackageManagerAction';
import { StyleProcessingAction } from '../actions/StyleProcessingAction/StyleProcessingAction';
import { VersionWriteAction } from '../actions/VersionWriterAction/VersionWriterAction';
import { ActionInterface } from '../interface/ActionInterface';


// ============================================================================
// Class
// ============================================================================

/**
 * A registry for all step actions, mapping action names to their corresponding classes.
 * This registry allows dynamic resolution of step actions within the pipeline,
 * enabling the integration of custom actions by developers.
 */
const actionRegistry: Map<string, new () => ActionInterface> = new Map();

/**
 * Registers a new step action in the registry.
 * This function allows developers to add custom step actions to the pipeline,
 * enhancing the extensibility of pack.gl.
 *
 * @param name - The unique name of the action. This name is used to reference the action in pipeline configurations.
 * @param actionClass - The class that implements the ActionInterface interface. This class defines the action's behavior.
 * @throws Error if the action name is already registered, ensuring uniqueness of action names.
 */
export function registerAction(name: string, actionClass: new () => ActionInterface): void {
    if (actionRegistry.has(name)) {
        throw new Error(`Action "${name}" is already registered. Please choose a unique name.`);
    }
    actionRegistry.set(name, actionClass);
}

/**
 * Retrieves a step action class from the registry.
 * This function looks up an action by name, returning the corresponding class
 * that implements the ActionInterface.
 *
 * @param name - The name of the action to retrieve.
 * @returns The action class constructor if found, or undefined if no action with the given name is registered.
 */
export function getAction(name: string): (new () => ActionInterface) | undefined {
    return actionRegistry.get(name);
}

/**
 * Lists all registered step actions.
 * Provides a utility to view currently registered actions, useful for debugging and validation.
 *
 * @returns An array of action names currently registered in the system.
 */
export function listRegisteredActions(): string[] {
    return Array.from(actionRegistry.keys());
}

// Pre-register core actions
registerAction('DirectoryCleanAction', DirectoryCleanAction);
registerAction('DirectoryCopyAction', DirectoryCopyAction);
registerAction('FileCopyAction', FileCopyAction);
registerAction('PackageManagerAction', PackageManagerAction);
registerAction('StyleProcessingAction', StyleProcessingAction);
registerAction('VersionWriteAction', VersionWriteAction);
