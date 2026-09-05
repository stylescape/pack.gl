/**
 * Defines the structure of options passed to step actions.
 * This type provides a flexible, yet type-safe, way to manage action-specific settings.
 */
export interface ActionOptionsType {
    /**
     * Actions declare their own option shapes by extending this interface;
     * the index signature keeps arbitrary keys from the YAML `options` block
     * assignable in the meantime.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;

    /**
     * Placeholder illustrating how an extending interface names a concrete
     * option. Carries no meaning to the pipeline itself.
     */
    optionalField?: string;
}
