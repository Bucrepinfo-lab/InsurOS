/**
 * A small PDF writer — PURE, no dependencies.
 *
 * Enough for the documents people download from InsurOS: a title, short
 * paragraphs, label/value pairs, tables that wrap onto new pages, and JPEG
 * images (a signature, a photo). A4, Helvetica. Text outside Latin-1 is shown
 * as "?" because the built-in PDF fonts cannot draw it.
 */
export type PdfBlock =
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string; size?: number; muted?: boolean }
  | { kind: "pairs"; rows: [string, string][] }
  | { kind: "table"; headers: string[]; rows: string[][]; widths?: number[] }
  | { kind: "image"; jpeg: Uint8Array; width: number; height: number; caption?: string }
  | { kind: "space"; height: number };

export interface PdfDocument {
  title: string;
  subtitle?: string;
  blocks: PdfBlock[];
  /** Printed at the foot of every page. */
  footer?: string;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** Helvetica average character width as a share of the font size (good enough to wrap). */
const charWidth = (size: number, bold = false) => size * (bold ? 0.56 : 0.5);

function latin1(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

/** PDF text is Latin-1 (WinAnsi): one byte per character, never UTF-8. */
const bytesOf = (text: string) => Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);

const escape = (text: string) => latin1(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/** Break text into lines that fit a width at a font size. */
export function wrap(text: string, width: number, size: number, bold = false): string[] {
  const max = Math.max(1, Math.floor(width / charWidth(size, bold)));
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (word.length > max) {
        if (line) lines.push(line);
        for (let i = 0; i < word.length; i += max) lines.push(word.slice(i, i + max));
        line = "";
        continue;
      }
      const next = line ? `${line} ${word}` : word;
      if (next.length > max) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

interface Page {
  ops: string[];
  images: { name: string; index: number }[];
}

export function makePdf(doc: PdfDocument): Uint8Array {
  const images: { data: Uint8Array; width: number; height: number }[] = [];
  const pages: Page[] = [];
  let page: Page = { ops: [], images: [] };
  let y = 0;

  const text = (x: number, yy: number, value: string, size: number, bold = false, grey = false) =>
    page.ops.push(`${grey ? "0.4 0.42 0.45 rg" : "0.07 0.1 0.16 rg"} BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td (${escape(value)}) Tj ET`);
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    page.ops.push(`0.85 0.86 0.88 RG 0.6 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);

  const newPage = () => {
    page = { ops: [], images: [] };
    pages.push(page);
    y = PAGE_H - MARGIN;
  };
  const need = (height: number) => {
    if (y - height < MARGIN + 24) newPage();
  };

  newPage();
  for (const l of wrap(doc.title, CONTENT_W, 18, true)) {
    text(MARGIN, y - 18, l, 18, true);
    y -= 24;
  }
  if (doc.subtitle) {
    for (const l of wrap(doc.subtitle, CONTENT_W, 10)) {
      text(MARGIN, y - 10, l, 10, false, true);
      y -= 14;
    }
  }
  y -= 10;

  for (const block of doc.blocks) {
    switch (block.kind) {
      case "space":
        y -= block.height;
        break;
      case "heading":
        need(30);
        y -= 8;
        text(MARGIN, y - 13, block.text, 13, true);
        y -= 22;
        break;
      case "text": {
        const size = block.size ?? 10.5;
        for (const l of wrap(block.text, CONTENT_W, size)) {
          need(size + 4);
          text(MARGIN, y - size, l, size, false, block.muted);
          y -= size + 4;
        }
        y -= 4;
        break;
      }
      case "pairs":
        for (const [label, value] of block.rows) {
          const valueLines = wrap(value, CONTENT_W * 0.62, 10.5);
          need(valueLines.length * 14 + 4);
          text(MARGIN, y - 10.5, label, 10.5, false, true);
          valueLines.forEach((l, i) => text(MARGIN + CONTENT_W * 0.36, y - 10.5 - i * 14, l, 10.5));
          y -= valueLines.length * 14 + 4;
        }
        y -= 4;
        break;
      case "table": {
        const widths = block.widths ?? block.headers.map(() => 1);
        const total = widths.reduce((a, b) => a + b, 0);
        const cols = widths.map((w) => (w / total) * CONTENT_W);
        const drawRow = (cells: string[], bold: boolean) => {
          const wrapped = cells.map((cell, i) => wrap(cell, cols[i]! - 6, 9, bold).slice(0, 4));
          const height = Math.max(...wrapped.map((w) => w.length)) * 11 + 6;
          need(height);
          let x = MARGIN;
          wrapped.forEach((cellLines, i) => {
            cellLines.forEach((l, j) => text(x, y - 10 - j * 11, l, 9, bold));
            x += cols[i]!;
          });
          y -= height;
          line(MARGIN, y + 2, MARGIN + CONTENT_W, y + 2);
        };
        drawRow(block.headers, true);
        for (const row of block.rows) {
          if (y - 20 < MARGIN + 24) {
            newPage();
            drawRow(block.headers, true);
          }
          drawRow(row, false);
        }
        y -= 6;
        break;
      }
      case "image": {
        const scale = Math.min(1, CONTENT_W / block.width, 260 / block.height);
        const w = block.width * scale;
        const h = block.height * scale;
        need(h + (block.caption ? 18 : 6));
        images.push({ data: block.jpeg, width: block.width, height: block.height });
        const name = `Im${images.length}`;
        page.images.push({ name, index: images.length - 1 });
        page.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${MARGIN} ${(y - h).toFixed(2)} cm /${name} Do Q`);
        y -= h + 4;
        if (block.caption) {
          text(MARGIN, y - 9, block.caption, 9, false, true);
          y -= 14;
        }
        y -= 4;
        break;
      }
    }
  }

  // Assemble: catalog, pages, fonts, images, then each page and its content.
  const objects: (string | Uint8Array)[] = [];
  const add = (body: string | Uint8Array) => (objects.push(body), objects.length);
  const catalog = add("");
  const pagesObj = add("");
  const font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const imageObjs = images.map((image) => {
    const head = `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.data.length} >>\nstream\n`;
    const tail = "\nendstream";
    const bytes = new Uint8Array(head.length + image.data.length + tail.length);
    bytes.set(bytesOf(head), 0);
    bytes.set(image.data, head.length);
    bytes.set(bytesOf(tail), head.length + image.data.length);
    return add(bytes);
  });
  const pageObjs: number[] = [];
  pages.forEach((p, index) => {
    const footer = `${doc.footer ? `${doc.footer}   ` : ""}Page ${index + 1} of ${pages.length}`;
    const ops = [...p.ops, `0.4 0.42 0.45 rg BT /F1 8 Tf ${MARGIN} 24 Td (${escape(footer)}) Tj ET`].join("\n");
    const content = add(`<< /Length ${bytesOf(ops).length} >>\nstream\n${ops}\nendstream`);
    const xobjects = p.images.map((image) => `/${image.name} ${imageObjs[image.index]} 0 R`).join(" ");
    pageObjs.push(
      add(
        `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >>${
          xobjects ? ` /XObject << ${xobjects} >>` : ""
        } >> /Contents ${content} 0 R >>`
      )
    );
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageObjs.map((n) => `${n} 0 R`).join(" ")}] /Count ${pageObjs.length} >>`;

  const encoder = { encode: bytesOf };
  const chunks: Uint8Array[] = [encoder.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  let length = chunks[0]!.length;
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(length);
    const head = encoder.encode(`${index + 1} 0 obj\n`);
    const content = typeof body === "string" ? encoder.encode(body) : body;
    const tail = encoder.encode("\nendobj\n");
    chunks.push(head, content, tail);
    length += head.length + content.length + tail.length;
  });
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info << /Title (${escape(doc.title)}) /Producer (InsurOS) >> >>\nstartxref\n${length}\n%%EOF\n`;
  chunks.push(encoder.encode(xref));
  const out = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/** Width and height of a JPEG from its bytes, or null. */
export function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1]!;
    const size = (bytes[i + 2]! << 8) + bytes[i + 3]!;
    if (marker >= 0xc0 && marker <= 0xc3) return { height: (bytes[i + 5]! << 8) + bytes[i + 6]!, width: (bytes[i + 7]! << 8) + bytes[i + 8]! };
    i += 2 + size;
  }
  return null;
}
