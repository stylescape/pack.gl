# Plugin Development Guide

kist can be extended with action plugins — npm packages that register one or
more actions for use in `kist.yml` pipelines. This guide covers everything
needed to write, test, and publish a plugin.

## How discovery works

On startup, kist scans the consuming project's `node_modules` for packages
whose names match one of the default prefixes:

- `@getkist/action-*` — official plugins
- `kist-action-*` — unscoped community plugins
- `kist-plugin-*` — unscoped community plugins (legacy prefix)

Each matching package is imported via its `module`, `main`, or
`exports["."]` entry point (falling back to `dist/index.js`). The default
export must implement the `ActionPlugin` interface; its `registerActions()`
return value is folded into kist's `ActionRegistry`, making the actions
available to pipeline steps by name.

Plugins can also be loaded from a local directory or registered
programmatically via `PluginManager.registerPlugin()`.

## The plugin contract

A plugin's default export implements `ActionPlugin`:

```typescript
import type { ActionPlugin } from "kist";
import { MyCustomAction } from "./actions/MyCustomAction/index.js";
import packageJson from "../package.json" with { type: "json" };

const plugin: ActionPlugin = {
    // Derive the version from package.json so it never drifts.
    version: packageJson.version,
    description: "My custom kist plugin",
    registerActions() {
        return {
            MyCustomAction,
        };
    },
};

export default plugin;
```

The keys returned by `registerActions()` are the action names users write in
`kist.yml`; the values are the action class constructors.

## Writing an action

Each action implements `ActionInterface` — most easily by extending the
`Action` base class exported from `kist`:

```typescript
import { Action } from "kist";

export class MyCustomAction extends Action {
    /**
     * Optional: reject bad options up front so the pipeline fails fast
     * with a clear message.
     */
    validateOptions(options: Record<string, unknown>): boolean {
        return typeof options.input === "string";
    }

    async execute(options: Record<string, unknown>): Promise<void> {
        this.logInfo(`Processing ${options.input}...`);
        // ... do the work ...
    }
}
```

Rules of thumb:

- **Throw on failure.** A thrown error fails the step, the stage, and (with
  the default `haltOnFailure: true`) the whole build with a non-zero exit
  code. Never swallow errors — a silently green build is worse than a red
  one.
- **Depend on `kist`** (as a `peerDependency`) instead of vendoring the
  `Action` base class or the interfaces. Vendored copies drift.
- **Log through the base class helpers** (`logInfo`, `logWarn`, `logError`)
  so output respects the user's configured log level.

## Using the plugin

Once the package is installed in a project, its actions can be referenced
directly in `kist.yml`:

```yaml
stages:
    - name: Build
      steps:
          - name: RunMyAction
            action: MyCustomAction
            options:
                input: "./src"
```

## Publishing checklist

- Name the package `@getkist/action-<name>`, `kist-action-<name>`, or
  `kist-plugin-<name>` so discovery finds it.
- Point `main`/`module`/`exports` at the compiled entry file whose default
  export is the plugin object.
- Derive `version` from `package.json` — do not hardcode it.
- Declare `kist` as a `peerDependency`.
- Add `kist` and `kist-plugin` keywords for discoverability.
