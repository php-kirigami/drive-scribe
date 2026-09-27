/**
 * Spreadsheet -> JSON conversion. Each sheet (tab) becomes its own entry.
 */

function convertSpreadsheet_(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): SheetContent {
  const sheets = ss.getSheets().map(convertSheetTab_);
  return { id: ss.getId(), name: ss.getName(), sheets };
}

function convertSheetTab_(sheet: GoogleAppsScript.Spreadsheet.Sheet): SheetTab {
  const values = sheet.getDataRange().getValues();

  if (values.length === 0) {
    return { id: sheet.getSheetId(), title: sheet.getName(), data: [] };
  }

  const header = values[0];
  const rows = values.slice(1);

  if (!looksLikeHeader_(header)) {
    return { id: sheet.getSheetId(), title: sheet.getName(), data: values };
  }

  const data = rows.map(row => {
    const record: Record<string, unknown> = {};
    header.forEach((key, i) => {
      record[String(key)] = row[i];
    });
    return record;
  });

  return { id: sheet.getSheetId(), title: sheet.getName(), data };
}

/** A row "looks like a header" when every cell is a non-empty string. */
function looksLikeHeader_(row: unknown[]): boolean {
  return row.length > 0 && row.every(cell => typeof cell === 'string' && cell.trim() !== '');
}
