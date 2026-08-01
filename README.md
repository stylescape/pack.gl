<p align="center">
    <img src="https://raw.githubusercontent.com/getkist/brand/main/src/logo/kist.png" width="20%" alt="kist logo"></p>
<h1 align="center" style='border-bottom: none;'>kist</h1>
<h3 align="center">Lightweight Package Pipeline Processor</h3>

<br/>

<div align="center">

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.getkist.com&up_message=Up&up_color=5e4d34&down_message=Down&down_color=5e4d34&style=flat-square&logo=Firefox&logoColor=FFFFFF&label=Website&labelColor=5e4d34&color=5e4d34)](https://www.getkist.com)
[![NPM Version](https://img.shields.io/npm/v/kist?style=flat-square&logo=npm&logoColor=FFFFFF&label=NPM&labelColor=5e4d34&color=5e4d34)](https://www.npmjs.com/package/kist)
[![GitHub License](https://img.shields.io/github/license/getkist/kist?style=flat-square&logo=readthedocs&logoColor=FFFFFF&label=&labelColor=%235e4d34&color=%235e4d34)](https://github.com/getkist/kist/blob/main/LICENSE)

</div>

<div align="center">

[![Report a Bug](https://img.shields.io/badge/Report%20a%20Bug-GitHub?style=flat-square&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/getkist/kist/issues/new?template=bug_report.yml)
[![Request a Feature](https://img.shields.io/badge/Request%20a%20Feature-GitHub?style=flat-square&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/getkist/kist/issues/new?template=feature_request.yml)
[![Start a Discussion](https://img.shields.io/badge/Start%20a%20Discussion-GitHub?style=flat-square&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/getkist/kist/discussions)

</div>

---

**kist** is a lightweight, plugin-based package pipeline processor for modern JavaScript/TypeScript projects. It provides a modular framework for automating build workflows with support for live reload, parallel execution, and extensible actions.

---

## Features

- **Plugin Architecture** - Extend functionality with official and community plugins
- **Pipeline System** - Define stages and steps in YAML configuration
- **Core Actions** - Built-in actions for common tasks (copy, clean, compile, etc.)
- **Live Reload** - Watch mode with automatic rebuilds
- **TypeScript** - Full TypeScript support with type definitions
- **Self-Hosting** - kist builds itself using its own pipeline
- **Caching** - Smart build caching for faster rebuilds
- **Parallel Execution** - Run stages and steps concurrently

---

## Quick Start

### Installation

```bash
npm install kist --save-dev
```

### Create Configuration

Create a `kist.yml` file in your project root:

```yaml
stages:
    - name: build
      steps:
          - name: clean
            action: DirectoryCleanAction
            options:
                dirPath: "./dist"

          - name: copy-files
            action: FileCopyAction
            options:
                srcFile: "./README.md"
                destDir: "./dist"

          - name: compile
            action: TypeScriptCompilerAction
            options:
                tsConfigPath: "./tsconfig.json"
                outputDir: "./dist/js"
```

### Run Pipeline

```bash
npx kist
# or with a specific config
npx kist --config kist.production.yml
```

---

## Core Actions

kist includes these built-in actions:

| Action                     | Description                  |
| -------------------------- | ---------------------------- |
| `DirectoryCleanAction`     | Remove directory contents    |
| `DirectoryCopyAction`      | Copy directories recursively |
| `DirectoryCreateAction`    | Create directories           |
| `FileCopyAction`           | Copy individual files        |
| `FileRenameAction`         | Rename or move files         |
| `TypeScriptCompilerAction` | Compile TypeScript           |
| `PackageManagerAction`     | Generate package.json        |
| `VersionWriteAction`       | Update version in files      |
| `RunScriptAction`          | Execute npm scripts          |
| `DocumentationAction`      | Generate documentation       |

---

## Official Plugins

Extend kist with official action plugins:

| Plugin                                                                          | Description                     |
| ------------------------------------------------------------------------------- | ------------------------------- |
| [@getkist/action-sass](https://github.com/getkist/kist-action-sass)             | Compile SASS/SCSS to CSS        |
| [@getkist/action-typescript](https://github.com/getkist/kist-action-typescript) | Advanced TypeScript compilation |
| [@getkist/action-nunjucks](https://github.com/getkist/kist-action-nunjucks)     | Render Nunjucks templates       |
| [@getkist/action-svg](https://github.com/getkist/kist-action-svg)               | Optimize and package SVGs       |
| [@getkist/action-postcss](https://github.com/getkist/kist-action-postcss)       | Process CSS with PostCSS        |
| [@getkist/action-terser](https://github.com/getkist/kist-action-terser)         | Minify JavaScript               |
| [@getkist/action-eslint](https://github.com/getkist/kist-action-eslint)         | Lint with ESLint                |
| [@getkist/action-prettier](https://github.com/getkist/kist-action-prettier)     | Format with Prettier            |
| [@getkist/action-jest](https://github.com/getkist/kist-action-jest)             | Run tests with Jest             |

Install plugins via npm (packages are published under the `@getkist` scope):

```bash
npm install @getkist/action-sass --save-dev
```

---

## Configuration

### Full Example

```yaml
options:
    mode: development
    logLevel: debug
    live:
        enabled: true
        port: 3000
        watchPaths:
            - src/**
    cache:
        enabled: true
        cacheDir: ".kist-cache"
    performance:
        parallelProcessing: true
        maxConcurrentStages: 4

stages:
    - name: Preprocessing
      parallel: false
      steps:
          - name: Clean
            action: DirectoryCleanAction
            options:
                dirPath: "./dist"

          - name: CopyAssets
            action: DirectoryCopyAction
            options:
                srcDir: "./src/assets"
                destDir: "./dist/assets"

    - name: Compile
      parallel: true
      steps:
          - name: CompileTS
            action: TypeScriptCompilerAction
            options:
                tsConfigPath: "./tsconfig.json"
                outputDir: "./dist/js"

          - name: CompileSASS
            action: StyleProcessingAction
            options:
                inputFile: "./src/scss/main.scss"
                outputFile: "./dist/css/main.css"
```

### Config Inheritance

Create reusable base configurations:

```yaml
# kist.base.yml
stages:
    - name: build
      steps:
          - name: compile
            action: TypeScriptCompilerAction
            options:
                tsConfigPath: "./tsconfig.json"
```

```yaml
# kist.production.yml
extends: ./kist.base.yml
options:
    mode: production
```

---

## CLI Options

```bash
kist [options]

Options:
  --config <path>   Path to config file (default: kist.yaml or kist.yml)
  --live            Enable live reload mode
  --verbose         Enable verbose (debug) logging
```

---

## Development

### Build from Source

```bash
git clone https://github.com/getkist/kist.git
cd kist
npm install
npm run build
```

kist uses a self-hosting build process:

1. `tsc` compiles TypeScript (bootstrap)
2. `kist` runs its own pipeline for packaging

### Project Structure

```text
kist/
├── src/ts/
│   ├── actions/      # Built-in action implementations
│   ├── core/         # Pipeline engine, config, plugins
│   ├── interface/    # TypeScript interfaces
│   ├── live/         # Live reload server
│   ├── cli.ts        # CLI entry point
│   └── kist.ts       # Main Kist class
├── dist/             # Compiled output
├── kist.yml          # Build configuration
└── package.json
```

---

## Documentation

Full documentation available at **[getkist.com](https://www.getkist.com)**

- [Getting Started](https://www.getkist.com/guide/getting-started)
- [Configuration Guide](https://www.getkist.com/guide/configuration)
- [Core Actions](https://www.getkist.com/guide/core-actions)
- [Plugin Development](https://www.getkist.com/guide/plugin-development)
- [API Reference](https://www.getkist.com/api/)

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright © 2024-2026 [Scape Press](https://www.scape.press)

---

<p align="center">
    <b>Made with ❤️ by <a href="https://www.scape.press" target="_blank">Scape Press</a></b>
</p>
