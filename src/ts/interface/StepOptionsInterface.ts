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
     * A flexible map of key-value pairs representing configuration settings
     * specific to the step. Each action can define its own expected structure
     * for these options, enabling fine-grained control.
     * 
     * Examples:
     * - Build step: `{ minify: true, target: 'es6', sourceMap: false }`
     * - Test step: `{ framework: 'jest', coverage: true, timeout: 3000 }`
     * 
     * This generic structure ensures compatibility with a wide range of use cases.
     */
    // [key: string]: unknown; // Generic key-value pairs to support diverse options.

}


/**
 * Recommendations for Extending StepOptionsInterface:
 * - For specific actions, extend `StepOptionsInterface` to add detailed types
 *   and enforce stricter validation.
 * 
 * Example:
 * ```typescript
 * export interface BuildStepOptions extends StepOptionsInterface {
 *     minify?: boolean;
 *     target?: 'es5' | 'es6' | 'es2020';
 *     sourceMap?: boolean;
 * }
 * ```
 * 
 * This approach ensures type safety while maintaining flexibility for general steps.
 */
