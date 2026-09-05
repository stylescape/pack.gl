// ============================================================================
// Import
// ============================================================================

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import prettier from "prettier";
import { fileURLToPath, pathToFileURL } from "url";

// ============================================================================
// Constants
// ============================================================================

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(rootDir, "schema/kist.schema.json");

// ============================================================================
// Main
// ============================================================================

/**
 * Writes `schema/kist.schema.json` from the compiled schema module, which is
 * the source of truth. Requires a build first. `tst/config.schema.test.ts`
 * fails when the two drift apart, so run this after editing the schema.
 */
// Imported as a file URL: a bare absolute path works on POSIX but is
// rejected on Windows, where "C:\..." reads as an unsupported URL scheme.
const { KIST_SCHEMA } = await import(
    pathToFileURL(join(rootDir, "dist/js/config/kistSchema.js")).href
);

// Formatted the way the repository formats it. Writing raw `JSON.stringify`
// output produced a file Prettier immediately disagreed with, so running the
// documented workflow left the schema dirty and the next `npm run format`
// reverted it — the emit step could never be a no-op.
const formatted = await prettier.format(JSON.stringify(KIST_SCHEMA, null, 4), {
    ...(await prettier.resolveConfig(target)),
    filepath: target,
});

writeFileSync(target, formatted, "utf-8");
console.log(`✓ Wrote ${target}`);
