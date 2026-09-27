/**
 * Document -> Markdown conversion, recursing through Docs tabs.
 */

function convertDocument_(doc: GoogleAppsScript.Document.Document): DocContent {
  const tabs = doc.getTabs().map(convertTab_);
  return { id: doc.getId(), name: doc.getName(), tabs };
}

function convertTab_(tab: GoogleAppsScript.Document.Tab): DocTab {
  const documentTab = tab.asDocumentTab();
  const markdown = bodyToMarkdown_(documentTab.getBody());
  const children = tab.getChildTabs().map(convertTab_);

  return {
    id: tab.getId(),
    title: tab.getTitle(),
    markdown,
    children: children.length ? children : undefined,
  };
}

const HEADING_PREFIXES_: { [key: string]: string } = {
  TITLE: '# ',
  SUBTITLE: '## ',
  HEADING1: '# ',
  HEADING2: '## ',
  HEADING3: '### ',
  HEADING4: '#### ',
  HEADING5: '##### ',
  HEADING6: '###### ',
  NORMAL: '',
};

function bodyToMarkdown_(body: GoogleAppsScript.Document.Body): string {
  const lines: string[] = [];
  // Ordered-list numbering per (listId, nesting level). Numbering is not
  // reset when a list is interrupted by another element — see docs/BUGS.md.
  const listCounters: Record<string, number> = {};

  for (let i = 0; i < body.getNumChildren(); i++) {
    const child = body.getChild(i);

    switch (child.getType()) {
      case DocumentApp.ElementType.PARAGRAPH:
        lines.push(paragraphToMarkdown_(child.asParagraph()));
        break;
      case DocumentApp.ElementType.LIST_ITEM:
        lines.push(listItemToMarkdown_(child.asListItem(), listCounters));
        break;
      case DocumentApp.ElementType.TABLE:
        lines.push(tableToMarkdown_(child.asTable()));
        break;
      default:
        // Table of contents, headers/footers, and other rarer element
        // types are not converted yet — see docs/ROADMAP.md.
        break;
    }
  }

  return lines.join('\n\n');
}

function paragraphToMarkdown_(paragraph: GoogleAppsScript.Document.Paragraph): string {
  const prefix = HEADING_PREFIXES_[paragraph.getHeading().toString()] || '';
  return prefix + elementsToMarkdown_(paragraph);
}

function listItemToMarkdown_(
  item: GoogleAppsScript.Document.ListItem,
  counters: Record<string, number>
): string {
  const level = item.getNestingLevel();
  const key = `${item.getListId()}_${level}`;
  const indent = '  '.repeat(level);
  const isOrdered = item.getGlyphType().toString().indexOf('NUMBER') !== -1;

  let marker: string;
  if (isOrdered) {
    counters[key] = (counters[key] || 0) + 1;
    marker = `${counters[key]}.`;
  } else {
    marker = '-';
  }

  return `${indent}${marker} ${elementsToMarkdown_(item)}`;
}

function tableToMarkdown_(table: GoogleAppsScript.Document.Table): string {
  const rows: string[][] = [];

  for (let r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    const cells: string[] = [];
    for (let c = 0; c < row.getNumCells(); c++) {
      cells.push(cellToMarkdown_(row.getCell(c)));
    }
    rows.push(cells);
  }

  if (rows.length === 0) return '';

  const [header, ...body] = rows;
  const separator = header.map(() => '---');

  return [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...body.map(cells => `| ${cells.join(' | ')} |`),
  ].join('\n');
}

function cellToMarkdown_(cell: GoogleAppsScript.Document.TableCell): string {
  const parts: string[] = [];

  for (let i = 0; i < cell.getNumChildren(); i++) {
    const child = cell.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      parts.push(elementsToMarkdown_(child.asParagraph()));
    }
  }

  // GFM tables can't hold newlines, and a literal pipe would break columns.
  return parts.join('<br>').replace(/\|/g, '\\|');
}

function elementsToMarkdown_(
  container: GoogleAppsScript.Document.Paragraph | GoogleAppsScript.Document.ListItem
): string {
  let result = '';

  for (let i = 0; i < container.getNumChildren(); i++) {
    const child = container.getChild(i);

    switch (child.getType()) {
      case DocumentApp.ElementType.TEXT:
        result += textToMarkdown_(child.asText());
        break;
      case DocumentApp.ElementType.INLINE_IMAGE:
        // Image extraction (as a data URI or exported blob) is a roadmap
        // item — see docs/ROADMAP.md.
        result += '![image]';
        break;
      case DocumentApp.ElementType.HORIZONTAL_RULE:
        result += '\n\n---';
        break;
      default:
        break;
    }
  }

  return result;
}

function textToMarkdown_(text: GoogleAppsScript.Document.Text): string {
  const content = text.getText();
  if (!content) return '';

  const indices = text.getTextAttributeIndices();
  indices.push(content.length);

  let result = '';
  for (let i = 0; i < indices.length - 1; i++) {
    const start = indices[i];
    const end = indices[i + 1];
    const chunk = content.slice(start, end);
    if (!chunk) continue;

    let segment = escapeMarkdown_(chunk);
    if (text.isBold(start)) segment = `**${segment}**`;
    if (text.isItalic(start)) segment = `*${segment}*`;

    const linkUrl = text.getLinkUrl(start);
    if (linkUrl) segment = `[${segment}](${linkUrl})`;

    result += segment;
  }

  return result;
}

function escapeMarkdown_(text: string): string {
  return text.replace(/([\\`*_[\]])/g, '\\$1');
}
