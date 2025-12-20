# kist Plugin Template

Template repository for creating kist plugins.

## Quick Start

1. **Use this template**
    - Click "Use this template" on GitHub
    - Name your plugin: `kist-plugin-{name}` or `@scope/kist-plugin-{name}`

2. **Clone and install**

    ```bash
    git clone https://github.com/yourusername/kist-plugin-{name}.git
    cd kist-plugin-{name}
    npm install
    ```

3. **Customize**
    - Update `package.json` with your plugin details
    - Implement your actions in `src/actions/`
    - Update `src/index.ts` to export your actions
    - Update `README.md` with usage instructions

4. **Build and test**

    ```bash
    npm run build
    npm test
    npm link  # Test locally
    ```

5. **Publish**
    ```bash
    npm publish
    ```

## Project Structure

```
kist-plugin-example/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── actions/
│   │   └── ExampleAction.ts  # Your action implementation
│   └── types/
│       └── index.ts          # TypeScript types
├── test/
│   └── ExampleAction.test.ts
├── dist/                     # Compiled output (generated)
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── LICENSE
```

## Example Implementation

### src/actions/ExampleAction.ts

```typescript
import { Action, ActionOptionsType } from 'kist';

export class ExampleAction extends Action {
    async execute(options: ActionOptionsType): Promise<void> {
        this.logInfo('Executing ExampleAction...');

        // Your action logic here
        const { input, output } = options;

        // Example: Process files
        this.logInfo(\`Processing \${input} -> \${output}\`);

        // Your implementation

        this.logInfo('ExampleAction completed.');
    }

    validateOptions(options: ActionOptionsType): boolean {
        if (!options.input || !options.output) {
            throw new Error('ExampleAction requires input and output options');
        }
        return true;
    }
}
```

### src/index.ts

```typescript
import { ActionPlugin } from "kist";
import { ExampleAction } from "./actions/ExampleAction";

const plugin: ActionPlugin = {
    version: "1.0.0",
    description: "Example kist plugin",
    author: "Your Name",
    repository: "https://github.com/yourusername/kist-plugin-example",

    registerActions() {
        return {
            ExampleAction: ExampleAction,
        };
    },
};

export default plugin;
export { ExampleAction };
```

### package.json

```json
{
    "name": "@your-scope/kist-plugin-example",
    "version": "1.0.0",
    "description": "Example kist plugin",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "type": "module",
    "keywords": ["kist", "kist-plugin"],
    "peerDependencies": {
        "kist": "^0.1.0"
    },
    "devDependencies": {
        "kist": "^0.1.45",
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "jest": "^29.0.0",
        "@types/jest": "^29.0.0"
    },
    "scripts": {
        "build": "tsc",
        "test": "jest",
        "prepublishOnly": "npm run build && npm test"
    }
}
```

## Testing Your Plugin

### Unit Test Example

```typescript
import { ExampleAction } from "../src/actions/ExampleAction";

describe("ExampleAction", () => {
    let action: ExampleAction;

    beforeEach(() => {
        action = new ExampleAction();
    });

    it("should validate options", () => {
        expect(() => action.validateOptions({})).toThrow();
        expect(
            action.validateOptions({
                input: "src",
                output: "dist",
            }),
        ).toBe(true);
    });

    it("should execute", async () => {
        await action.execute({
            input: "./test/fixtures",
            output: "./test/output",
        });
    });
});
```

### Local Testing

```bash
# In your plugin directory
npm link

# In a test project
npm link @your-scope/kist-plugin-example

# Test in kist.yml
pipeline:
  stages:
    - name: test
      steps:
        - name: test-action
          action: ExampleAction
          options:
            input: ./src
            output: ./dist
```

## Publishing

```bash
# Build and test
npm run build
npm test

# Version bump
npm version patch  # or minor, major

# Publish to npm
npm publish --access public
```

## Resources

- [Plugin Development Guide](https://github.com/getkist/kist/blob/main/PLUGIN_DEVELOPMENT.md)
- [kist Documentation](https://www.kist)
- [Example Plugins](https://github.com/getkist?q=plugin-)

## License

MIT
