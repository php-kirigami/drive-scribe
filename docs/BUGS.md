# Known limitations

Docs with exactly one (flat) tab go through Drive's native Markdown
export and don't hit most of the limitations below — see
[DECISIONS.md](DECISIONS.md). Everything in this section is about the
hand-rolled `bodyToMarkdown_` path, which only runs for multi-tab Docs.

- **Ordered-list numbering doesn't reset on interruption.** If the same
  Docs list is interrupted by another element (a paragraph, another list)
  and resumes later, numbering keeps incrementing instead of restarting.
  See [DECISIONS.md](DECISIONS.md).
- **Inline images become a bare `![image]` placeholder**, no alt text or
  extracted binary. See [ROADMAP.md](ROADMAP.md).
- **Headers, footers, footnotes, and table of contents elements are
  skipped** in `bodyToMarkdown_` (src/docs.ts) — not yet converted.

Applies regardless of the tab shape:

- **No per-tab/per-sheet timestamps.** `DocTab`/`SheetTab` have no
  `createdAt`/`updatedAt` — the Docs/Sheets services don't expose them.
  See [DECISIONS.md](DECISIONS.md).
