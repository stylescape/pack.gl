# Plugin Migration Guide

This guide helps you migrate from kist's monolithic action system to the new lightweight plugin architecture.

## Overview

kist is transitioning to a plugin-based architecture to:
- Reduce core package size and installation time
- Allow users to install only the actions they need
- Enable easier community contributions
- Follow webpack's successful plugin model
- Improve maintainability and testing

## What's Changing

### Core Actions (Remain in kist)
These lightweight, essential actions stay in the main package:
- ✅ `DirectoryCleanAction`
- ✅ `DirectoryCopyAction`
- ✅ `DirectoryCreateAction`
- ✅ `FileCopyAction`
- ✅ `FileRenameAction`
- ✅ `TemplateRenderAction`
- ✅ `VersionWriteAction`

### Plugin Actions (Moving to Separate Packages)
These actions are moving to dedicated plugin packages:

| Current Action | New Plugin Package | Install Command |
|----------------|-------------------|-----------------|
| `StyleProcessingAction` | `@kist/action-sass` | `npm install -D @kist/action-sass` |
| `TypeScriptCompilerAction` | `@kist/action-typescript` | `npm install -D @kist/action-typescript` |
| `JavaScriptMinifyAction` | `@kist/action-terser` | `npm install -D @kist/action-terser` |
| `SvgPackagerAction` | `@kist/action-svg` | `npm install -D @kist/action-svg` |
| `SvgReaderAction` | `@kist/action-svg` | `npm install -D @kist/action-svg` |
| `SvgSpriteAction` | `@kist/action-svg` | `npm install -D @kist/action-svg` |
| `SvgToPngAction` | `@kist/action-svg` | `npm install -D @kist/action-svg` |
| `LintAction` | `@kist/action-lint` | `npm install -D @kist/action-lint` |
| `DocumentationAction` | `@kist/action-docs` | `npm install -D @kist/action-docs` |
| `PackageManagerAction` | `@kist/action-package-manager` | `npm install -D @kist/action-package-manager` |
| `RunScriptAction` | `@kist/action-scripts` | `npm install -D @kist/action-scripts` |

## Migration Timeline

### Phase 1: Plugin System (Current)
- ✅ Plugin infrastructure added
- ✅ PluginManager created
- ✅ ActionRegistry supports plugins
- ✅ Automatic plugin discovery
- ⏳ All actions still in core (backwards compatible)

### Phase 2: Plugin Packages (Next Release)
- Create separate plugin repositories
- Publish initial plugin packages
- Add deprecation warnings for plugin actions in core
- Update documentation

### Phase 3: Core Cleanup (Major Version)
- Remove plugin actions from core package
- Require explicit plugin installation
- Reduce core package size significantly

## How to Migrate

### Step 1: Check Your Configuration

Review your `kist.yml` file to identify which actions you use:

```yaml
pipeline:
  stages:
    - name: build
      steps:
        - name: compile-ts
          action: TypeScriptCompilerAction  # Plugin action
          options:
            input: ./src
            output: ./dist
        
        - name: process-sass
          action: StyleProcessingAction     # Plugin action
          options:
            input: ./styles
            output: ./dist/css
        
        - name: copy-assets
          action: DirectoryCopyAction       # Core action (no change)
          options:
            source: ./assets
            destination: ./dist/assets
```

### Step 2: Install Required Plugins

Based on your configuration, install the necessary plugins:

```bash
# For TypeScript compilation
npm install --save-dev @kist/action-typescript

# For Sass/SCSS processing
npm install --save-dev @kist/action-sass

# For SVG operations
npm install --save-dev @kist/action-svg

# For JavaScript minification
npm install --save-dev @kist/action-terser

# For linting
npm install --save-dev @kist/action-lint
```

### Step 3: No Configuration Changes Needed!

Your `kist.yml` configuration remains the same. kist automatically discovers and loads installed plugins:

```yaml
# This works automatically after installing plugins
pipeline:
  stages:
    - name: build
      steps:
        - name: compile-ts
          action: TypeScriptCompilerAction
          options:
            input: ./src
            output: ./dist
```

### Step 4: Verify Plugin Loading

Run kist with verbose logging to see plugin discovery:

```bash
kist --verbose
```

You should see output like:
```
[INFO] Initializing plugin system...
[INFO] Loaded 3 plugin(s):
[INFO]   - @kist/action-typescript v1.0.0 (1 actions)
[INFO]   - @kist/action-sass v1.0.0 (1 actions)
[INFO]   - @kist/action-svg v1.0.0 (4 actions)
```

## Automated Migration Tool

Use the built-in migration helper to identify required plugins:

```bash
npx kist migrate
```

This command will:
1. Analyze your `kist.yml` configuration
2. Identify which plugin actions you use
3. Generate install commands for required plugins
4. Update your `package.json` dependencies

Example output:
```bash
Analyzing kist configuration...

Found 3 plugin actions in use:
  - TypeScriptCompilerAction (used in 1 step)
  - StyleProcessingAction (used in 2 steps)
  - SvgPackagerAction (used in 1 step)

Required plugins:
  @kist/action-typescript
  @kist/action-sass
  @kist/action-svg

Run the following command to install:

  npm install --save-dev @kist/action-typescript @kist/action-sass @kist/action-svg

Or automatically install with:

  npx kist migrate --install
```

## Common Migration Scenarios

### Scenario 1: Full-Stack Project

**Before** (all actions in core):
```json
{
  "devDependencies": {
    "kist": "^0.1.45"
  }
}
```

**After** (with plugins):
```json
{
  "devDependencies": {
    "kist": "^0.2.0",
    "@kist/action-typescript": "^1.0.0",
    "@kist/action-sass": "^1.0.0",
    "@kist/action-terser": "^1.0.0"
  }
}
```

### Scenario 2: Simple Static Site

**Before**:
```json
{
  "devDependencies": {
    "kist": "^0.1.45"
  }
}
```

**After** (no plugins needed):
```json
{
  "devDependencies": {
    "kist": "^0.2.0"
  }
}
```

If you only use core actions (file operations, templates), no plugins are needed!

### Scenario 3: SVG-Heavy Project

**Before**:
```json
{
  "devDependencies": {
    "kist": "^0.1.45"
  }
}
```

**After**:
```json
{
  "devDependencies": {
    "kist": "^0.2.0",
    "@kist/action-svg": "^1.0.0"
  }
}
```

## Breaking Changes (Future Major Version)

### v0.2.x → v1.0.0

When kist v1.0.0 is released, plugin actions will be removed from core:

**What breaks:**
```yaml
# This will fail without installing the plugin
steps:
  - name: compile
    action: TypeScriptCompilerAction  # Error: Unknown action
```

**How to fix:**
```bash
# Install the required plugin
npm install --save-dev @kist/action-typescript

# Configuration stays the same
```

## Benefits After Migration

### 1. Faster Installation
```bash
# Before: ~200MB (all dependencies)
npm install kist

# After: ~20MB (core only)
npm install kist @kist/action-sass
```

### 2. Smaller Bundle Size
Only install what you need:
- Core only: ~5MB
- Core + TypeScript: ~15MB
- Core + Full plugins: ~50MB

### 3. Independent Versioning
Plugins can be updated independently:
```json
{
  "kist": "^1.0.0",
  "@kist/action-typescript": "^2.0.0",  // Updated separately
  "@kist/action-sass": "^1.5.0"
}
```

### 4. Community Plugins
Easily install and use community plugins:
```bash
npm install --save-dev kist-plugin-markdown
npm install --save-dev @mycompany/kist-plugin-custom
```

## Troubleshooting

### Plugin Not Found

**Error:**
```
[ERROR] Unknown action "TypeScriptCompilerAction" for step "compile".
```

**Solution:**
```bash
npm install --save-dev @kist/action-typescript
```

### Action Name Changed

Check the plugin documentation for any renamed actions:
```yaml
# Old (deprecated)
action: TypeScriptCompilerAction

# New (if renamed)
action: TypeScriptCompiler
```

### Multiple Versions Conflict

Ensure compatible versions:
```bash
npm list kist @kist/action-*
```

If conflicts exist:
```bash
npm install --save-dev kist@latest @kist/action-typescript@latest
```

### Plugin Not Loading

Check plugin discovery:
```bash
kist --verbose
```

Ensure plugin naming follows conventions:
- ✅ `@kist/action-typescript`
- ✅ `kist-plugin-custom`
- ❌ `typescript-plugin` (won't auto-discover)

## Rollback Plan

If you encounter issues, you can temporarily stay on v0.1.x:

```json
{
  "devDependencies": {
    "kist": "^0.1.45"
  }
}
```

All actions will remain available in v0.1.x releases.

## Support & Questions

- **Migration Issues**: Open an issue at https://github.com/getkist/kist/issues
- **Plugin Development**: See [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)
- **Discussions**: https://github.com/getkist/kist/discussions

## Summary

1. ✅ Plugin system is live (backwards compatible)
2. ✅ All actions still work in current version
3. ⏳ Install plugins for future compatibility
4. ⏳ Test your setup with `kist --verbose`
5. ⏳ Report any issues before major version

The migration is designed to be smooth and non-breaking for existing users while providing significant benefits for new projects.
