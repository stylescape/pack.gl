// ============================================================================
// Import
// ============================================================================

import fs from "fs";
import path from "path";
import micromatch from "micromatch";

// ============================================================================
// Constants
// ============================================================================

/**
 * Directories never descended into while expanding patterns. Walking these
 * would dominate the cost of hashing a step's inputs and never contributes
 * files a pipeline declares as its own.
 */
const ALWAYS_IGNORED = new Set([".git", "node_modules", ".kist-cache"]);

/**
 * Characters that make a pattern a glob rather than a plain path.
 */
const MAGIC = /[*?[\]{}!]/;

// ============================================================================
// Functions
// ============================================================================

/**
 * Whether a pattern contains glob magic, and so has to be matched rather than
 * resolved as a plain path.
 *
 * @param pattern - A path or glob pattern.
 * @returns True when the pattern is a glob.
 */
export function isGlob(pattern: string): boolean {
    return MAGIC.test(pattern);
}

/**
 * Returns the leading directory of a pattern that contains no glob magic, so
 * a walk can start there instead of at the project root.
 *
 * Every segment before the first one containing magic is a literal directory
 * name — the magic segment is where the pattern stops naming an exact path —
 * so the whole run is kept. Dropping its last segment would have been correct
 * only for a magic-free pattern, where the last segment can be the file name,
 * and those never reach here.
 *
 * @param pattern - A glob pattern with forward slashes.
 * @returns The static directory prefix (possibly an empty string).
 */
export function globBase(pattern: string): string {
    const segments = pattern.split("/");
    const staticSegments: string[] = [];
    for (const segment of segments) {
        if (MAGIC.test(segment)) break;
        staticSegments.push(segment);
    }
    return staticSegments.join("/");
}

/**
 * Recursively collects every file beneath `dir`.
 *
 * @param dir - Absolute directory to walk.
 * @param found - Accumulator for discovered absolute file paths.
 */
function walk(dir: string, found: string[]): void {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        // Unreadable or missing directories contribute nothing.
        return;
    }

    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (ALWAYS_IGNORED.has(entry.name)) continue;
            walk(full, found);
        } else if (entry.isFile()) {
            found.push(full);
        }
    }
}

/**
 * Expands a list of path or glob patterns into a sorted, de-duplicated list of
 * absolute file paths.
 *
 * Patterns without glob magic are resolved directly: a file contributes
 * itself, a directory contributes everything beneath it. Patterns with magic
 * are matched against a walk rooted at their static prefix.
 *
 * The result is sorted so that a hash computed over it is stable regardless of
 * filesystem enumeration order.
 *
 * @param patterns - Path or glob patterns, relative to `cwd` unless absolute.
 * @param cwd - Directory the patterns are resolved against.
 * @returns Sorted absolute paths of every matching file.
 */
export function expandPatterns(
    patterns: string[],
    cwd: string = process.cwd(),
): string[] {
    const found = new Set<string>();

    for (const pattern of patterns) {
        const normalized = pattern.split(path.sep).join("/");

        if (!MAGIC.test(normalized)) {
            const absolute = path.resolve(cwd, normalized);
            let stat: fs.Stats;
            try {
                stat = fs.statSync(absolute);
            } catch {
                // A declared input that does not exist yet simply contributes
                // nothing; the step still runs and records its result.
                continue;
            }
            if (stat.isDirectory()) {
                const nested: string[] = [];
                walk(absolute, nested);
                nested.forEach((file) => found.add(file));
            } else {
                found.add(absolute);
            }
            continue;
        }

        const root = path.resolve(cwd, globBase(normalized));
        const candidates: string[] = [];
        walk(root, candidates);

        const absolutePattern = path.isAbsolute(normalized)
            ? normalized
            : `${cwd.split(path.sep).join("/")}/${normalized}`;

        for (const candidate of candidates) {
            const posixCandidate = candidate.split(path.sep).join("/");
            if (micromatch.isMatch(posixCandidate, absolutePattern)) {
                found.add(candidate);
            }
        }
    }

    return Array.from(found).sort();
}
