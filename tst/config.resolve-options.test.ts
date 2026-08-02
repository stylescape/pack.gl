// ============================================================================
// Option Resolution Tests
// ============================================================================

import { resolvePipelineOptions } from "../src/ts/core/config/resolveOptions";

describe("resolvePipelineOptions", () => {
    it("should apply defaults when nothing is configured", () => {
        expect(resolvePipelineOptions()).toEqual({
            maxConcurrentStages: 0,
            maxConcurrentSteps: undefined,
            haltOnFailure: true,
            stepTimeout: 0,
            retries: 0,
            retryDelay: 0,
        });
    });

    it("should apply defaults for an empty options block", () => {
        expect(resolvePipelineOptions({}).haltOnFailure).toBe(true);
    });

    // ------------------------------------------------------------------------
    // Precedence
    // ------------------------------------------------------------------------

    describe("maxConcurrentStages precedence", () => {
        it("should prefer performance over pipeline and the legacy key", () => {
            expect(
                resolvePipelineOptions({
                    performance: { maxConcurrentStages: 1 },
                    pipeline: { maxConcurrentStages: 2 },
                    maxConcurrentStages: 3,
                }).maxConcurrentStages,
            ).toBe(1);
        });

        it("should fall back to the pipeline block", () => {
            expect(
                resolvePipelineOptions({
                    pipeline: { maxConcurrentStages: 2 },
                    maxConcurrentStages: 3,
                }).maxConcurrentStages,
            ).toBe(2);
        });

        it("should fall back to the legacy top-level key", () => {
            expect(
                resolvePipelineOptions({ maxConcurrentStages: 3 })
                    .maxConcurrentStages,
            ).toBe(3);
        });

        it("should keep an explicit zero rather than treating it as unset", () => {
            expect(
                resolvePipelineOptions({
                    performance: { maxConcurrentStages: 0 },
                    pipeline: { maxConcurrentStages: 5 },
                }).maxConcurrentStages,
            ).toBe(0);
        });
    });

    describe("haltOnFailure precedence", () => {
        it("should prefer the top-level key", () => {
            expect(
                resolvePipelineOptions({
                    haltOnFailure: false,
                    pipeline: { haltOnFailure: true },
                }).haltOnFailure,
            ).toBe(false);
        });

        it("should fall back to the pipeline block", () => {
            expect(
                resolvePipelineOptions({ pipeline: { haltOnFailure: false } })
                    .haltOnFailure,
            ).toBe(false);
        });
    });

    // ------------------------------------------------------------------------
    // Pass-through values
    // ------------------------------------------------------------------------

    it("should read the step timeout from the pipeline block", () => {
        expect(
            resolvePipelineOptions({ pipeline: { stepTimeout: 5000 } })
                .stepTimeout,
        ).toBe(5000);
    });

    it("should read the retry strategy from the pipeline block", () => {
        const resolved = resolvePipelineOptions({
            pipeline: { retryStrategy: { retries: 2, delay: 250 } },
        });

        expect(resolved.retries).toBe(2);
        expect(resolved.retryDelay).toBe(250);
    });

    it("should read the step concurrency cap from the performance block", () => {
        expect(
            resolvePipelineOptions({ performance: { maxConcurrentSteps: 4 } })
                .maxConcurrentSteps,
        ).toBe(4);
    });
});
