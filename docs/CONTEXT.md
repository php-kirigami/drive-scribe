# Context

## What DriveScribe is

A Google Apps Script library, published by Script ID for other Apps
Script projects to add as a dependency. It recursively walks a Google
Drive folder and returns the whole hierarchy as one plain object:
folders nest, Google Docs become Markdown (one entry per Docs tab,
tabs can nest), Google Sheets become JSON (one entry per sheet).

- GitHub org `php-kirigami`, repo `php-kirigami/drive-scribe`.
- Sole author / maintainer: Maxime Larrivée-Roy.
- Not part of the Kirigami monorepo: different runtime (Apps Script V8,
  not Node), different audience, unrelated to the static site generator.
  See the Kirigami repo's own CLAUDE.md for that decision.

## Project layout

```
src/
  appsscript.json   — Apps Script manifest (timezone, scopes, runtime)
  types.ts          — shared interfaces (no import/export, global scope)
  Code.ts           — public API: walk(), docToMarkdown(), sheetToJson()
  drive.ts          — recursive folder walk, Drive file metadata (dates)
  docs.ts           — Document -> Markdown, recursing through tabs
  sheets.ts         — Spreadsheet -> JSON, one entry per sheet
  webapp.ts         — doGet HTTP endpoint for non-Apps-Script callers
scripts/
  build.mjs         — tsc emit to build/ + copies appsscript.json there
build/              — generated, gitignored; what `clasp push` actually pushes
```

No `import`/`export`: Apps Script executes every file in the project as
one shared global scope. TypeScript type-checks the whole `src/` folder
as a single "global script" program (see `tsconfig.json`: `module: "none"`),
which is why cross-file references type-check without explicit imports.
`npm run build` compiles `src/*.ts` to `build/*.js` — see
[DECISIONS.md](DECISIONS.md) for why that's plain `tsc` and not a bundler.

## Public API

- `walk(folderId, options?)` → `DriveNode` — recurse a folder.
- `docToMarkdown(documentId)` → `DocResult` — convert a single Doc.
- `sheetToJson(spreadsheetId)` → `SheetResult` — convert a single Sheet.

Every other function is an internal helper (trailing underscore), the
Apps Script convention for hiding it from a consuming script's
autocomplete — libraries expose every top-level function/var, there's no
real access control.

There's also `doGet` (src/webapp.ts), a web app entry point wrapping the
same three functions as an HTTP endpoint for callers that aren't Apps
Script projects — a Node-based Kirigami plugin, chiefly. See
[DECISIONS.md](DECISIONS.md) for why it's public-but-token-gated instead
of using Google's own auth, and the README for its request/response shape.

## Licensing

GPL-3.0-or-later, matching the rest of the `php-kirigami` org.

## Code conventions

- **Comments and docs: English.** Conversations with the user are French.
- **No module system** — everything in `src/` is global scope by
  necessity (Apps Script has no `import`/`export`).
- **`_`-suffixed names are internal helpers**, never called from outside.
- **Node `>=24.0.0`** for the local dev tooling (clasp, tsc) — irrelevant
  to the Apps Script runtime itself, which is a fixed V8 sandbox.
- **Dev machine is Windows** (PowerShell primary).
