/**
 * Shared types for DriveScribe. No import/export: Apps Script has no module
 * system, so every file in src/ shares one global scope by design.
 */

interface WalkOptions {
  /** Include non-Docs/Sheets files as metadata-only leaf nodes. Default: false. */
  includeFiles?: boolean;
  /** Safety guard against runaway recursion into deeply nested folder trees. */
  maxDepth?: number;
}

type DriveNodeType = 'folder' | 'document' | 'spreadsheet' | 'file';

interface DriveNode {
  id: string;
  name: string;
  type: DriveNodeType;
  url: string;
  /** ISO 8601. From Drive file/folder metadata. */
  createdAt: string;
  /** ISO 8601. From Drive file/folder metadata. */
  updatedAt: string;
  /** Present when type === 'folder'. */
  children?: DriveNode[];
  /** Present when type === 'document'. */
  tabs?: DocTab[];
  /** Present when type === 'spreadsheet'. */
  sheets?: SheetTab[];
}

interface DocTab {
  id: string;
  title: string;
  markdown: string;
  /** Docs tabs can nest; empty/absent when this tab has no children. */
  children?: DocTab[];
}

interface SheetTab {
  id: number;
  title: string;
  /** Array of row objects keyed by header when the first row looks like a
   *  header, otherwise the raw 2D array of values. See docs/DECISIONS.md. */
  data: Record<string, unknown>[] | unknown[][];
}

/** What DocumentApp alone can tell us — no Drive-level dates. */
interface DocContent {
  id: string;
  name: string;
  tabs: DocTab[];
}

/** DocContent plus Drive file metadata, as returned by the public API. */
interface DocResult extends DocContent {
  /** ISO 8601. From Drive file metadata. */
  createdAt: string;
  /** ISO 8601. From Drive file metadata. */
  updatedAt: string;
}

/** What SpreadsheetApp alone can tell us — no Drive-level dates. */
interface SheetContent {
  id: string;
  name: string;
  sheets: SheetTab[];
}

/** SheetContent plus Drive file metadata, as returned by the public API. */
interface SheetResult extends SheetContent {
  /** ISO 8601. From Drive file metadata. */
  createdAt: string;
  /** ISO 8601. From Drive file metadata. */
  updatedAt: string;
}
