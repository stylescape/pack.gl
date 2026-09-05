// ============================================================================
// Import
// ============================================================================

import { Command, Option } from "commander";
import { KIST_SCHEMA } from "../config/kistSchema.js";
import { ConfigLoader } from "../core/config/ConfigLoader.js";
import { ConfigStore } from "../core/config/ConfigStore.js";
import { StepCache } from "../core/cache/StepCache.js";
import { KistError } from "../errors/index.js";
import type { ConfigInterface } from "../interface/ConfigInterface.js";
import { Kist } from "../kist.js";
import { Logger } from "../logger/Logger.js";
import { VERSION } from "../version.js";
import { writeInitialConfig } from "./InitCommand.js";
import type { InitTemplate } from "./InitCommand.js";
import { INIT_TEMPLATES } from "./InitCommand.js";
import { buildPlan, formatGraph, formatPlan } from "./Planner.js";

// ============================================================================
// Types
// ============================================================================

/**
 * The global options every command shares.
 */
interface GlobalOptions {
    /**
     * Explicit path to the configuration file (`-c, --config`). Unset falls
     * back to `kist.yaml` or `kist.yml` in the working directory.
     */
    config?: string;

    /**
     * Lowest severity the Logger prints (`-l, --log-level`).
     */
    logLevel?: "debug" | "info" | "warn" | "error";

    /**
     * Shorthand for `--log-level debug` (`-v, --verbose`).
     */
    verbose?: boolean;

    /**
     * Serve the build output and rebuild on file changes (`--live`).
     */
    live?: boolean;

    /**
     * Whether cached step results may be reused. Commander sets this to false
     * for `--no-cache`, which forces every step to run.
     */
    cache?: boolean;

    /**
     * Print the execution plan instead of running it (`--dry [format]`).
     * A string selects the format (`"text"` or `"json"`); bare `true` means
     * the default text rendering.
     */
    dry?: string | boolean;

    /**
     * Print the execution plan instead of running it (`--dry-run`), always in
     * text form. Equivalent to `dry: "text"`.
     */
    dryRun?: boolean;

    /**
     * Print the stage dependency graph instead of running the pipeline
     * (`--graph [format]`). A string selects `"dot"` or `"mermaid"`; bare
     * `true` means the default format.
     */
    graph?: string | boolean;
}

// ============================================================================
// Output
// ============================================================================

/**
 * Writes a line to stdout. Command results are data the caller asked for, not
 * log output, so they bypass the Logger and its level filtering: piping
 * `kist --dry=json` into a file must not depend on the configured log level.
 *
 * @param text - The text to write.
 */
function emit(text: string): void {
    // eslint-disable-next-line no-console
    console.log(text);
}

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Loads the configuration file, merges CLI overrides into the store, and
 * applies the resulting log level.
 *
 * @param options - Parsed global CLI options.
 * @returns The merged configuration and the path it was loaded from.
 */
export async function loadConfiguration(
    options: GlobalOptions,
): Promise<{ config: ConfigInterface; configPath?: string }> {
    const loader = new ConfigLoader();
    await loader.initialize(options.config);
    const fileConfig = await loader.loadConfig();

    const store = ConfigStore.getInstance();
    store.merge(fileConfig);

    // Translate CLI flags into the shape the configuration uses, so a flag and
    // its file-based equivalent end up in exactly one place.
    const overrides: Record<string, unknown> = {};
    if (options.live) {
        overrides.live = { enabled: true };
    }
    if (options.logLevel) {
        overrides.logLevel = options.logLevel;
    }
    if (options.cache === false) {
        overrides.cache = { enabled: false };
    }
    store.merge({ options: overrides });

    const level = options.verbose
        ? "debug"
        : store.get<"debug" | "info" | "warn" | "error">("options.logLevel");
    if (level) {
        Logger.getInstance().setLogLevel(level);
    }

    return {
        config: store.getConfig(),
        configPath: loader.getConfigPath() ?? undefined,
    };
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Runs the pipeline, or prints what it would do when an inspection flag is
 * present. `--dry` and `--graph` both short-circuit execution.
 *
 * @param options - Parsed global CLI options.
 */
export async function runCommand(options: GlobalOptions): Promise<void> {
    const { config, configPath } = await loadConfiguration(options);

    const wantsPlan = Boolean(options.dry || options.dryRun);
    const wantsGraph = Boolean(options.graph);

    if (wantsPlan || wantsGraph) {
        const kist = new Kist();
        // Resolve actions and validate before reporting, so the plan reflects
        // what would actually happen rather than what the file claims.
        await kist.prepare();
        const plan = buildPlan(config, configPath);

        if (wantsGraph) {
            const format = options.graph === "mermaid" ? "mermaid" : "dot";
            emit(formatGraph(plan, format));
        }

        if (wantsPlan) {
            const asJson = options.dry === "json";
            emit(asJson ? JSON.stringify(plan, null, 2) : formatPlan(plan));
        }

        // An unresolvable action is the thing a dry run exists to catch, so it
        // is a failure rather than a note in passing.
        if (plan.unresolvedActions.length > 0) {
            throw new KistError(
                `Configuration references ${plan.unresolvedActions.length} unknown action(s): ` +
                    plan.unresolvedActions.join(", "),
                "UNKNOWN_ACTION",
            );
        }
        return;
    }

    await new Kist().run();
}

/**
 * Scaffolds a starter configuration file.
 *
 * @param directory - Where to write it. Defaults to the current directory.
 * @param options - Template selection and overwrite behaviour.
 */
export function initCommand(
    directory: string | undefined,
    options: { template?: InitTemplate; force?: boolean },
): void {
    const written = writeInitialConfig({
        directory,
        template: options.template,
        force: options.force,
    });

    emit(`Created ${written}`);
    emit("");
    emit("Next steps:");
    emit("  kist --dry-run     inspect the pipeline without running it");
    emit("  kist               run it");
}

/**
 * Loads and validates the configuration without running anything.
 *
 * @param options - Parsed global CLI options.
 */
export async function validateCommand(options: GlobalOptions): Promise<void> {
    const { config, configPath } = await loadConfiguration(options);

    const kist = new Kist();
    await kist.prepare();

    const plan = buildPlan(config, configPath);
    if (plan.unresolvedActions.length > 0) {
        throw new KistError(
            `Unknown action(s): ${plan.unresolvedActions.join(", ")}`,
            "UNKNOWN_ACTION",
        );
    }

    const steps = plan.stages.reduce(
        (total, stage) => total + stage.steps.length,
        0,
    );
    emit(
        `${configPath ?? "Configuration"} is valid: ` +
            `${plan.stages.length} stage(s), ${steps} step(s).`,
    );
}

/**
 * Removes cached step results.
 *
 * The configuration is loaded first so the cache directory it names is the one
 * cleared. Without it the command always cleared the default `.kist-cache`,
 * quietly doing nothing for any project that had configured somewhere else.
 *
 * @param options - Parsed global CLI options.
 */
export async function clearCacheCommand(
    options: GlobalOptions = {},
): Promise<void> {
    const { config } = await loadConfiguration(options);

    await StepCache.getInstance({
        cacheDir: config.options?.cache?.cacheDir,
        ttl: config.options?.cache?.ttl,
    }).clear();
    emit("Step cache cleared.");
}

// ============================================================================
// Program
// ============================================================================

/**
 * Builds the kist command-line program.
 *
 * Argument parsing, `--help`, `--version`, and unknown-option suggestions come
 * from commander rather than being hand-rolled, so behaviour matches what
 * people expect of a CLI and the option table stays the single description of
 * the interface.
 *
 * @returns The configured commander program, not yet parsed.
 */
export function createProgram(): Command {
    const program = new Command();

    program
        .name("kist")
        .description(
            "Lightweight package pipeline processor.\n\n" +
                "Runs the stages defined in kist.yml. With no command, the pipeline runs.",
        )
        .version(VERSION, "-V, --version", "Print the kist version.")
        .showSuggestionAfterError(true)
        .configureHelp({ showGlobalOptions: true });

    // Global options, available to every subcommand.
    program
        .option(
            "-c, --config <path>",
            "Path to the configuration file. Defaults to kist.yaml or kist.yml.",
        )
        .addOption(
            new Option(
                "-l, --log-level <level>",
                "Lowest severity to print.",
            ).choices(["debug", "info", "warn", "error"]),
        )
        .option("-v, --verbose", "Shorthand for --log-level debug.")
        .option("--live", "Serve the output and rebuild on file changes.")
        .option("--no-cache", "Ignore cached results and run every step.");

    program
        .command("run", { isDefault: true })
        .description("Run the pipeline (default).")
        .option("--dry-run", "Print the execution plan instead of running it.")
        .addOption(
            new Option(
                "--dry [format]",
                "Print the execution plan in the given format.",
            ).choices(["text", "json"]),
        )
        .addOption(
            new Option(
                "--graph [format]",
                "Print the stage dependency graph.",
            ).choices(["dot", "mermaid"]),
        )
        .action(async (options, command: Command) => {
            await runCommand({ ...command.parent?.opts(), ...options });
        });

    program
        .command("init")
        .description("Create a starter kist.yml in the given directory.")
        .argument("[directory]", "Where to write the file.", ".")
        .addOption(
            new Option("-t, --template <name>", "Which starter to use.")
                .choices([...INIT_TEMPLATES])
                .default("minimal"),
        )
        .option("-f, --force", "Overwrite an existing file.")
        .action(initCommand);

    program
        .command("validate")
        .description(
            "Check the configuration and that every action it names exists.",
        )
        .action(async (options, command: Command) => {
            await validateCommand({ ...command.parent?.opts(), ...options });
        });

    program
        .command("schema")
        .description(
            "Print the JSON Schema for kist.yml, for tooling and editors.",
        )
        .action(() => emit(JSON.stringify(KIST_SCHEMA, null, 2)));

    program
        .command("clear-cache")
        .description("Delete cached step results.")
        .action(async (options, command: Command) => {
            await clearCacheCommand({
                ...command.parent?.opts(),
                ...options,
            });
        });

    return program;
}

/**
 * Parses arguments and runs the selected command.
 *
 * @param argv - Full process argv, including the node and script entries.
 */
export async function runCli(argv: string[] = process.argv): Promise<void> {
    await createProgram().parseAsync(argv);
}
