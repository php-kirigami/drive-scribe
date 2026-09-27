/**
 * DriveScribe public API. These are the only functions exposed when this
 * project is added as an Apps Script library — everything else is a
 * trailing-underscore helper, hidden from a consuming script's autocomplete
 * by Apps Script convention.
 */

/**
 * Recursively walks a Drive folder and returns its hierarchy. Docs are
 * converted to Markdown (per tab) and Sheets to JSON (per sheet).
 */
function walk(folderId: string, options?: WalkOptions): DriveNode {
  return walkFolder_(DriveApp.getFolderById(folderId), options || {});
}

/** Converts a single Google Doc to Markdown, one entry per tab. */
function docToMarkdown(documentId: string): DocResult {
  const result = convertDocument_(DocumentApp.openById(documentId));
  return { ...result, ...fileDates_(documentId) };
}

/** Converts a single Google Sheet to JSON, one entry per sheet. */
function sheetToJson(spreadsheetId: string): SheetResult {
  const result = convertSpreadsheet_(SpreadsheetApp.openById(spreadsheetId));
  return { ...result, ...fileDates_(spreadsheetId) };
}
