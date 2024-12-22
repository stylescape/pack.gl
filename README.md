<p align="center">
    <img src="https://raw.githubusercontent.com/stylescape/brand/master/src/logo/logo-transparant.png" width="20%" height="20%" alt="Stylescape Logo">
</p>
<h1 align="center" style='border-bottom: none;'>pack.gl</h1>
<h3 align="center">Package Pipeline Manager</h3>

<br/>

<div align="center">

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.pack.gl&up_message=Up&up_color=354351&down_message=Down&down_color=354351&style=flat-square&logo=Firefox&logoColor=FFFFFF&label=Website&labelColor=354351&color=354351)
](https://www.pack.gl)
[![NPM Version](https://img.shields.io/npm/v/pack.gl?style=flat-square&logo=npm&logoColor=FFFFFF&label=NPM&labelColor=354351&color=354351&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fpack.gl)](https://www.npmjs.com/package/pack.gl)
[![devContainer](https://img.shields.io/badge/devContainer-23354351?style=flat-square&logo=Docker&logoColor=%23FFFFFF&labelColor=%23354351&color=%23354351)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/stylescape/pack.gl)
[![StackBlitz](https://img.shields.io/badge/StackBlitz-23354351?style=flat-square&logo=StackBlitz&logoColor=%23FFFFFF&labelColor=%23354351&color=%23354351)](https://stackblitz.com/github/stylescape/pack.gl/tree/main?file=src%2Findex.html)
[![GitHub License](https://img.shields.io/github/license/stylescape/pack.gl?style=flat-square&logo=readthedocs&logoColor=FFFFFF&label=&labelColor=%23354351&color=%23354351&link=LICENSE)](https://github.com/stylescape/pack.gl/blob/main/LICENSE)

</div>

<div align="center">

[![Report a Bug](https://img.shields.io/badge/Report%20a%20Bug-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/pack.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=bug_report.yml)
[![Request a Feature](https://img.shields.io/badge/Request%20a%20Feature-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/pack.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=feature_request.yml)
[![Ask a Question](https://img.shields.io/badge/Ask%20a%20Question-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/pack.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=question.yml)
[![Make a Suggestion](https://img.shields.io/badge/Make%20a%20Suggestion-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/pack.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=suggestion.yml)
[![Start a Discussion](https://img.shields.io/badge/Start%20a%20Discussion-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/pack.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=discussion.yml)

</div>

---

<br/>

**Package Builder for the `.gl`-libraries of Scape Agency and its affiliates.**

Pack.gl is a highly customizable and efficient package builder designed to streamline software development workflows. It provides a modular framework for managing build pipelines with support for live reload functionality.

`pack.gl` is a package builder designed to enhance the efficiency and organization of software development projects. Key to its design philosophy is the adaptability to various development workflows, making it an ideal companion for a range of projects from small-scale personal endeavors to large, complex enterprise applications. `pack.gl` stands not just as a tool but as a partner in the software development journey, enhancing productivity, reducing overhead, and bringing clarity and ease to the package management process.

---

## Features

- Modular pipeline system with stages and steps.
- Live reload functionality for enhanced developer experience.
- Plugin-based architecture to extend functionality.
- TypeScript support for a modern development workflow.
- Robust error handling and logging.

---

## Quickstart

To install `pack.gl`, use npm or yarn:

### NPM

``` bash
npm install pack.gl --save-dev
```

### Yarn

``` bash
yarn add pack.gl --dev
```

---

## Installation

1. Clone the Repository:

    ``` sh
    git clone <https://github.com/stylescape/pack.gl.git>
    cd pack.gl
    ```

2. Install Dependencies:

    ``` sh
    npm install
    ```

3. Build the Project:

    ``` sh
    npm run build
    ```

4. Link the CLI Globally:

    ``` sh
    npm link
    ```

---

## Usage

### Run the Pipeline

Run the pipeline defined in your pack.yaml file:

``` sh
pack
```

### Enable Live Reload

Run the pipeline with live reload enabled:

``` sh
pack --live
```

---

## Configuration

The pipeline configuration is defined in a pack.yaml file located in the root of your project. Here’s an example:

``` sh
stages:

- name: build
    steps:
  - name: compile
        action: build
        options:
          source: src/
          output: dist/
- name: test
    dependsOn: [build]
    steps:
  - name: run-tests
        action: test
```

Stage and Step Structure

- Stages: Define a group of steps to be executed.
- Steps: Individual tasks within a stage (e.g., compiling, testing).
- Dependencies: Stages can depend on other stages to enforce execution order.

---

## Development

### Build

Compile the TypeScript files into JavaScript:

``` sh
npm run build-tsc
```

### Lint

Run ESLint to check for code issues:

``` sh
npm run lint
```

### Run Tests

Run all tests in the src/tests directory:

``` sh
npm run test
```

### Live Reload

To enable live reload during development, add the --live flag:

``` sh
pack --live
```

---

## Folder Structure

``` sh
pack.gl/
├── src/
│   ├── core/           # Core pipeline logic
│   ├── live/           # Live reload server and related components
│   ├── actions/        # Built-in step actions (e.g., build, test)
│   ├── tests/          # Unit tests
│   └── pack.ts         # Entry point for the CLI
├── dist/               # Compiled JavaScript output
├── pack.yaml           # Example configuration file
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

---

## Key Components

### Pipeline

The Pipeline class manages the execution of stages and steps defined in the pack.yaml file.

### LiveReloadServer

The LiveReloadServer provides live reload functionality by watching files for changes and notifying connected clients.

### ConfigLoader

The ConfigLoader reads and validates the pipeline configuration from the pack.yaml file.

### Actions

Pack.gl supports plugin-based actions. Default actions include:

- build: Compiles source files.
- test: Runs tests.
- lint: Lints the codebase.

Custom actions can be implemented and registered as plugins.

---

## Colophon

### Authors

**pack.gl** is an open-source project by **[Scape Agency](https://www.scape.agency "Scape Agency website")**.

#### Scape Agency

Scape Agency is a spatial innovation collective that dreams, discovers and designs the everyday of tomorrow. We blend design thinking with emerging technologies to create a brighter perspective for people and planet. Our products and services naturalise technology in liveable and sustainable –scapes that spark the imagination and inspire future generations.

- website: [scape.agency](https://www.scape.agency "Scape Agency website")
- github: [github.com/stylescape](https://github.com/stylescape "Scape Agency GitHub")

### Development Resources

#### Contributing

We'd love for you to contribute and to make this project even better than it is today!
Please refer to the [contribution guidelines](.github/CONTRIBUTING.md) for information.

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes and write tests.
4. Submit a pull request.

### Legal Information

#### Copyright

Copyright &copy; 2024 [Scape Agency BV](https://www.scape.agency/ "Scape Agency website"). All Rights Reserved.

#### License

Except as otherwise noted, the code in this repository is licensed under the MIT License. Also see [LICENSE](https://github.com/stylescape/community/blob/master/src/LICENSE). The documentation is licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0) License](https://creativecommons.org/licenses/by/4.0/).

#### Disclaimer

**THIS SOFTWARE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

<p align="center">
    <b>Made with ❤️ by <a href="https://www.scape.agency" target="_blank">Scape Agency</a></b>
</p>
