# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.79] - 2026-09-05

Covers the 0.1.78 bump as well, which was never released or tagged.

### Changed

- A failed pipeline now reports the failure to its caller instead of calling `process.exit` itself, so the CLI turns it into a non-zero exit status and live mode survives a failed build
- `haltOnFailure: false` now does what it says: the stages that do not depend on the failure still run, stages behind it are skipped, and the run fails at the end with the collected failures
- `RunScriptAction` and `DocumentationAction` no longer treat output on stderr as failure — the exit status is the signal — and both run on `process.execPath` rather than a PATH-resolved `node`, with a larger output buffer
- `DirectoryCleanAction` now fails the step when it cannot delete something, rather than logging and reporting success
- `DirectoryCopyAction` refuses to copy a directory onto itself or into its own subtree, which previously recursed until the filesystem refused the path
- `kist init` templates emit copy steps only for files the project actually has, so a freshly initialised project runs on the first try

### Fixed

- Live mode watched no files at all: chokidar dropped glob support in v4, so the default `src/**/*` patterns matched nothing. Patterns are now reduced to real directories and the events filtered back down
- The live-reload script was never injected: the middleware was registered after `express.static` and wrote to the response after it had already ended
- Each live rebuild spawned a child that inherited `--live`, tried to bind the same port and died; the WebSocket server had no error handler, so that killed the process
- Parallel steps recorded each other's log output into the step cache and replayed it on later runs; capture is now scoped per async execution context
- `BuildCache` archived outputs by base name, so two outputs sharing a name in different directories overwrote each other and restored the wrong contents
- A stage `timeout` never cleared its timer, holding the process open for the full budget after the stage had finished
- `TypeScriptCompilerAction` silently ignored `outputDir`, which was applied after the options object had already been assembled
- `VersionWriteAction` did not escape the key into its regex, anchored the replacement to end-of-line (defeated by a trailing comment or CRLF), could rewrite the wrong version on a line, and rejected prerelease versions; it now warns when nothing matched
- Configuration `extends` rejected a diamond — two parents sharing a grandparent — as circular inheritance
- Plugin discovery loaded the furthest copy of a scoped plugin rather than the nearest, could not resolve a package that declares only nested conditional `exports`, and imported by absolute path rather than file URL
- `clear-cache` ignored a configured `cacheDir` and always cleared the default
- `OptionsValidator` rejected `haltOnFailure`, `cache`, `performance` and `pipeline`, and let `live.port` be zero or a string
- `npm run deps:check` reported that everything was up to date whenever packages were outdated, because `npm outdated` exits non-zero precisely when it has something to report
- `npm run version:bump` wrote a version containing `NaN` for a non-semver VERSION file, and reported success when its replacements matched nothing
- `npm run clean:deep` left `.kist-cache` behind, and `npm run schema:emit` wrote a file Prettier immediately disagreed with
- The generated `dist/package.json` lacked `"type": "module"`, so consumers parsed the ESM output as CommonJS, and its `bin` path resolved to `dist/dist/js/cli.js`

## [0.1.77] - 2026-08-02

### Added

- Module-level overview JSDoc comments across the src/ts barrel/index files, documenting subsystem relationships (Pipeline -> Stage -> Step -> Action, the validator chain run on every `Kist.validateConfiguration`) and the two previously-undocumented top-level exports (`MIGRATED_ACTIONS`, `ErrorCodes`)

### Changed

- Bumped `actions/setup-node` from 6 to 7, `actions/deploy-pages` from 4 to 5, `actions/checkout` from 6 to 7, and `actions/stale` from 10 to 11 in CI workflows
- Bumped `@babel/preset-env` from 7.29.7 to 8.0.2

### Fixed

- Rewrote `.devcontainer/README.md`, `devcontainer.json`, and `docker-compose.yml`, which were leftover "Stylescape" boilerplate (Python/Jinja2/Svelte tooling, Node 18 base image) unrelated to this project
- Fixed `bin/SCRIPTS.md` documenting nonexistent `build:compile`/`build:process` scripts (actual scripts are `build:bootstrap`/`build:self`)
- Fixed a broken logo link in README.md (the `brand` repo has no `master` branch, only `main`/`dev`)
- Fixed a stale `TypeScriptCompilerAction` example option name (`tsConfigPath` -> `tsconfigPath`)

## [0.1.76] - 2026-08-01

### Added

- Comprehensive unit and e2e test suite covering actions, CLI, core pipeline/config/validation, plugin manager, live server/watcher, and logger
- Dedicated GitHub Actions test workflow
- PLUGIN_DEVELOPMENT.md documentation

### Changed

- Updated TypeScript `moduleResolution` from deprecated `node` to `bundler`
- Migrated docs deployment workflow from Python/MkDocs to Node/TypeDoc with GitHub Pages Actions
- Updated dependencies across the toolchain (ESLint, TypeScript-ESLint, TypeDoc, ts-jest, js-yaml v5, etc.)
- Rebranded contributor/license references from Scape Agency to Scape Press

### Fixed

- Pinned `.nvmrc` to Node 22.23.2 to match the `engines` requirement (previously stale at 18.20.0)

## [0.1.45] - 2025-12-18

### Added

- Initial CHANGELOG.md

### Changed

- Current release version

[Unreleased]: https://github.com/getkist/kist/compare/v0.1.76...HEAD
[0.1.76]: https://github.com/getkist/kist/compare/v0.1.45...v0.1.76
[0.1.45]: https://github.com/getkist/kist/releases/tag/v0.1.45
