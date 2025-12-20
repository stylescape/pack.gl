# Plugin Development Guide

This guide explains how to create plugins for kist to extend its functionality with custom actions.

## Overview

kist uses a plugin-based architecture similar to webpack, allowing developers to create and publish custom actions as separate npm packages. This keeps the core kist package lightweight while enabling rich extensibility.

## Plugin Architecture

### Core vs Plugin Actions

**Core Actions** (included in main kist package):
- `DirectoryCleanAction` - Clean directories
- `DirectoryCopyAction` - Copy directories
- `DirectoryCreateAction` - Create directories
- `FileCopyAction` - Copy files
- `FileRenameAction` - Rename files
- `TemplateRenderAction` - Render templates
- `VersionWriteAction` - Write version files

**Plugin Actions** (separate packages):
- `@kist/action-sass` - Sass/SCSS processing
- `@kist/action-typescript` - TypeScript compilation
- `@kist/action-terser` - JavaScript minification
- `@kist/action-svg` - SVG optimization and sprites
- `@kist/action-lint` - Code linting
- `@kist/action-docs` - Documentation generation
- `@kist/action-package-manager` - Package management
- `@kist/action-scripts` - Script execution

## Creating a Plugin

### 1. Project Setup

```bash
# Create a new npm package
mkdir kist-plugin-example
cd kist-plugin-example
npm init -y

# Install kist as a peer dependency
npm install --save-dev kist typescript @types/node

# Initialize TypeScript
npx tsc --init
```

### 2. Plugin Structure

```
kist-plugin-example/
├── src/
│   ├── index.ts           # Plugin entry point
│   ├── actions/
│   │   └── ExampleAction.ts
│   └── types/
│       └── index.ts
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Implement Your Action

```typescript
// src/actions/ExampleAction.ts
import { Action, ActionOptionsType } from 'kist';

export class ExampleAction extends Action {
    async execute(options: ActionOptionsType): Promise<void> {
        this.logInfo('Executing ExampleAction...');
        
        // Your action logic here
        const { input, output } = options;
        
        try {
            // Process files, transform data, etc.
            this.logInfo(\`Processing from \${input} to \${output}\`);
            
            // Your implementation
            
            this.logInfo('ExampleAction completed successfully.');
        } catch (error) {
            this.logError('ExampleAction failed:', error);
            throw error;
        }
    }

    validateOptions(options: ActionOptionsType): boolean {
        if (!options.input || !options.output) {
            throw new Error('ExampleAction requires input and output options');
        }
        return true;
    }
}
```

### 4. Create Plugin Entry Point

```typescript
// src/index.ts
import { ActionPlugin } from 'kist';
import { ExampleAction } from './actions/ExampleAction';

const plugin: ActionPlugin = {
    version: '1.0.0',
    description: 'Example kist plugin with custom actions',
    author: 'Your Name',
    repository: 'https://github.com/yourusername/kist-plugin-example',
    keywords: ['kist', 'plugin', 'example'],
    
    registerActions() {
        return {
            'ExampleAction': ExampleAction,
        };
    },
};

export default plugin;

// Export action classes for direct use if needed
export { ExampleAction };
```

### 5. Configure package.json

```json
{
  "name": "@your-scope/kist-plugin-example",
  "version": "1.0.0",
  "description": "Example kist plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "keywords": [
    "kist",
    "kist-plugin",
    "build-tool"
  ],
  "peerDependencies": {
    "kist": "^0.1.0"
  },
  "devDependencies": {
    "kist": "^0.1.45",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ]
}
```

### 6. Configure TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Using Plugins

### Installation

```bash
# Install an official kist plugin
npm install --save-dev @kist/action-svg

# Install a third-party plugin
npm install --save-dev @your-scope/kist-plugin-example
```

### Plugin Discovery

kist automatically discovers and loads plugins with these naming conventions:
- `@kist/action-*` - Official plugins (scoped)
- `kist-plugin-*` - Community plugins (unscoped)
- `@your-scope/plugin-*` - Custom scoped plugins

### Using Plugin Actions in kist.yml

```yaml
pipeline:
  stages:
    - name: build
      steps:
        - name: process-example
          action: ExampleAction
          options:
            input: ./src
            output: ./dist
```

## Plugin Naming Conventions

### Official Plugins
- Name: `@kist/action-{name}`
- Example: `@kist/action-svg`, `@kist/action-sass`
- Repository: `https://github.com/getkist/action-{name}`

### Community Plugins
- Name: `kist-plugin-{name}` or `@scope/kist-plugin-{name}`
- Example: `kist-plugin-markdown`, `@mycompany/kist-plugin-custom`

## Best Practices

### 1. Single Responsibility
Each plugin should focus on a specific task or related set of tasks.

### 2. Proper Error Handling
```typescript
async execute(options: ActionOptionsType): Promise<void> {
    try {
        // Your logic
    } catch (error) {
        this.logError('Detailed error message', error);
        throw new Error(\`ActionName failed: \${error.message}\`);
    }
}
```

### 3. Validation
Always validate options before execution:
```typescript
validateOptions(options: ActionOptionsType): boolean {
    const required = ['input', 'output'];
    const missing = required.filter(key => !options[key]);
    
    if (missing.length > 0) {
        throw new Error(\`Missing required options: \${missing.join(', ')}\`);
    }
    
    return true;
}
```

### 4. Logging
Use the built-in logging methods:
```typescript
this.logInfo('Information message');
this.logWarn('Warning message');
this.logError('Error message', error);
this.logDebug('Debug message');
```

### 5. Documentation
Provide comprehensive README with:
- Installation instructions
- Usage examples
- Configuration options
- API documentation

### 6. TypeScript Types
Export types for better developer experience:
```typescript
export interface ExampleActionOptions {
    input: string;
    output: string;
    compress?: boolean;
}

export class ExampleAction extends Action {
    async execute(options: ExampleActionOptions): Promise<void> {
        // ...
    }
}
```

## Testing Plugins

### Unit Tests
```typescript
import { ExampleAction } from '../src/actions/ExampleAction';

describe('ExampleAction', () => {
    let action: ExampleAction;
    
    beforeEach(() => {
        action = new ExampleAction();
    });
    
    it('should validate options correctly', () => {
        expect(() => action.validateOptions({})).toThrow();
        expect(action.validateOptions({ input: 'src', output: 'dist' })).toBe(true);
    });
    
    it('should execute successfully', async () => {
        await expect(action.execute({
            input: './test/fixtures',
            output: './test/output'
        })).resolves.toBeUndefined();
    });
});
```

### Integration Tests
Test your plugin with actual kist configurations:
```typescript
import { Kist, PluginManager } from 'kist';
import plugin from '../src/index';

describe('Plugin Integration', () => {
    it('should register actions correctly', () => {
        const pluginManager = PluginManager.getInstance();
        pluginManager.registerPlugin(plugin, 'test-plugin');
        
        const actions = pluginManager.listPluginActions();
        expect(actions).toContain('ExampleAction');
    });
});
```

## Publishing

### 1. Prepare for Publishing
```bash
# Build the plugin
npm run build

# Test locally
npm link
cd /path/to/test-project
npm link @your-scope/kist-plugin-example
```

### 2. Publish to npm
```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

### 3. Version Management
Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features (backwards compatible)
- **Major** (x.0.0): Breaking changes

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

## Official Plugin Migration

The following actions are being moved from core to plugins:

| Action | Plugin Package | Repository |
|--------|---------------|------------|
| StyleProcessingAction | @kist/action-sass | getkist/action-sass |
| TypeScriptCompilerAction | @kist/action-typescript | getkist/action-typescript |
| JavaScriptMinifyAction | @kist/action-terser | getkist/action-terser |
| SvgPackagerAction, SvgSpriteAction, etc. | @kist/action-svg | getkist/action-svg |
| LintAction | @kist/action-lint | getkist/action-lint |
| DocumentationAction | @kist/action-docs | getkist/action-docs |

Migration will happen gradually to maintain backward compatibility.

## Support

- **Documentation**: https://www.kist
- **GitHub**: https://github.com/getkist/kist
- **Issues**: https://github.com/getkist/kist/issues
- **Discussions**: https://github.com/getkist/kist/discussions

## License

When creating plugins, choose an appropriate license (MIT recommended for maximum compatibility).
