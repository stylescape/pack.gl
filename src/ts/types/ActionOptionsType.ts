/**
 * Defines the structure of options passed to step actions.
 * This type provides a flexible, yet type-safe, way to manage action-specific settings.
 */

// Extend this as needed for more specific option types.
// export type ActionOptionsType = Record<string, any>;
// export type ActionOptionsType = Record<string, any>;

export interface ActionOptionsType {
    [key: string]: any;
    optionalField?: string; // Example of optional field
}

