# CLAUDE.md

Entry point for working in this repo. Kept short on purpose — detailed,
evolving material lives in `docs/`:

| File | What's in it |
|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | What DriveScribe is, project layout, public API surface |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Non-obvious conversion heuristics and why they were chosen |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Not-yet-built features |
| [docs/BUGS.md](docs/BUGS.md) | Known limitations / edge cases |
| [docs/TODO.md](docs/TODO.md) | Small, concrete, near-term action items |

## What DriveScribe is (one line)

A Google Apps Script library: recursively walks a Drive folder, returns
Docs as Markdown and Sheets as JSON (tabs included on both), full detail
in [docs/CONTEXT.md](docs/CONTEXT.md).

## Non-negotiable conventions

- **English everywhere in the repo**: code, comments, README, `docs/*.md`,
  commit messages. **Conversations with the user are in French.**
- **No module system.** Apps Script has none — every file in `src/` shares
  one global scope. No `import`/`export`.
- **Public API = plain top-level functions in `src/Code.ts`.** Everything
  else is an internal helper named with a trailing underscore (`walkFolder_`),
  which is the Apps Script convention for hiding a function from a
  consuming script's autocomplete when this project is added as a library.
- **TypeScript, type-checked with `tsc --noEmit`** (`npm run build`) before
  every `clasp push`. Types come from `@types/google-apps-script`.
- **Stay lite** — no runtime dependencies; this is Apps Script code, there's
  no bundler and no npm install at execution time.
- **Dev machine is Windows** (PowerShell primary).

## Before you start non-trivial work

1. Check [docs/BUGS.md](docs/BUGS.md) and [docs/ROADMAP.md](docs/ROADMAP.md)
   so you don't re-litigate a known limitation.
2. Check [docs/DECISIONS.md](docs/DECISIONS.md) for the reasoning behind
   the Markdown-conversion heuristics before changing them.
3. Run `npm run build` (tsc) before `clasp push`.
