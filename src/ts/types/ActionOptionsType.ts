/**
 * Defines the structure of options passed to step actions.
 * This type provides a flexible, yet type-safe, way to manage action-specific settings.
 */
export interface ActionOptionsType {
    [key: string]: any;

    // Example of optional field
    optionalField?: string;
}
