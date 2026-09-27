# Roadmap

Not yet scheduled — ideas and features that could be built later.

- **Image extraction.** Export inline images as data URIs or Drive-hosted
  blobs instead of the current `![image]` placeholder.
- **Configurable Markdown escaping.** `escapeMarkdown_` is unconditional
  today (see docs/DECISIONS.md); an option to disable it, or to escape
  more conservatively, could help callers who post-process the output.
- **Header/footer/footnote conversion** in `bodyToMarkdown_`.
- **Formula preservation for Sheets.** `sheetToJson` currently reads
  computed values only (`getValues()`); an option to also return formulas
  (`getFormulas()`) could be useful for round-tripping.
- **Incremental walk.** Skip re-converting files whose `updatedAt` is
  older than a caller-supplied cutoff, for cheap re-syncs of a large tree.
