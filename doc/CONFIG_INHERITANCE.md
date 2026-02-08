# Configuration Inheritance

Kist supports configuration inheritance, allowing you to create base configurations that can be extended and overridden by child configurations. This is useful for:

- Sharing common settings across multiple environments (dev, staging, prod)
- Reducing duplication in configuration files
- Creating reusable configuration templates

## Basic Usage

### Single Inheritance

Create a base configuration file (`kist.base.yml`):

```yaml
options:
  mode: production

stages:
  - name: Build
    steps:
      - name: Compile CSS
        action: StyleProcessingAction
        options:
          inputFile: ./src/scss/index.scss
          outputFile: ./dist/css/app.css
          styleOption: expanded
```

Extend it in your main configuration (`kist.yml`):

```yaml
extends: ./kist.base.yml

options:
  logLevel: debug  # Adds to inherited options

stages:
  - name: Deploy  # Added after inherited stages
    steps:
      - name: Upload
        action: FileCopyAction
        options:
          srcPath: ./dist
          targetPath: /var/www
```

### Multiple Inheritance

You can extend multiple configuration files:

```yaml
extends:
  - ./kist.base.yml
  - ./kist.dev-defaults.yml

# Your configuration here
stages: []
```

Configurations are merged in order, with later files taking precedence.

## Merge Behavior

### Options Merging

Options are deep-merged. Child values override parent values:

**Parent (`base.yml`):**
```yaml
options:
  mode: production
  live:
    enabled: true
    port: 3000
```

**Child (`kist.yml`):**
```yaml
extends: ./base.yml

options:
  live:
    port: 8080  # Overrides port, keeps enabled: true
```

**Result:**
```yaml
options:
  mode: production
  live:
    enabled: true
    port: 8080
```

### Stages Merging

Stages are merged by name:

- If a child stage has the **same name** as a parent stage, the child **replaces** it
- If a child stage has a **different name**, it is **appended**

**Parent:**
```yaml
stages:
  - name: Build
    steps:
      - name: OldStep
        action: OldAction
  - name: Test
    steps:
      - name: RunTests
        action: TestAction
```

**Child:**
```yaml
extends: ./base.yml

stages:
  - name: Build  # Replaces parent's Build stage
    steps:
      - name: NewStep
        action: NewAction
  - name: Deploy  # Appended (new stage)
    steps:
      - name: DeployStep
        action: DeployAction
```

**Result:**
```yaml
stages:
  - name: Test      # From parent (not replaced)
    steps:
      - name: RunTests
        action: TestAction
  - name: Build     # From child (replaced parent)
    steps:
      - name: NewStep
        action: NewAction
  - name: Deploy    # From child (appended)
    steps:
      - name: DeployStep
        action: DeployAction
```

## Environment-Specific Configurations

A common pattern is to have a base configuration with environment-specific overrides:

### Base Configuration (`kist.base.yml`)

```yaml
stages:
  - name: Build Styles
    steps:
      - name: Compile CSS
        action: StyleProcessingAction
        options:
          inputFile: ./src/scss/index.scss
          outputs:
            - file: ./dist/css/app.css
              style: expanded
            - file: ./dist/css/app.min.css
              style: compressed

  - name: Render Templates
    steps:
      - name: Render HTML
        action: TemplateRenderAction
        options:
          inputDir: ./src/jinja
          outputDir: ./dist/html
          excludePatterns:
            - "includes/**"
          contextFiles:
            - ./src/data/site.yml
```

### Development Configuration (`kist.dev.yml`)

```yaml
extends: ./kist.base.yml

options:
  mode: development
  logLevel: debug
  live:
    enabled: true
    port: 3000
    watchPaths:
      - src/**

stages:
  - name: Build Styles
    steps:
      - name: Compile CSS
        action: StyleProcessingAction
        options:
          inputFile: ./src/scss/index.scss
          outputs:
            - file: ./dist/css/app.css
              style: expanded
              sourceMap: true  # Enable sourcemaps for dev

  - name: Render Templates
    steps:
      - name: Render HTML
        action: TemplateRenderAction
        options:
          inputDir: ./src/jinja
          outputDir: ./dist/html
          excludePatterns:
            - "includes/**"
          contextFiles:
            - ./src/data/site.yml
          context:
            environment: development
            debug: true
```

### Production Configuration (`kist.pro.yml`)

```yaml
extends: ./kist.base.yml

options:
  mode: production
  logLevel: info

stages:
  - name: Render Templates
    steps:
      - name: Render HTML
        action: TemplateRenderAction
        options:
          inputDir: ./src/jinja
          outputDir: ./dist/html
          excludePatterns:
            - "includes/**"
          contextFiles:
            - ./src/data/site.yml
          context:
            environment: production
            debug: false
```

### Usage

```bash
# Development
npx kist --config ./kist.dev.yml --live

# Production
npx kist --config ./kist.pro.yml
```

## Nested Inheritance

Configurations can be chained through multiple levels:

```
grandparent.yml → parent.yml → child.yml
```

**grandparent.yml:**
```yaml
options:
  mode: base
```

**parent.yml:**
```yaml
extends: ./grandparent.yml

options:
  logLevel: info
```

**child.yml:**
```yaml
extends: ./parent.yml

options:
  logLevel: debug  # Overrides parent
```

The final configuration will have:
```yaml
options:
  mode: base       # From grandparent
  logLevel: debug  # From child (overrode parent)
```

## Error Handling

### Circular Inheritance

Kist detects circular inheritance and throws an error:

```yaml
# config1.yml
extends: ./config2.yml
```

```yaml
# config2.yml
extends: ./config1.yml  # Error: Circular config inheritance detected
```

### Missing Files

If an extends file doesn't exist, kist throws an error:

```yaml
extends: ./nonexistent.yml  # Error: ENOENT: no such file or directory
```

## Best Practices

1. **Keep base configs minimal**: Only include truly shared settings
2. **Use descriptive names**: `kist.base.yml`, `kist.dev.yml`, `kist.pro.yml`
3. **Document overrides**: Comment why you're overriding parent values
4. **Avoid deep nesting**: Keep inheritance chains shallow (2-3 levels max)
5. **Test each config**: Ensure each environment config works independently
