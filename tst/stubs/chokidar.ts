// ============================================================================
// chokidar stub
// ============================================================================

import { EventEmitter } from "events";

/**
 * chokidar v5 ships as ESM only, which the CommonJS test runtime cannot
 * `require`. kist itself is ESM so this only affects tests; `jest.config.cjs`
 * maps the package to this stub.
 *
 * Suites that assert on watcher behaviour install their own `jest.mock`,
 * which takes precedence over this mapping. This stub exists so that merely
 * importing `LiveWatcher` (directly, or through the `live` barrel) does not
 * blow up.
 */
export class FSWatcher extends EventEmitter {
    public async close(): Promise<void> {}
}

export function watch(): FSWatcher {
    return new FSWatcher();
}

export default { watch };
