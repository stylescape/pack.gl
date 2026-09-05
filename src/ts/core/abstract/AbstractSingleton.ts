// ============================================================================
// Abstract Singleton
// ============================================================================

/**
 * AbstractSingleton provides a base class for implementing singletons.
 * It ensures that only one instance of the derived class can exist.
 */
export abstract class AbstractSingleton<T extends AbstractSingleton<T>> {
    /**
     * One instance per concrete subclass, keyed by class name. Shared across
     * the whole hierarchy so each subclass gets its own slot rather than
     * competing for a single one.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static _instances = new Map<string, AbstractSingleton<any>>();

    /**
     * Records this instance as the singleton for its concrete class.
     *
     * Protected so only subclasses can construct; use the subclass's
     * `getInstance` instead.
     *
     * @throws Error if an instance of the same class already exists.
     */
    protected constructor() {
        const className = this.constructor.name;
        if (AbstractSingleton._instances.has(className)) {
            throw new Error(
                `${className} is a singleton and has already been instantiated.`,
            );
        }
        AbstractSingleton._instances.set(className, this);
    }

    /**
     * Retrieves the singleton instance of the derived class.
     * If no instance exists, it initializes one.
     *
     * @returns The singleton instance.
     */
    public static getInstance<T extends AbstractSingleton<T>>(
        this: new () => T,
    ): T {
        const className = this.name;
        if (!AbstractSingleton._instances.has(className)) {
            AbstractSingleton._instances.set(className, new this());
        }
        return AbstractSingleton._instances.get(className) as T;
    }

    /**
     * Clears the singleton instance, useful for testing or resetting state.
     */
    public static clearInstance<T extends AbstractSingleton<T>>(
        this: new () => T,
    ): void {
        AbstractSingleton._instances.delete(this.name);
    }
}
