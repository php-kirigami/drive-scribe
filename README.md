# DriveScribe

A Google Apps Script library that recursively walks a Google Drive folder
and returns its full hierarchy as a plain object — Google Docs converted
to Markdown, Google Sheets converted to JSON, tabs included on both.

## Why

Useful whenever you need Drive content as structured data instead of live
Docs/Sheets: static site generation, search indexing, backups, feeding
content to another tool or an LLM.

## What it returns

`walk(folderId)` returns a tree of nodes:

```jsonc
{
  "id": "folder-id",
  "name": "My folder",
  "type": "folder",
  "url": "https://drive.google.com/...",
  "createdAt": "2026-01-15T14:32:00.000Z",
  "updatedAt": "2026-09-20T09:11:00.000Z",
  "children": [
    {
      "id": "doc-id",
      "name": "My doc",
      "type": "document",
      "url": "...",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-09-22T16:45:00.000Z",
      "tabs": [
        { "id": "tab-id", "title": "Tab 1", "markdown": "# Heading\n\nBody text." }
      ]
    },
    {
      "id": "sheet-id",
      "name": "My sheet",
      "type": "spreadsheet",
      "url": "...",
      "createdAt": "2026-03-05T08:20:00.000Z",
      "updatedAt": "2026-09-25T11:05:00.000Z",
      "sheets": [
        { "id": 0, "title": "Sheet1", "data": [{ "Column A": "value" }] }
      ]
    }
  ]
}
```

`createdAt`/`updatedAt` (ISO 8601) come from Drive file/folder metadata —
every folder, document and spreadsheet node has them. Individual Docs tabs
and Sheets tabs don't: the Docs/Sheets services don't expose per-tab
timestamps, only `id`/`title`. Nested Docs tabs are supported
(`DocTab.children`); folders recurse to any depth (bound it with
`options.maxDepth`).

## Public API

- `walk(folderId, options?)` — recurse a folder. `options.includeFiles`
  (default `false`) also lists non-Docs/Sheets files as metadata-only leaf
  nodes; `options.maxDepth` bounds recursion depth.
- `docToMarkdown(documentId)` — convert a single Doc, one entry per tab.
- `sheetToJson(spreadsheetId)` — convert a single Spreadsheet, one entry
  per sheet.

Everything else in the project is an internal helper (trailing-underscore
name, hidden from a consuming script's autocomplete by Apps Script
convention).

## Using it as a library

1. In the Apps Script editor of the project that will call it, open
   **Libraries** (the `+` next to Libraries in the left sidebar).
2. Paste this project's Script ID (see `.clasp.json` or ask the
   maintainer) and pick a version.
3. Call it as `DriveScribe.walk('<folder-id>')` (or whatever identifier
   you gave the library import).

## Development

```sh
npm install
npm run build   # type-check with tsc
clasp login     # once, opens a browser — picks the Google account to push as
clasp push      # push src/ to the Apps Script project
clasp deploy    # cut a new library version
```

See [docs/CONTEXT.md](docs/CONTEXT.md) for the project layout and
conventions, and [docs/DECISIONS.md](docs/DECISIONS.md) for the reasoning
behind the Markdown-conversion heuristics.

## License

GPL-3.0-or-later — see [LICENSE](LICENSE).
