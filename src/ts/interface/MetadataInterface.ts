/**
 * MetadataInterface provides contextual information about the pipeline
 * configuration. This metadata is useful for tracking changes, documentation,
 * and integration with external systems.
 */
export interface MetadataInterface {

    /**
     * A human-readable name for the pipeline.
     * Used for identification and reporting purposes.
     *
     * @example "Data Processing Pipeline"
     */
    name?: string;

    /**
     * The semantic version of the pipeline configuration.
     * Helps in tracking changes, maintaining compatibility, and managing
     * different setups.
     *
     * @example "1.0.0"
     */
    version?: string;

    /**
     * A detailed description outlining the pipeline's purpose, objectives,
     * or key features.
     * Useful for providing context to users and maintainers.
     *
     * @example "A pipeline for processing and analyzing large datasets,
     * including ETL operations."
     */
    description?: string;

    /**
     * The author or owner of the pipeline configuration.
     * Can include details such as name, email, or organization.
     *
     * @example "John Doe <john.doe@example.com>"
     */
    author?: string;

    /**
     * A collection of arbitrary key-value pairs to further describe the
     * pipeline configuration. This can be used for categorization or
     * custom metadata.
     *
     * @example { category: "ETL", team: "Data Engineering" }
     */
    tags?: Record<string, string>;

    /**
     * A timestamp indicating when the configuration was created or last
     * updated. Should follow the ISO 8601 format (e.g.,
     * "2024-01-01T12:00:00Z").
     *
     * @example "2024-01-01T12:00:00Z"
     */
    timestamp?: string;

    /**
     * The license under which the pipeline configuration is shared or used.
     * This defines the terms and conditions for using the configuration.
     *
     * @example "MIT"
     * @example "GPL-3.0"
     */
    license?: string;

    /**
     * A URL pointing to documentation or additional resources related to
     * the pipeline.
     * Can include links to GitHub repos, wikis, or help pages.
     *
     * @example "https://github.com/username/repo"
     */
    documentation?: string;

    /**
     * Contact information for questions or support regarding the pipeline
     * configuration.
     * This can include an email address, a support page URL, or a
     * team/organization name.
     *
     * @example "support@example.com"
     * @example "https://example.com/support"
     */
    contact?: string;

    /**
     * Dependencies or related systems required by the pipeline configuration.
     * Useful for tracking external systems or tools that interact with this
     * pipeline.
     *
     * @example ["Node.js >=14.0", "Docker >=20.10"]
     */
    dependencies?: string[];

    /**
     * A list of intended runtime environment(s) for the pipeline.
     * This helps clarify where the pipeline is designed to be executed.
     *
     * @example ["local", "CI/CD", "staging", "production"]
     */
    environments?: string[];

}
