// ============================================================================
// Import
// ============================================================================

import type { OptionsInterface } from "../../interface/OptionsInterface.js";

// ============================================================================
// Types
// ============================================================================

/**
 * The pipeline settings actually used at run time, after reconciling the three
 * places the configuration allows them to be written.
 */
export interface ResolvedPipelineOptions {
    /** Cap on stages running at once. Zero means "no limit". */
    maxConcurrentStages: number;

    /** Cap on steps running at once inside a parallel stage. */
    maxConcurrentSteps?: number;

    /** Whether the first failure aborts the run. */
    haltOnFailure: boolean;

    /** Default per-step timeout in milliseconds. Zero means "no timeout". */
    stepTimeout: number;

    /** How many times to retry a failing step. */
    retries: number;

    /** Delay between retry attempts, in milliseconds. */
    retryDelay: number;
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Normalises the pipeline execution settings.
 *
 * Historically the same knobs could be written in three places: at the top of
 * `options`, under `options.performance`, and under `options.pipeline`. Only
 * some combinations were ever read, which made the others look supported while
 * doing nothing. This resolves all three into one shape with a documented
 * precedence: the most specific location wins, newest block first.
 *
 * Precedence, highest to lowest:
 * 1. `options.performance.*` — the current location for concurrency settings
 * 2. `options.pipeline.*` — the original block, still honoured
 * 3. `options.*` — legacy top-level keys
 *
 * @param options - The merged `options` block from the configuration.
 * @returns Fully resolved settings with defaults applied.
 */
export function resolvePipelineOptions(
    options?: OptionsInterface,
): ResolvedPipelineOptions {
    const performance = options?.performance;
    const pipeline = options?.pipeline;

    const maxConcurrentStages =
        performance?.maxConcurrentStages ??
        pipeline?.maxConcurrentStages ??
        options?.maxConcurrentStages ??
        0;

    const haltOnFailure =
        options?.haltOnFailure ?? pipeline?.haltOnFailure ?? true;

    return {
        maxConcurrentStages,
        maxConcurrentSteps: performance?.maxConcurrentSteps,
        haltOnFailure,
        stepTimeout: pipeline?.stepTimeout ?? 0,
        retries: pipeline?.retryStrategy?.retries ?? 0,
        retryDelay: pipeline?.retryStrategy?.delay ?? 0,
    };
}
