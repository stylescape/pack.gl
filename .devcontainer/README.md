# kist DevContainer

This repository provides a development container configuration for working on `kist`, a lightweight package pipeline processor with a plugin architecture. The configuration is optimized for Node.js and TypeScript development, providing a comprehensive development environment using Visual Studio Code's Dev Containers.

## DevContainer Configuration

The development container is configured with the following settings:

```json
{
    "name": "kist DevContainer",
    "build": {
        "dockerfile": "Dockerfile",
        "context": "."
    },
    "image": "mcr.microsoft.com/vscode/devcontainers/javascript-node:0-22",
    "features": {
        "ghcr.io/devcontainers/features/node:2": {
            "version": "22"
        }
    },
    "customizations": {
        "vscode": {
            "extensions": [
                "dbaeumer.vscode-eslint",
                "esbenp.prettier-vscode",
                "ms-vscode.vscode-typescript-next",
                "stylelint.vscode-stylelint",
                "streetsidesoftware.code-spell-checker",
                "redhat.vscode-yaml",
                "PKief.material-icon-theme",
                "syler.sass-indented",
                "vscode-icons-team.vscode-icons",
                "jinja.html-formatter",
                "ritwickdey.LiveServer",
                "gruntfuggly.todo-tree"
            ],
            "settings": {
                "editor.formatOnSave": true,
                "terminal.integrated.shell.linux": "/bin/bash",
                "files.associations": {
                    "*.jinja": "jinja"
                }
            }
        }
    },
    "forwardPorts": [3000],
    "postCreateCommand": "npm install",
    "remoteUser": "vscode",
    "workspaceFolder": "/workspace",
    "mounts": [
        "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached"
    ],
    "remoteEnv": {
        "NODE_ENV": "development"
    },
    "containerEnv": {
        "NODE_ENV": "development"
    }
}
```

### Key Components

1. **Base Image**:
    - **Node.js Dev Container**: The development environment is based on the official Node.js Dev Container image `mcr.microsoft.com/vscode/devcontainers/javascript-node:0-22`, which includes Node.js 22, matching this package's `engines.node >=22.0.0` requirement.

2. **VS Code Extensions**:
   The container is pre-configured with a set of Visual Studio Code extensions to enhance your development experience:
    - **JavaScript/TypeScript**:
        - `dbaeumer.vscode-eslint`: Linting for JavaScript and TypeScript.
        - `esbenp.prettier-vscode`: Code formatting with Prettier.
        - `ms-vscode.vscode-typescript-next`: Enhanced TypeScript support.
    - **CSS/SCSS**:
        - `stylelint.vscode-stylelint`: Linting for CSS and SCSS files (used by the `StyleProcessingAction`/`PostCssAction` actions).
        - `syler.sass-indented`: Syntax highlighting for SCSS/SASS.
    - **Templating**:
        - `jinja.html-formatter`: Formatting for the Jinja2-style templates used by `TemplateRenderAction`.
        - `redhat.vscode-yaml`: YAML support for kist pipeline config files.
        - `ritwickdey.LiveServer`: Live reloading, useful when working on `kist --live`.
    - **Utility & Productivity**:
        - `streetsidesoftware.code-spell-checker`: Spell checking for text files (uses `cspell.json`).
        - `gruntfuggly.todo-tree`: Managing TODO comments effectively.
        - `PKief.material-icon-theme` and `vscode-icons-team.vscode-icons`: Custom icons for a better file explorer experience.

3. **Post-Creation Commands**:
    - Automatically installs dependencies via `npm install` after the container is created, so the environment is ready to build and test immediately.

4. **Environment Variables**:
    - `NODE_ENV` is set to `development` for both the remote and container environments.

5. **VS Code Custom Settings**:
    - **Formatting**: Automatically formats your code on save, maintaining code consistency.
    - **File Associations**: Associates `.jinja` files with Jinja2 syntax highlighting.

### Usage Instructions

1. **Setup**:
    - Ensure Docker and Visual Studio Code are installed on your machine. Also, install the VS Code Dev Containers extension if not already installed.

2. **Add the DevContainer Configuration**:
    - This repository already ships a `.devcontainer` directory at its root with `devcontainer.json`, `Dockerfile`, and `docker-compose.yml`.

3. **Open in Container**:
    - Open the project in Visual Studio Code. When prompted to "Reopen in Container", select this option to launch the development container.

4. **Working in the Container**:
    - Once the container is up, you can build (`npm run build`), test (`npm test`), and run kist's CLI (`npm run test:cli`) inside a fully-configured environment.

### Benefits

- **Consistency**: Develop in a consistent environment across contributors' machines.
- **Pre-configured Tools**: Start coding immediately with all essential tools and extensions pre-configured.
- **Portability**: Easily share your development environment setup with team members.

### Customization

Feel free to customize the `devcontainer.json` file to better suit your needs. You can add or remove extensions, modify environment variables, or adjust settings as required.

### Troubleshooting

- If you encounter issues with the container setup, ensure Docker is running and that your system meets the requirements for using Dev Containers.
- Check the logs in the VS Code terminal for any errors during the container build or startup process.
