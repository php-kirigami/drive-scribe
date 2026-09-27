# Roadmap

Not yet scheduled — ideas and features that could be built later.

- **Image extraction for the multi-tab fallback path.** `bodyToMarkdown_`
  (used only when a Doc has more than one tab, see docs/DECISIONS.md)
  still emits a bare `![image]` placeholder; the native-export path
  already gets images as base64 data URIs for free.
- **Configurable Markdown escaping.** `escapeMarkdown_` is unconditional
  today (see docs/DECISIONS.md); an option to disable it, or to escape
  more conservatively, could help callers who post-process the output.
- **Header/footer/footnote conversion** in `bodyToMarkdown_` (multi-tab
  fallback path only).
- **Formula preservation for Sheets.** `sheetToJson` currently reads
  computed values only (`getValues()`); an option to also return formulas
  (`getFormulas()`) could be useful for round-tripping.
- **Incremental walk.** Skip re-converting files whose `updatedAt` is
  older than a caller-supplied cutoff, for cheap re-syncs of a large tree.
