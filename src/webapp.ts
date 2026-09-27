/**
 * Web app entry point. A Kirigami plugin (or any other non-Apps-Script
 * caller) runs in Node during a build, not inside Apps Script, so it can't
 * add this project as a library — libraries only work between two Apps
 * Script projects. This `doGet` gives it a plain HTTP endpoint instead,
 * returning the same data as the library API, as JSON.
 *
 * Deployed with executeAs: "USER_DEPLOYING" / access: "ANYONE_ANONYMOUS"
 * (see appsscript.json) — it runs as the script owner regardless of who
 * calls it, and access control is entirely the shared-secret check below,
 * not Google's own auth. That keeps the Node side simple: no OAuth dance,
 * just an HTTP GET with a token.
 *
 * Configuring the secret is a one-time, code-free step: Apps Script editor
 * -> Project Settings -> Script Properties -> add DRIVE_SCRIBE_TOKEN.
 * Rotating it later needs no redeploy, just a property edit.
 *
 * Apps Script web apps always return HTTP 200 to the caller regardless of
 * what happens inside — there's no way to set a real HTTP status code from
 * doGet. Errors are therefore signaled in the JSON body (`ok: false`), and
 * callers must check that field rather than the HTTP status.
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  try {
    assertAuthorized_(e);
    return jsonResponse_({ ok: true, result: dispatch_(e) });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

function assertAuthorized_(e: GoogleAppsScript.Events.DoGet): void {
  const expected = PropertiesService.getScriptProperties().getProperty('DRIVE_SCRIBE_TOKEN');
  if (!expected) {
    throw new Error('Set the DRIVE_SCRIBE_TOKEN script property before using the web app.');
  }
  if (e.parameter.token !== expected) {
    throw new Error('Unauthorized.');
  }
}

function dispatch_(e: GoogleAppsScript.Events.DoGet): unknown {
  switch (e.parameter.action) {
    case 'walk':
      return dispatchWalk_(e);
    case 'docToMarkdown':
      return dispatchDocToMarkdown_(e);
    case 'sheetToJson':
      return dispatchSheetToJson_(e);
    default:
      throw new Error(`Unknown action "${e.parameter.action}". Expected walk, docToMarkdown, or sheetToJson.`);
  }
}

function dispatchWalk_(e: GoogleAppsScript.Events.DoGet): DriveNode {
  if (!e.parameter.folderId) throw new Error('Missing folderId.');

  const options: WalkOptions = {};
  if (e.parameter.includeFiles) options.includeFiles = e.parameter.includeFiles === 'true';
  if (e.parameter.maxDepth) options.maxDepth = Number(e.parameter.maxDepth);

  return walk(e.parameter.folderId, options);
}

function dispatchDocToMarkdown_(e: GoogleAppsScript.Events.DoGet): DocResult {
  if (!e.parameter.documentId) throw new Error('Missing documentId.');
  return docToMarkdown(e.parameter.documentId);
}

function dispatchSheetToJson_(e: GoogleAppsScript.Events.DoGet): SheetResult {
  if (!e.parameter.spreadsheetId) throw new Error('Missing spreadsheetId.');
  return sheetToJson(e.parameter.spreadsheetId);
}

function jsonResponse_(body: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
