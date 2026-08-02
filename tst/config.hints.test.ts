// ============================================================================
// Action Hint Tests
// ============================================================================

import {
    describeUnknownAction,
    findSimilarAction,
} from "../src/ts/config/actionHints";
import { CORE_ACTIONS } from "../src/ts/config/actions.config";

describe("actionHints", () => {
    // ------------------------------------------------------------------------
    // findSimilarAction
    // ------------------------------------------------------------------------

    describe("findSimilarAction", () => {
        it("should match a name that differs by a single character", () => {
            expect(findSimilarAction("FileCopyActon", [...CORE_ACTIONS])).toBe(
                "FileCopyAction",
            );
        });

        it("should ignore case differences", () => {
            expect(
                findSimilarAction("filecopyaction", [...CORE_ACTIONS]),
            ).toBe("FileCopyAction");
        });

        it("should return the closest of several candidates", () => {
            expect(
                findSimilarAction("DirectoryClean", [
                    "DirectoryCleanAction",
                    "DirectoryCopyAction",
                ]),
            ).toBe("DirectoryCleanAction");
        });

        it("should keep the first of two equally close candidates", () => {
            // Both differ from the query by one character; the earlier entry
            // wins so the suggestion is stable across runs.
            expect(findSimilarAction("Aaa", ["Aab", "Aac"])).toBe("Aab");
        });

        it("should return undefined when nothing is close", () => {
            expect(
                findSimilarAction("CompletelyUnrelated", [...CORE_ACTIONS]),
            ).toBeUndefined();
        });

        it("should return undefined when there are no candidates", () => {
            expect(findSimilarAction("Anything", [])).toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // describeUnknownAction
    // ------------------------------------------------------------------------

    describe("describeUnknownAction", () => {
        it("should name the plugin package for a migrated action", () => {
            const message = describeUnknownAction(
                "StyleProcessingAction",
                "s",
                [...CORE_ACTIONS],
            );

            expect(message).toContain("@getkist/action-sass");
            expect(message).toContain(
                "npm install --save-dev @getkist/action-sass",
            );
            expect(message).toContain(
                "https://github.com/getkist/kist-action-sass",
            );
        });

        it("should prefer the migration hint over a typo suggestion", () => {
            // "LintAction" is both migrated and close to nothing in core, but
            // the migration is the more useful answer either way.
            const message = describeUnknownAction("LintAction", "lint", [
                ...CORE_ACTIONS,
            ]);

            expect(message).toContain("@getkist/action-eslint");
            expect(message).not.toContain("Did you mean");
        });

        it("should suggest a close match for a typo", () => {
            const message = describeUnknownAction("FileCopyActon", "copy", [
                ...CORE_ACTIONS,
            ]);

            expect(message).toContain('Did you mean "FileCopyAction"?');
        });

        it("should list the available actions when nothing matches", () => {
            const message = describeUnknownAction("Nonsense", "step", [
                "FileCopyAction",
                "DirectoryCleanAction",
            ]);

            expect(message).toContain(
                "Available actions: DirectoryCleanAction, FileCopyAction",
            );
        });

        it("should say so when the registry is empty", () => {
            const message = describeUnknownAction("Anything", "step", []);

            expect(message).toContain("No actions are registered");
        });

        it("should always name the step and the action", () => {
            const message = describeUnknownAction("Whatever", "my-step", []);

            expect(message).toContain('Unknown action "Whatever"');
            expect(message).toContain('step "my-step"');
        });
    });
});
