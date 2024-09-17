// src/core/StepActionRegistry.ts


// ============================================================================
// Import
// ============================================================================

import { BuildAction } from '../actions/BuildAction';
import { LintAction } from '../actions/LintAction';
import { StepActionInterface } from '../interface/StepActionInterface';


// ============================================================================
// Class
// ============================================================================

/**
 * A registry for all step actions, mapping action names to their corresponding classes.
 * This registry allows dynamic resolution of step actions within the pipeline,
 * enabling the integration of custom actions by developers.
 */
const stepActionRegistry: Map<string, new () => StepActionInterface> = new Map();

/**
 * Registers a new step action in the registry.
 * This function allows developers to add custom step actions to the pipeline,
 * enhancing the extensibility of pack.gl.
 *
 * @param name - The unique name of the action. This name is used to reference the action in pipeline configurations.
 * @param actionClass - The class that implements the StepActionInterface interface. This class defines the action's behavior.
 * @throws Error if the action name is already registered, ensuring uniqueness of action names.
 */
export function registerStepAction(name: string, actionClass: new () => StepActionInterface): void {
    if (stepActionRegistry.has(name)) {
        throw new Error(`Action "${name}" is already registered. Please choose a unique name.`);
    }
    stepActionRegistry.set(name, actionClass);
}

/**
 * Retrieves a step action class from the registry.
 * This function looks up an action by name, returning the corresponding class
 * that implements the StepActionInterface.
 *
 * @param name - The name of the action to retrieve.
 * @returns The action class constructor if found, or undefined if no action with the given name is registered.
 */
export function getStepAction(name: string): (new () => StepActionInterface) | undefined {
    return stepActionRegistry.get(name);
}

/**
 * Lists all registered step actions.
 * Provides a utility to view currently registered actions, useful for debugging and validation.
 *
 * @returns An array of action names currently registered in the system.
 */
export function listRegisteredActions(): string[] {
    return Array.from(stepActionRegistry.keys());
}

// Pre-register core actions
registerStepAction('build', BuildAction);
registerStepAction('lint', LintAction);