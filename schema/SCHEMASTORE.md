# Registering the schema with SchemaStore

[SchemaStore](https://github.com/SchemaStore/schemastore) is the catalog editors
consult to find a schema for a file. Its catalog is enabled by default in the
YAML extension for VS Code and in yaml-language-server generally, so once kist
is listed there, `kist.yml` gets completion and validation in a fresh editor
with no modeline and no settings.

This is a one-time pull request against their repository. It is written down
here because it has to be redone if the schema's URL ever changes.

## Prerequisites

The schema must be reachable at its `$id` before the PR is opened — their CI
fetches it:

```bash
curl -fsS https://www.getkist.com/schema.json | head -5
```

That URL is served from `src/public/schema.json` in the `www-getkist-com`
repository. Deploy that site first.

## The catalog entry

Fork [SchemaStore/schemastore](https://github.com/SchemaStore/schemastore) and
add this object to the `schemas` array in
`src/api/json/catalog.json`, keeping the array's alphabetical order by `name`:

```json
{
    "name": "kist",
    "description": "kist pipeline configuration",
    "fileMatch": ["kist.yml", "kist.yaml"],
    "url": "https://www.getkist.com/schema.json"
}
```

`fileMatch` is deliberately narrow. kist only ever reads `kist.yaml` or
`kist.yml` from the project root, so matching anything broader would attach the
schema to files it does not describe.

## Their checks

The repository's CI validates the catalog entry and fetches the schema. Two
things it will object to:

- **Draft version.** The schema declares draft-07, which is supported.
- **`$id` mismatch.** The `url` in the catalog and the `$id` inside the schema
  must be the same string.

Run their validator locally before opening the PR:

```bash
npm install
npm run new-schema      # walks through adding an entry
npm test
```

## After it lands

Nothing in kist changes. The modeline that `kist init` writes keeps working and
takes priority over the catalog, so a project that has one is unaffected. The
difference is that a project _without_ one starts getting completion too.

Verify by opening a `kist.yml` in a project with no modeline and no
`yaml.schemas` setting, and checking that key completion works.
