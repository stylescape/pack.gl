/**
 * Defines the TypeScript types for configuration and tasks used in pack.gl.
 * This file provides the core interfaces for defining packaging tasks and their configurations.
 * It includes type definitions for tasks, task actions, and the overall pipeline configuration.
 */

/**
 * Defines the available actions that can be performed by tasks.
 * Each action corresponds to a specific task operation, such as 'build', 'test', 'package', etc.
 * Extend this union type to include more actions as your requirements grow.
 */
export type TaskAction = 
    | 'build'        // Build the project (e.g., compiling source code)
    | 'test'         // Run tests (e.g., unit tests, integration tests)
    | 'lint'         // Lint code for style and errors
    | 'package'      // Package the project (e.g., creating tarballs, zips)
    | 'deploy'       // Deploy the project to a server or service
    | 'custom';      // Placeholder for custom user-defined actions


/**
 * Represents a single task within the packaging pipeline.
 * Each task has a name, an action that specifies what it does, and optional task-specific options.
 */
export interface Task {
    /**
     * A unique name for the task. This name is used for logging and debugging purposes.
     */
    name: string;

    /**
     * The action that this task will perform. It can be one of the predefined actions
     * or a custom action as defined by the user.
     */
    action: TaskAction;

    /**
     * Optional configuration options specific to the task. This can include any
     * parameters or settings required by the task action, such as paths, flags, etc.
     */
    options?: TaskOptions;
}


/**
 * Represents the options object for a task, allowing configuration
 * of task-specific parameters and settings.
 */
export interface TaskOptions {
    /**
     * Key-value pairs representing options specific to the task.
     * For example, a 'build' task might include { minify: true }.
     */
    [key: string]: any; // Generic record to accommodate various options
}


/**
 * Defines the configuration for the packaging pipeline.
 * The configuration consists of an array of tasks that will be executed sequentially.
 */
export interface Config {
    /**
     * A list of tasks to be executed in the pipeline. Tasks are run consecutively
     * in the order they appear in this array.
     */
    tasks: Task[];

    /**
     * Optional global options that apply to the entire pipeline.
     * These can include general settings like logging levels, parallel execution flags, etc.
     */
    globalOptions?: GlobalOptions;
}


/**
 * Represents global configuration options that apply to the entire pipeline.
 */
export interface GlobalOptions {
    /**
     * Specifies the level of logging. Can be 'verbose', 'info', 'warn', or 'error'.
     * Default is 'info'.
     */
    logLevel?: 'verbose' | 'info' | 'warn' | 'error';

    /**
     * Flag to enable or disable parallel execution of tasks.
     * By default, tasks are run consecutively, but this can be set to true
     * to allow parallel execution where applicable.
     */
    parallelExecution?: boolean;

    /**
     * Timeout in milliseconds for each task. If a task exceeds this duration, it will be terminated.
     * This helps prevent tasks from hanging indefinitely.
     */
    taskTimeout?: number;
}