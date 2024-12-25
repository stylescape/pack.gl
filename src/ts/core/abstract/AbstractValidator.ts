// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../abstract/AbstractProcess";

// ============================================================================
// AbstractValidator Class
// ============================================================================

/**
 * AbstractValidator provides a base class for validation.
 * Extends AbstractProcess for consistent logging and validation utility
 * methods.
 * Subclasses should implement the specific `validateProperty` method for 
 * custom validation logic.
 */
export abstract class AbstractValidator<T> extends AbstractProcess {


    constructor() {
        super();
    }

    /**
     * Validates an entire object.
     * @param target - The object to validate.
     * @throws Error if validation fails for any property.
     */
    public validate(target: T): void {
        if (!target || typeof target !== "object") {
            throw new Error("Target must be a valid object.");
        }

        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                this.validateProperty(key as keyof T, target[key as keyof T]);
            }
        }

        this.logInfo("Validation completed successfully.");
    }

    /**
     * Validates a specific property of the object.
     * Subclasses must implement this method to provide specific validation logic.
     * 
     * @param key - The key of the property being validated.
     * @param value - The value of the property being validated.
     */
    protected abstract validateProperty<K extends keyof T>(key: K, value: T[K]): void;

    /**
     * Validates a numeric value.
     * 
     * @param key - The key being validated.
     * @param value - The numeric value to validate.
     * @throws Error if the value is not a non-negative number.
     */
    protected validateNumber<K extends keyof T>(key: K, value: T[K]): void {
        if (typeof value !== "number" || value < 0) {
            this.throwValidationError(key, value, "Must be a non-negative number.");
        }
    }

    /**
     * Validates a boolean value.
     * 
     * @param key - The key being validated.
     * @param value - The boolean value to validate.
     * @throws Error if the value is not a boolean.
     */
    protected validateBoolean<K extends keyof T>(key: K, value: T[K]): void {
        if (typeof value !== "boolean") {
            this.throwValidationError(key, value, "Must be a boolean.");
        }
    }

    /**
     * Validates a string value.
     * 
     * @param key - The key being validated.
     * @param value - The string value to validate.
     * @throws Error if the value is not a non-empty string.
     */
    protected validateString<K extends keyof T>(key: K, value: T[K]): void {
        if (typeof value !== "string" || value.trim() === "") {
            this.throwValidationError(key, value, "Must be a non-empty string.");
        }
    }

    /**
     * Validates an object value.
     * 
     * @param key - The key being validated.
     * @param value - The object value to validate.
     * @throws Error if the value is not a valid object.
     */
    protected validateObject<K extends keyof T>(key: K, value: T[K]): void {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            this.throwValidationError(key, value, "Must be a valid object.");
        }
    }

    /**
     * Logs validation success.
     *
     * @param target - The target object or value that was validated.
     */
    protected logValidationSuccess(key: keyof T, value: T[keyof T]): void {
        const message = `Validation successful for property "${String(key)}" with value: ${JSON.stringify(value)}`;
        this.logInfo(message);
    }


    /**
     * Throws a standardized validation error.
     * 
     * @param key - The key being validated.
     * @param value - The invalid value.
     * @param message - Additional error message.
     * @throws Error with a formatted message.
     */
    protected throwValidationError<K extends keyof T>(
        key: K,
        value: T[K],
        message: string
    ): void {
        const errorMessage = `Validation failed for "${String(key)}" with value "${value}". ${message}`;
        this.logError(errorMessage);
        throw new Error(errorMessage);
    }
}









// import { AbstractProcess } from "../abstract/AbstractProcess";

// /**
//  * AbstractValidator provides a base class for validation.
//  * Extends AbstractProcess for consistent logging.
//  * Subclasses must implement the `validate` method.
//  */
// export abstract class AbstractValidator<T> extends AbstractProcess {
//     /**
//      * Validates a target object or value.
//      *
//      * @param target - The target object or value to validate.
//      * @throws Error if validation fails.
//      */
//     public abstract validate(target: T): void;

//     /**
//      * Validates a specific key-value pair in the target object.
//      * This method can be overridden by subclasses to provide property-level validation.
//      *
//      * @param key - The key or property being validated.
//      * @param value - The value being validated.
//      * @throws Error if validation fails.
//      */
//     public validateProperty<K extends keyof T>(key: K, value: T[K]): void {
//         // Default implementation logs the validation; subclasses can override this.
//         this.logInfo(`Validating property "${String(key)}" with value: ${value}`);
//     }

//     /**
//      * Logs validation success.
//      *
//      * @param target - The target object or value that was validated.
//      */
//     protected logValidationSuccess(key: keyof T, value: T[keyof T]): void {
//         const message = `Validation successful for property "${String(key)}" with value: ${JSON.stringify(value)}`;
//         this.logInfo(message);
//     }

//     /**
//      * Throws a standardized validation error.
//      *
//      * @param key - The key being validated.
//      * @param value - The invalid value.
//      * @param message - Additional error message.
//      * @throws Error with a formatted message.
//      */
//     protected throwValidationError<K extends keyof T>(
//         key: K,
//         value: T[K],
//         message: string
//     ): void {
//         const errorMessage = `Validation failed for "${String(key)}" with value "${value}". ${message}`;
//         this.logError(errorMessage);
//         throw new Error(errorMessage);
//     }




// }