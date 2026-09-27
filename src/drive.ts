/**
 * Recursive Drive folder walk. Docs and Sheets are inlined as converted
 * nodes; every other file type is either skipped or listed as metadata,
 * depending on options.includeFiles.
 */

function walkFolder_(
  folder: GoogleAppsScript.Drive.Folder,
  options: WalkOptions,
  depth = 0
): DriveNode {
  const node: DriveNode = {
    id: folder.getId(),
    name: folder.getName(),
    type: 'folder',
    url: folder.getUrl(),
    createdAt: folder.getDateCreated().toISOString(),
    updatedAt: folder.getLastUpdated().toISOString(),
    children: [],
  };

  if (options.maxDepth !== undefined && depth >= options.maxDepth) {
    return node;
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    node.children!.push(walkFolder_(subFolders.next(), options, depth + 1));
  }

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const child = convertFile_(file, options);
    if (child) node.children!.push(child);
  }

  return node;
}

function convertFile_(file: GoogleAppsScript.Drive.File, options: WalkOptions): DriveNode | null {
  const mime = file.getMimeType();
  const createdAt = file.getDateCreated().toISOString();
  const updatedAt = file.getLastUpdated().toISOString();

  if (mime === MimeType.GOOGLE_DOCS) {
    const result = convertDocument_(DocumentApp.openById(file.getId()));
    return {
      id: result.id,
      name: result.name,
      type: 'document',
      url: file.getUrl(),
      createdAt,
      updatedAt,
      tabs: result.tabs,
    };
  }

  if (mime === MimeType.GOOGLE_SHEETS) {
    const result = convertSpreadsheet_(SpreadsheetApp.openById(file.getId()));
    return {
      id: result.id,
      name: result.name,
      type: 'spreadsheet',
      url: file.getUrl(),
      createdAt,
      updatedAt,
      sheets: result.sheets,
    };
  }

  if (options.includeFiles) {
    return { id: file.getId(), name: file.getName(), type: 'file', url: file.getUrl(), createdAt, updatedAt };
  }

  return null;
}

/** Drive metadata for a file not already at hand as a File object. */
function fileDates_(fileId: string): { createdAt: string; updatedAt: string } {
  const file = DriveApp.getFileById(fileId);
  return { createdAt: file.getDateCreated().toISOString(), updatedAt: file.getLastUpdated().toISOString() };
}
