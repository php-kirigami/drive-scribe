# TODO

- [ ] Set the `DRIVE_SCRIBE_TOKEN` script property (Apps Script editor ->
      Project Settings -> Script Properties) — the web app returns
      `{ ok: false, error: "..." }` for every request until this is set.
- [ ] Test the web app endpoint end-to-end (a `curl`/`fetch` against the
      deployed `/exec` URL with the token) before wiring up the Kirigami
      plugin side.
- [ ] Test against a real Drive folder with nested Docs tabs, at least one
      ordered + unordered list, a table, and a Sheet with a header row —
      no automated test harness exists yet (Apps Script has no local
      runtime to unit-test against).
- [ ] Share the Script ID with anyone else who needs to add this as a
      library (they'll need at least viewer access to the script itself).
