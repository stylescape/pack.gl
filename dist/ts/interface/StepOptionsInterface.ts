// src/interface/StepOptionsInterface.ts

// ============================================================================
// Interfaces
// ============================================================================

/**
 * StepOptionsInterface represents the configuration options for a step,
 * allowing customization of the step's behavior through specific parameters
 * and settings. This interface can be extended for action-specific options,
 * providing type safety and clarity for different configurations used within
 * the packaging pipeline.
 */
export interface StepOptionsInterface {
    /**
     * An optional description of the step, useful for logging, debugging, and
     * reporting. This provides additional context about the step's purpose and
     * configuration.
     */
    description?: string;

    /**
     * Specifies whether the step should be enabled or skipped.
     * This can be used to conditionally execute steps based on dynamic
     * criteria.
     * Default is true (enabled).
     */
    enabled?: boolean;

    /**
     * A map of arbitrary key-value pairs representing options specific to the
     * step. Each action can define its own expected options to customize the
     * behavior of the step.
     * 
     * Example:
     * - A 'build' step might include { minify: true, target: 'es6' }
     * - A 'test' step might include { framework: 'jest', coverage: true }
     */
    [key: string]: any; // Generic record to accommodate various options
}

/**
 * Extending StepOptionsInterface for specific actions can further refine
 * the options, adding more precise typing and validation where needed.
 * For example, a BuildStepOptions interface might extend StepOptionsInterface
 * to include more detailed settings like minify, sourceMap, etc.
 */
