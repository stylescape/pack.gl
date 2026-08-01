# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
