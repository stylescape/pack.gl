# Developer Guide

Welcome to the kist development guide! This document will help you get started with developing and contributing to kist.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Building](#building)
8. [Best Practices](#best-practices)

## Prerequisites

- **Node.js**: >= 18.0.0 (use `.nvmrc` for exact version)
- **npm**: >= 9.0.0
- **Git**: For version control

### Recommended Tools

- **VSCode**: With recommended extensions (see `.vscode/extensions.json`)
- **nvm**: For Node.js version management

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/getkist/kist.git
cd kist
```

### 2. Use Correct Node Version

```bash
nvm use
# or
nvm install
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Project

```bash
npm run build
```

### 5. Run Tests

```bash
npm test
```

## Project Structure

```
kist/
├── .github/          # GitHub Actions workflows and configs
├── .husky/           # Git hooks
├── .vscode/          # VSCode settings and configs
├── bin/              # Compiled output
│   ├── js/           # JavaScript output
│   └── ts/           # TypeScript build config
├── doc/              # Documentation
├── scripts/          # Utility scripts
├── src/              # Source code
│   ├── html/         # HTML templates
│   ├── tests/        # Test files
│   └── ts/           # TypeScript source
│       ├── actions/  # Action implementations
│       ├── cli/      # CLI implementation
│       ├── core/     # Core functionality
│       ├── interface/# TypeScript interfaces
│       ├── live/     # Live reload server
│       ├── logger/   # Logging utilities
│       └── types/    # Type definitions
├── dist/             # Distribution files
└── tmp/              # Temporary files
```

## Development Workflow

### Day-to-Day Development

1. **Start Development**

    ```bash
    npm run dev
    ```

2. **Make Changes**
    - Edit files in `src/ts/`
    - Linter runs automatically on save (if using VSCode)

3. **Test Your Changes**

    ```bash
    npm test
    npm run test:watch  # For watch mode
    ```

4. **Format and Lint**
    ```bash
    npm run lint:fix
    npm run format
    ```

### Adding New Features

1. Create a new branch:

    ```bash
    git checkout -b feature/my-feature
    ```

2. Implement your feature in `src/ts/`

3. Add tests in `src/tests/`

4. Update documentation if needed

5. Commit with conventional commits:
    ```bash
    git commit -m "feat: add new feature"
    ```

### Creating New Actions

Actions are the building blocks of kist pipelines.

1. Create a new file in `src/ts/actions/YourAction/`
2. Extend the `Action` base class
3. Implement required methods:
    - `execute()`
    - `validateOptions()` (optional)

Example:

```typescript
import { Action } from "../../core/pipeline/Action";
import { ActionOptionsType } from "../../types/ActionOptionsType";

export class MyAction extends Action {
    async execute(options: ActionOptionsType): Promise<void> {
        this.logInfo("Executing MyAction");
        // Your implementation
    }
}
```

4. Register in `src/ts/actions/CoreActions.ts`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test
npx jest path/to/test.test.ts
```

### Writing Tests

Create test files with `.test.ts` suffix in `src/tests/`:

```typescript
import { describe, it, expect } from "@jest/globals";

describe("MyFeature", () => {
    it("should do something", () => {
        expect(true).toBe(true);
    });
});
```

## Debugging

### VSCode Debugging

1. Open the Debug panel (Ctrl+Shift+D)
2. Select a debug configuration
3. Set breakpoints
4. Press F5

See [.vscode/DEBUG.md](.vscode/DEBUG.md) for detailed instructions.

### Console Logging

Use the built-in logger instead of console.log:

```typescript
this.logInfo("Information message");
this.logWarn("Warning message");
this.logError("Error message", error);
this.logDebug("Debug message");
```

## Building

### Development Build

```bash
npm run build
```

This runs:

1. `prebuild` - Cleans directories
2. `build:compile` - Compiles TypeScript
3. `build:process` - Processes built files

### Type Checking Only

```bash
npm run build:check
```

### Clean Build

```bash
npm run clean
npm run build
```

### Deep Clean

```bash
npm run clean:deep
npm install
npm run build
```

## Best Practices

### Code Style

- Follow TypeScript best practices
- Use `const` for immutable values
- Prefer `async/await` over promises
- Use meaningful variable names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### TypeScript

- Enable strict mode (already configured)
- Avoid `any` type when possible
- Use interfaces for complex types
- Leverage type inference

### Git

- Write clear commit messages
- Use conventional commits format
- Keep commits atomic and focused
- Reference issues in commits when applicable

### Documentation

- Update README.md for user-facing changes
- Add JSDoc for new public APIs
- Update CHANGELOG.md for releases
- Document complex logic with inline comments

## Utility Scripts

See [SCRIPTS.md](SCRIPTS.md) for complete reference.

Quick reference:

- `npm run validate:package` - Validate package.json
- `npm run deps:check` - Check outdated deps
- `npm run version:patch` - Bump patch version

## Common Issues

### Build Failures

1. **TypeScript errors**:

    ```bash
    npm run build:check
    ```

2. **Linting errors**:

    ```bash
    npm run lint:fix
    ```

3. **Stale build artifacts**:
    ```bash
    npm run clean
    npm run build
    ```

### Test Failures

1. **Update snapshots** (if using):

    ```bash
    npm test -- -u
    ```

2. **Clear Jest cache**:
    ```bash
    npx jest --clearCache
    ```

### Dependency Issues

1. **Check for outdated deps**:

    ```bash
    npm run deps:check
    ```

2. **Reinstall dependencies**:
    ```bash
    npm run clean:deep
    npm install
    ```

## Getting Help

- Check existing [documentation](./doc/)
- Search [issues](https://github.com/getkist/kist/issues)
- Ask in [discussions](https://github.com/getkist/kist/discussions)
- Read [SCRIPTS.md](SCRIPTS.md) for available commands

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

Happy coding! 🚀
