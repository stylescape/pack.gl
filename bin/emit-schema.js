// ============================================================================
// Import
// ============================================================================

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

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
const { KIST_SCHEMA } = await import(
    join(rootDir, "dist/js/config/kistSchema.js")
);

writeFileSync(target, `${JSON.stringify(KIST_SCHEMA, null, 4)}\n`, "utf-8");
console.log(`✓ Wrote ${target}`);
