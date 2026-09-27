# Decisions

Non-obvious choices and the reasoning behind them, so they don't get
re-litigated or accidentally reverted.

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
