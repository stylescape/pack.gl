# AGENTS.md — kist (core)

`kist` is a lightweight, plugin-based package pipeline processor: it reads a
`kist.yml`, resolves it into stages → steps → actions, and runs them with
caching, parallelism and optional live reload. This repo is the core engine,
the CLI, the built-in actions, and the JSON Schema for `kist.yml`.

It is **self-hosting**: after a `tsc` bootstrap, kist builds itself with its own
pipeline (`kist.yml`).

## Layout

| Path                                  | What lives there                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/ts/core/pipeline/`               | `Pipeline`, `Stage`, `Step`, `Action`, `ActionRegistry`, `PipelineManager` — the execution engine |
| `src/ts/core/cache/`                  | `BuildCache`, `StepCache`, `FileCache`, `globExpand` — content-hash cache-skip and log replay     |
| `src/ts/core/config/`                 | `ConfigLoader`, `ConfigStore`, `resolveOptions`, defaults                                         |
| `src/ts/core/validation/`             | Schema + per-level validators (config, stage, step, options, action)                              |
| `src/ts/core/plugin/PluginManager.ts` | Resolves and loads `@getkist/action-*` packages                                                   |
| `src/ts/actions/`                     | Built-in actions (copy, clean, create, rename, run-script, tsc, docs, version, package manager)   |
| `src/ts/cli/`                         | `Program` (commander), `InitCommand`, `Planner` (`--dry-run`)                                     |
| `src/ts/config/kistSchema.ts`         | Source of truth for the JSON Schema; `schema/` is emitted from it                                 |
| `bin/`                                | Repo scripts — see `bin/SCRIPTS.md`                                                               |
| `tst/`                                | Jest tests, plus `tst/stubs/` and `tst/helpers/`                                                  |
| `docs/api/`                           | **Generated** by TypeDoc. Never hand-edit; it is synced into `www-getkist-com`.                   |

## Commands

```bash
npm run build          # clean → tsc bootstrap → kist builds itself
npm run build:check    # tsc --noEmit
npm test               # bin/run-tests.js → jest
npm run test:coverage
npm run lint           # eslint src/**/*.ts (--max-warnings=50)
npm run format         # prettier --write .
npm run schema:emit    # regenerate schema/ from src/ts/config/kistSchema.ts
npm run docs           # typedoc → docs/api
npm run deps:check
npm run validate:package
```

`npm run build` runs the bootstrap compile *and then runs the freshly built
CLI against `kist.yml`. A change that breaks the CLI breaks the build of the
next change — if `build:self` fails, run `npm run build:bootstrap` and debug
`node dist/js/cli.js --config kist.yml` directly.

CLI surface (`src/ts/cli/Program.ts`): `run` (default, `--dry-run`), `init`,
`validate`, `schema`, `clear-cache`; global `--config`, `--log-level`,
`--verbose`, `--live`, `--no-cache`.

## Conventions

- **ESM only.** `"type": "module"`. Relative imports carry an explicit `.js`
  extension even in `.ts` source; Jest maps them back via `moduleNameMapper`.
- **Coverage is enforced at 100%** (branches/functions/lines/statements) in
  `jest.config.cjs`. New code needs tests or `npm test` fails.
- **Action layout:** one directory per action under `src/ts/actions/<Name>/`
  with `<Name>.ts` + `index.ts` re-export, registered in
  `src/ts/actions/CoreActions.ts`.
- Prettier: 4 spaces, double quotes, semicolons, `printWidth: 79`,
  `trailingComma: "all"`. Run `npm run format` rather than matching by hand.
- Section banner comments (`// ===== Import =====`, `// ===== Export =====`)
  are the house style throughout `src/` and `bin/`; keep them.
- Conventional commits, enforced by commitlint + husky.

## Gotchas

- `chokidar` v5 is ESM-only and cannot be `require`d by the CommonJS test
  runtime — tests use `tst/stubs/chokidar.ts` via `moduleNameMapper`.
- Editing the schema means editing `src/ts/config/kistSchema.ts` and running
  `npm run schema:emit`; `schema/kist.schema.json` is generated. The same
  schema is consumed by `kist-vscode` (`npm run sync:schema` there) and
  published to getkist.com — a breaking change ripples.
- `dist/`, `docs/api/`, `coverage/` and `.kist-cache/` are build output.
- Bumping the public API means re-running `npm run docs` here _and_
  `npm run sync:api` in `www-getkist-com`, which commits the generated pages.

## Related repos (siblings in this workspace)

`kist-action-*` (plugins, peer-depend on `kist`), `kist-create` (scaffolder),
`kist-vscode` (editor support, consumes `schema/`), `www-getkist-com` (docs),
`kist-plan` (improvement plan / research).
