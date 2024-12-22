// ============================================================================
// Import
// ============================================================================

import { StepInterface } from "./StepInterface";


// ============================================================================
// Interfaces
// ============================================================================

/**
 * StageInterface represents a stage in the packaging pipeline, consisting of
 * multiple steps. Each stage serves as a logical grouping of related steps,
 * providing a structured way to organize the pipeline execution flow. Stages
 * can have dependencies on other stages, allowing for complex sequencing of
 * actions within the pipeline.
 */
export interface StageInterface {

    /**
     * A unique identifier for the stage, used for logging, tracking, and
     * reporting purposes. The name should be descriptive enough to clearly
     * convey the purpose of the stage.
     */
    name: string;

    /**
     * An ordered array of steps that comprise the stage.
     * Steps are executed consecutively within the stage, following the order
     * they are defined in. Each step is expected to implement the
     * StepInterface, providing specific actions to be performed.
     */
    steps: StepInterface[];

    /**
     * An optional list of stage names that this stage depends on.
     * The current stage will not begin execution until all specified dependent
     * stages have completed successfully. This allows for orchestrating
     * complex dependencies and ensuring proper sequencing of stages in the
     * pipeline.
     */
    dependsOn?: string[];

    /**
     * An optional description of the stage, providing additional context and
     * details about what the stage is intended to accomplish. Useful for
     * documentation, logging, and understanding the overall pipeline flow.
     */
    description?: string;

    /**
     * An optional flag to control whether the stage should be executed.
     * This can be used to conditionally skip stages based on dynamic criteria,
     * such as environment settings or previous results.
     * Default is true (stage will be executed).
     */
    enabled?: boolean;

    /**
     * Optional timeout for the entire stage, specified in milliseconds.
     * If the stage exceeds this duration, it will be forcibly terminated to
     * prevent blocking the pipeline indefinitely. Helps manage long-running
     * stages and ensures the pipeline maintains predictable execution times.
     */
    timeout?: number;

}
