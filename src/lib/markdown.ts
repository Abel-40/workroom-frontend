// Minimal, dependency-free markdown handling for AI-generated text (AI
// Assistant answers, AI Health Check summaries) and for the inline styling
// left inside already-saved Info Portal blocks (see the backend's
// pages/markdown.py, which splits AI answers into heading/paragraph/list
// blocks but deliberately leaves inline styling for display time). Not a
// CommonMark implementation -- just the subset these AI responses actually
// use: ATX headings, a line that's entirely bold as a pseudo-heading,
// -/*/N. list items, and inline bold/italic/code.

export interface MarkdownBlock {
  type: "heading" | "paragraph" | "list";
  text?: string;
  items?: string[];
}

const HEADING_RE = /^#{1,6}\s+(.*)$/;
const BOLD_ONLY_LINE_RE = /^\*\*(.+?)\*\*:?$/;
const LIST_ITEM_RE = /^(?:[-*]|\d+\.)\s+(.*)$/;

// Splits raw markdown-ish text into display blocks -- the client-side twin
// of the backend's pages/markdown.py::markdown_to_blocks, used for live
// rendering of text that hasn't been (and may never be) saved as a page.
export function splitMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join("\n").trim() });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  for (const raw of (text || "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = HEADING_RE.exec(line);
    const boldOnly = BOLD_ONLY_LINE_RE.exec(line);
    const listItem = LIST_ITEM_RE.exec(line);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: heading[1]!.trim() });
    } else if (boldOnly) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: boldOnly[1]!.trim() });
    } else if (listItem) {
      flushParagraph();
      listItems.push(listItem[1]!.trim());
    } else {
      flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks.length ? blocks : [{ type: "paragraph", text: (text || "").trim() }];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escapes first, then formats -- so any HTML-like content inside AI text
// (or a saved page block) can never inject markup, only the bold/italic/
// code spans this function itself adds are ever real tags.
export function renderInlineMarkdown(text: string): string {
  let html = escapeHtml(text || "");
  // bg-white, not bg-page: both call sites (AI Assistant answer bubble, AI
  // Health Check summary) already render on a bg-page background, where a
  // same-color chip would be invisible.
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-white px-1 py-0.5 text-[0.85em]">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<![*_\w])[*_]([^*_]+)[*_](?![*_\w])/g, "<em>$1</em>");
  return html;
}
