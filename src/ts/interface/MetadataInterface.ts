/**
 * MetadataInterface provides contextual information about the pipeline
 * configuration. This metadata is useful for tracking changes, documentation,
 * and integration with external systems.
 */
export interface MetadataInterface {

    /**
     * A human-readable name for the pipeline.
     * Used for identification and reporting purposes.
     */
    name?: string;

    /**
     * The semantic version of the pipeline configuration.
     * Helps in tracking changes, maintaining compatibility, and managing
     * different setups.
     */
    version?: string;

    /**
     * A detailed description outlining the pipeline's purpose, objectives,
     * or key features.
     * Useful for providing context to users and maintainers.
     */
    description?: string;

    /**
     * The author or owner of the pipeline configuration.
     * Can include details such as name, email, or organization.
     */
    author?: string;

    /**
     * A collection of arbitrary key-value pairs to further describe the
     * pipeline.
     * For example, categories, environment tags, or custom properties.
     */
    tags?: Record<string, string>;

    /**
     * A timestamp indicating when the configuration was created or last
     * updated.
     * Should follow ISO 8601 format (e.g., "2024-01-01T12:00:00Z").
     */
    timestamp?: string;

    /**
     * The license under which the pipeline configuration is shared or used.
     * This defines the terms and conditions for using the configuration.
     * For example: "MIT", "GPL-3.0", "Proprietary".
     */
    license?: string;

    /**
     * A URL pointing to documentation or additional resources related to
     * the pipeline.
     * Can include links to GitHub repos, wikis, or help pages.
     */
    documentationUrl?: string;

    /**
     * Contact information for questions or support regarding the pipeline
     * configuration.
     * This can include an email address, a support page URL, or a
     * team/organization name.
     */
    contactInfo?: string;

    /**
     * Dependencies or related systems required by the pipeline configuration.
     * Useful for tracking external systems or tools that interact with this
     * pipeline.
     */
    dependencies?: string[];

    /**
     * An optional field to track the intended runtime environment(s) for
     * the pipeline.
     * Examples: "local", "CI/CD", "staging", "production".
     */
    environments?: string[];

}
