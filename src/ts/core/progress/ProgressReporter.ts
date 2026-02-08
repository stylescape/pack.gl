// ============================================================================
// Import
// ============================================================================

import { AbstractProcess } from "../abstract/AbstractProcess";

// ============================================================================
// Types
// ============================================================================

/**
 * Options for creating a progress reporter.
 */
interface ProgressOptions {
    /** Total number of items to process */
    total: number;
    /** Label for the operation */
    label?: string;
    /** Whether to show percentage */
    showPercentage?: boolean;
    /** Whether to show ETA */
    showEta?: boolean;
    /** Update interval in milliseconds */
    updateInterval?: number;
    /** Custom format function */
    formatFn?: (progress: ProgressState) => string;
}

/**
 * Current state of progress.
 */
interface ProgressState {
    /** Number of items completed */
    completed: number;
    /** Total number of items */
    total: number;
    /** Percentage complete (0-100) */
    percentage: number;
    /** Elapsed time in milliseconds */
    elapsed: number;
    /** Estimated time remaining in milliseconds */
    eta: number | null;
    /** Items processed per second */
    rate: number;
    /** Operation label */
    label: string;
}

// ============================================================================
// Class
// ============================================================================

/**
 * ProgressReporter provides progress tracking and reporting for long-running
 * operations. It calculates completion percentage, elapsed time, ETA, and
 * processing rate.
 *
 * @example
 * ```typescript
 * const progress = new ProgressReporter({ total: 100, label: 'Processing files' });
 * progress.start();
 *
 * for (const file of files) {
 *   await processFile(file);
 *   progress.increment();
 * }
 *
 * progress.finish();
 * ```
 */
export class ProgressReporter extends AbstractProcess {
    // Parameters
    // ========================================================================

    private total: number;
    private completed: number = 0;
    private label: string;
    private showPercentage: boolean;
    private showEta: boolean;
    private updateInterval: number;
    private formatFn?: (progress: ProgressState) => string;

    private startTime: number = 0;
    private lastUpdateTime: number = 0;
    private lastReportedPercentage: number = -1;
    private isRunning: boolean = false;

    // Constructor
    // ========================================================================

    /**
     * Creates a new ProgressReporter.
     * @param options - Configuration options for the progress reporter
     */
    constructor(options: ProgressOptions) {
        super();
        this.total = options.total;
        this.label = options.label || "Processing";
        this.showPercentage = options.showPercentage ?? true;
        this.showEta = options.showEta ?? true;
        this.updateInterval = options.updateInterval ?? 100; // 100ms default
        this.formatFn = options.formatFn;
    }

    // Public Methods
    // ========================================================================

    /**
     * Starts the progress tracking.
     */
    public start(): void {
        this.startTime = performance.now();
        this.lastUpdateTime = this.startTime;
        this.completed = 0;
        this.isRunning = true;
        this.report();
    }

    /**
     * Increments the completed count by the specified amount.
     * @param amount - Amount to increment (default: 1)
     */
    public increment(amount: number = 1): void {
        this.completed = Math.min(this.completed + amount, this.total);
        this.maybeReport();
    }

    /**
     * Sets the completed count to a specific value.
     * @param value - The new completed value
     */
    public setCompleted(value: number): void {
        this.completed = Math.min(Math.max(0, value), this.total);
        this.maybeReport();
    }

    /**
     * Finishes the progress tracking and reports final status.
     */
    public finish(): void {
        this.completed = this.total;
        this.isRunning = false;
        this.report(true);
    }

    /**
     * Cancels the progress tracking.
     */
    public cancel(): void {
        this.isRunning = false;
        this.logWarn(`${this.label}: Cancelled at ${this.getPercentage().toFixed(1)}%`);
    }

    /**
     * Gets the current progress state.
     */
    public getState(): ProgressState {
        const elapsed = performance.now() - this.startTime;
        const rate = this.completed / (elapsed / 1000) || 0;
        const remaining = this.total - this.completed;
        const eta = rate > 0 ? (remaining / rate) * 1000 : null;

        return {
            completed: this.completed,
            total: this.total,
            percentage: this.getPercentage(),
            elapsed,
            eta,
            rate,
            label: this.label,
        };
    }

    /**
     * Gets the current percentage complete.
     */
    public getPercentage(): number {
        return this.total > 0 ? (this.completed / this.total) * 100 : 0;
    }

    /**
     * Gets the elapsed time in milliseconds.
     */
    public getElapsed(): number {
        return performance.now() - this.startTime;
    }

    // Private Methods
    // ========================================================================

    /**
     * Reports progress if enough time has passed since last report.
     */
    private maybeReport(): void {
        const now = performance.now();
        if (now - this.lastUpdateTime >= this.updateInterval) {
            this.report();
            this.lastUpdateTime = now;
        }
    }

    /**
     * Reports current progress to the log.
     * @param force - Force reporting even if percentage hasn't changed
     */
    private report(force: boolean = false): void {
        const percentage = Math.floor(this.getPercentage());

        // Only report if percentage has changed or forced
        if (!force && percentage === this.lastReportedPercentage) {
            return;
        }

        this.lastReportedPercentage = percentage;
        const state = this.getState();

        let message: string;
        if (this.formatFn) {
            message = this.formatFn(state);
        } else {
            message = this.formatProgress(state);
        }

        this.logInfo(message);
    }

    /**
     * Formats the progress state into a human-readable string.
     */
    private formatProgress(state: ProgressState): string {
        const parts: string[] = [state.label];

        parts.push(`${state.completed}/${state.total}`);

        if (this.showPercentage) {
            parts.push(`(${state.percentage.toFixed(1)}%)`);
        }

        if (this.showEta && state.eta !== null && state.completed < state.total) {
            parts.push(`ETA: ${this.formatDuration(state.eta)}`);
        }

        if (state.completed === state.total) {
            parts.push(`Done in ${this.formatDuration(state.elapsed)}`);
        }

        return parts.join(" ");
    }

    /**
     * Formats a duration in milliseconds to a human-readable string.
     */
    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${Math.round(ms)}ms`;
        }
        if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        }
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.round((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a simple progress reporter for file operations.
 * @param fileCount - Total number of files
 * @param label - Operation label
 */
export function createFileProgress(fileCount: number, label: string = "Processing files"): ProgressReporter {
    return new ProgressReporter({
        total: fileCount,
        label,
        showPercentage: true,
        showEta: true,
    });
}

/**
 * Creates a progress reporter for build operations.
 * @param stepCount - Total number of steps
 * @param label - Build label
 */
export function createBuildProgress(stepCount: number, label: string = "Building"): ProgressReporter {
    return new ProgressReporter({
        total: stepCount,
        label,
        showPercentage: true,
        showEta: true,
        updateInterval: 250,
    });
}
