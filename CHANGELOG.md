# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
