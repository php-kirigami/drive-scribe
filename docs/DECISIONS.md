# Decisions

Non-obvious choices and the reasoning behind them, so they don't get
re-litigated or accidentally reverted.

## Native Drive Markdown export for single-tab Docs (2026-09-27)

`convertDocument_` (src/docs.ts) calls Drive's own `files.export`
(`mimeType=text/markdown`, via `UrlFetchApp` + `ScriptApp.getOAuthToken()`)
when a Doc has exactly one tab with no children, instead of the
hand-rolled `bodyToMarkdown_` walker. Any other tab shape (more than one
root tab, or a tab with children) falls back to walking every tab
ourselves with the original element-by-element converter.

**Why:** Google's own export is a much more complete Markdown converter
than a hand-rolled one — better list/table fidelity, and it embeds images
as base64 data URIs (`![image1]: <data:image/png;base64,...>`) instead of
a bare placeholder. But `files.export` operates on a whole Drive file, not
a tab: there is no parameter to select a tab, and Docs' own UI export only
even attempts an "all tabs" mode as a client-side feature (a ZIP of
separate files per tab), not something the REST/Apps Script API exposes.
For a multi-tab doc there is no documented guarantee of *which* tab
content the export actually returns, so rather than guess, native export
is used only for the unambiguous single-flat-tab case; every other case
keeps using our own per-tab walker, which is the only way to reliably
reach tab 2+. This means the escaping/list-numbering/image-placeholder
heuristics documented below only matter for multi-tab documents now — the
common single-tab case gets Google's own conversion quality.

## Plain `tsc` emit instead of a bundler (2026-09-27)

clasp 3.x dropped its built-in TypeScript transpilation (present in clasp
2.x) and its own docs now recommend a bundler (Rollup, esbuild, etc.) with
a real `build/` step. `scripts/build.mjs` just runs `tsc` (real emit, not
`--noEmit`) via `typescript/bin/tsc`, then copies `src/appsscript.json`
into `build/`; `npm run push`/`deploy` run it first. `.clasp.json`'s
`rootDir` points at `build/`, which is gitignored (generated).

**Why:** our `src/*.ts` files were already written with no `import`/`export`
— Apps Script has no module system, so every file was designed to share
one global scope by convention from the start. That means there is
nothing to *bundle*: each file compiles independently and the output is
already valid, load-order-independent Apps Script code. Pulling in
Rollup/esbuild would add a dependency and a config file to solve a
problem this codebase doesn't have. Revisit only if the code ever needs
real ESM imports or an npm package as a runtime dependency.

## Header detection for Sheets -> JSON (2026-09-27)

`convertSheetTab_` (src/sheets.ts) treats a sheet's first row as a header
— and returns an array of `{ column: value }` row objects — only when
every cell in that row is a non-empty string (`looksLikeHeader_`). If not,
it falls back to the raw 2D array of values.

**Why:** there's no reliable API signal for "this sheet has a header
row" — Sheets doesn't have a first-class header concept. A heuristic on
the shape of row 1 is the pragmatic option; a fully string row is a
strong (if not 100% certain) signal. Falling back to a raw array rather
than guessing wrong keeps the output honest instead of producing
misleadingly-keyed objects from data that has no header.

## Markdown escaping is unconditional (2026-09-27)

`escapeMarkdown_` (src/docs.ts) always backslash-escapes
`` \ ` * _ [ ] `` in Doc text runs, with no opt-out.

**Why:** unescaped text containing e.g. a literal `*` or `_` would
silently turn into unintended Markdown emphasis on re-render. Being
conservative by default is safer than being pretty; making this
configurable is tracked in [ROADMAP.md](ROADMAP.md) if it turns out to
over-escape in practice.

## Ordered-list numbering doesn't reset on interruption (2026-09-27)

`listItemToMarkdown_` (src/docs.ts) keys its counters by
`${listId}_${nestingLevel}` and only ever increments — it never resets
when the same list is interrupted by another element and resumes later.

**Why:** Apps Script's `ListItem` API exposes `getListId()` and
`getNestingLevel()` but no "is this numbering a fresh restart" signal.
Handling the interruption case correctly would need to track adjacency
in the body's child list, adding real complexity for an edge case.
Tracked as a known limitation in [BUGS.md](BUGS.md) rather than solved
speculatively.

## `createdAt`/`updatedAt` only at file/folder level (2026-09-27)

Every `DriveNode`, `DocResult` and `SheetResult` carries Drive
`createdAt`/`updatedAt` (ISO 8601). Individual `DocTab` and `SheetTab`
entries do not.

**Why:** the Docs and Sheets services don't expose per-tab or per-sheet
timestamps — only Drive's file-level metadata (`DriveApp`/`File`) has
`getDateCreated()`/`getLastUpdated()`, and a Doc/Sheet is one Drive file
regardless of how many tabs it has. Attaching file-level dates to every
tab would silently overstate precision that doesn't exist in the API.

## `walkFolder_`/`convertFile_` reuse the already-fetched `File` object (2026-09-27)

Dates for nodes found while walking a folder come from the `File`/`Folder`
object already returned by `folder.getFiles()`/`getFolders()`. The
standalone `docToMarkdown`/`sheetToJson` entry points, which only have an
ID, fetch metadata once via a dedicated `fileDates_()` (`DriveApp.getFileById`).

**Why:** avoids one extra Drive API call per file during a recursive
walk, where the object is already in hand. Apps Script has per-execution
quota limits, and a large tree makes the difference material.
