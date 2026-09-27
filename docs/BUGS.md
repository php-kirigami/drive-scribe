# Known limitations

- **Ordered-list numbering doesn't reset on interruption.** If the same
  Docs list is interrupted by another element (a paragraph, another list)
  and resumes later, numbering keeps incrementing instead of restarting.
  See [DECISIONS.md](DECISIONS.md).
- **Inline images become a bare `![image]` placeholder**, no alt text or
  extracted binary. See [ROADMAP.md](ROADMAP.md).
- **No per-tab/per-sheet timestamps.** `DocTab`/`SheetTab` have no
  `createdAt`/`updatedAt` — the Docs/Sheets services don't expose them.
  See [DECISIONS.md](DECISIONS.md).
- **Headers, footers, footnotes, and table of contents elements are
  skipped** in `bodyToMarkdown_` (src/docs.ts) — not yet converted.
