// ============================================================================
// Import
// ============================================================================

import { MIGRATED_PACKAGES } from "./actions.config.js";
import type { MigratedActionName } from "./actions.config.js";

// ============================================================================
// Functions
// ============================================================================

/**
 * Levenshtein distance between two strings, used to offer a "did you mean"
 * suggestion for a misspelled action name.
 *
 * @param a - First string.
 * @param b - Second string.
 * @returns The minimum number of single-character edits between `a` and `b`.
 */
function editDistance(a: string, b: string): number {
    // Previous row of the distance matrix; only one row is kept at a time.
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        for (let j = 1; j <= b.length; j++) {
            const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
            current[j] = Math.min(
                current[j - 1] + 1, // insertion
                previous[j] + 1, // deletion
                previous[j - 1] + substitutionCost, // substitution
            );
        }
        previous = current;
    }

    return previous[b.length];
}

/**
 * Finds the registered action whose name is closest to `name`, provided it is
 * near enough to plausibly be a typo.
 *
 * @param name - The unresolved action name.
 * @param registered - Names currently present in the action registry.
 * @returns The closest name, or undefined when nothing is close enough.
 */
export function findSimilarAction(
    name: string,
    registered: string[],
): string | undefined {
    // Dropping the "Action" suffix is the single most common way to get the
    // name wrong, and edit distance alone would not catch it: the suffix is
    // six characters, further than any sensible threshold allows.
    const suffixed = registered.find(
        (candidate) =>
            candidate.toLowerCase() === `${name}action`.toLowerCase(),
    );
    if (suffixed) {
        return suffixed;
    }

    // Otherwise allow roughly a third of the name to differ before treating
    // the two as unrelated, so "FileCopyActon" matches but "Nonsense" does not.
    const threshold = Math.max(2, Math.floor(name.length / 3));

    let best: { name: string; distance: number } | undefined;
    for (const candidate of registered) {
        const distance = editDistance(
            name.toLowerCase(),
            candidate.toLowerCase(),
        );
        if (distance <= threshold && (!best || distance < best.distance)) {
            best = { name: candidate, distance };
        }
    }

    return best?.name;
}

/**
 * Builds the diagnostic message for an action that could not be resolved.
 *
 * Three cases are distinguished, in order of usefulness to the reader:
 * 1. The action moved to a plugin package — name the package and the install
 *    command, since the configuration is otherwise correct.
 * 2. The name is close to a registered action — offer it as a suggestion.
 * 3. Neither — list what is available.
 *
 * @param actionName - The action name that failed to resolve.
 * @param stepName - The step the action was requested from.
 * @param registered - Names currently present in the action registry.
 * @returns A multi-line, human-readable error message.
 */
export function describeUnknownAction(
    actionName: string,
    stepName: string,
    registered: string[],
): string {
    const lines = [`Unknown action "${actionName}" for step "${stepName}".`];

    const migration = MIGRATED_PACKAGES[actionName as MigratedActionName];
    if (migration) {
        lines.push(
            `This action moved out of the kist core package into ${migration.package}.`,
            `Install it with: ${migration.npm}`,
            `Documentation: ${migration.github}`,
        );
        return lines.join("\n");
    }

    const suggestion = findSimilarAction(actionName, registered);
    if (suggestion) {
        lines.push(`Did you mean "${suggestion}"?`);
        return lines.join("\n");
    }

    lines.push(
        registered.length > 0
            ? `Available actions: ${[...registered].sort().join(", ")}`
            : "No actions are registered. Check that your plugins are installed.",
    );
    return lines.join("\n");
}
