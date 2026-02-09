/**
 * Defines the structure of options passed to step actions.
 * This type provides a flexible, yet type-safe, way to manage action-specific settings.
 */
export interface ActionOptionsType {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;

    // Example of optional field
    optionalField?: string;
}
