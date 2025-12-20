## npm Scripts Reference

This document provides a comprehensive guide to all available npm scripts in the kist project.

## Development Scripts

### `npm run dev`

Builds the project and runs the CLI in development mode.

### `npm run build`

Builds the entire project (compilation + processing).

### `npm run build:compile`

Compiles TypeScript to JavaScript.

### `npm run build:process`

Runs the build processing step.

### `npm run build:check`

Type-checks the code without emitting files.

## Testing Scripts

### `npm test`

Runs the test suite.

### `npm run test:cli`

Tests the CLI directly.

### `npm run test:coverage`

Runs tests with coverage report.

### `npm run test:watch`

Runs tests in watch mode for development.

## Code Quality Scripts

### `npm run lint`

Lints TypeScript files (allows up to 50 warnings).

### `npm run lint:fix`

Lints and automatically fixes issues.

### `npm run format`

Formats all files using Prettier.

## Maintenance Scripts

### `npm run clean`

Removes build artifacts (dist, build, tmp).

### `npm run clean:deep`

Deep clean including node_modules cache and coverage.

### `npm run deps:check`

Checks for outdated dependencies.

### `npm run deps:update`

Updates dependencies to latest compatible versions.

### `npm run validate:package`

Validates package.json structure and fields.

## Version Management Scripts

### `npm run version:bump`

Interactive version bump (prompts for major/minor/patch).

### `npm run version:major`

Bumps major version (e.g., 1.0.0 -> 2.0.0).

### `npm run version:minor`

Bumps minor version (e.g., 0.1.0 -> 0.2.0).

### `npm run version:patch`

Bumps patch version (e.g., 0.1.1 -> 0.1.2).

## Lifecycle Scripts

### `npm run prepare`

Runs automatically after `npm install`. Builds the project.

### `npm run prepublishOnly`

Runs before publishing to npm. Validates code, builds, and tests.

### `npm run prebuild`

Runs automatically before build. Cleans directories.

## Common Workflows

### Starting Development

```bash
npm install
npm run dev
```

### Before Committing

```bash
npm run lint:fix
npm run format
npm test
```

### Preparing a Release

```bash
npm run version:patch  # or minor/major
# Edit CHANGELOG.md
npm run validate:package
npm test
git add -A
git commit -m "chore: release v0.1.47"
git tag v0.1.47
git push && git push --tags
```

### Dependency Maintenance

```bash
npm run deps:check
npm run deps:update
npm test  # Verify everything still works
```

### Deep Clean and Reinstall

```bash
npm run clean:deep
rm -rf node_modules package-lock.json
npm install
```
