import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

/**
 * Converts a file path to a base64 Data URL so Puppeteer can embed it without any network calls.
 * Handles: server-relative (/uploads/...), Windows absolute paths, http/https URLs, already-base64.
 */
function getBase64DataUrl(inputPath) {
  if (!inputPath) return '';
  try {
    // Already a base64 Data URL — return as-is
    if (inputPath.startsWith('data:image')) return inputPath;

    let absolutePath = '';

    if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
      // http://localhost:5000/uploads/images/file.png → resolve from cwd
      const parsed = new URL(inputPath);
      absolutePath = path.resolve(process.cwd(), parsed.pathname.replace(/^[/\\]/, ''));
    } else {
      // Strip any leading / or \ first (handles Windows drive-relative edge case)
      const stripped = inputPath.replace(/^[/\\]/, '');
      if (path.isAbsolute(stripped) && stripped.includes(':')) {
        // True Windows absolute path with drive letter: C:\Users\...
        absolutePath = stripped;
      } else {
        // Server-relative: uploads/images/file.png  or  /uploads/images/file.png
        absolutePath = path.resolve(process.cwd(), stripped);
      }
    }

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[pdfGenerator] File not found: ${absolutePath}`);
      return '';
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
    const mime =
      ext === 'jpg' || ext === 'jpeg' ? 'jpeg'
      : ext === 'png' ? 'png'
      : ext === 'svg' ? 'svg+xml'
      : ext;
    return `data:image/${mime};base64,${fileBuffer.toString('base64')}`;
  } catch (err) {
    console.error(`[pdfGenerator] Error converting to base64: ${inputPath}`, err.message);
    return '';
  }
}

/**
 * Replace all <img src="..."> in HTML body with base64-embedded versions
 * so Puppeteer never needs to make network requests for inline images.
 */
function embedInlineImages(html) {
  if (!html) return html;
  return html.replace(/<img([^>]+)src=["']([^"']+)["']/g, (match, attrs, src) => {
    if (src.startsWith('data:image')) return match; // already embedded
    const b64 = getBase64DataUrl(src);
    return b64 ? `<img${attrs}src="${b64}"` : match;
  });
}

/**
 * Enterprise PDF Generator — pixel-perfect match to the Live A4 Document Preview.
 *
 * Design contract (matches the template-builder preview exactly):
 *  - Header image: full-width, natural height (w-full h-auto object-cover)
 *  - Body: 32px padding on all sides  (matching Tailwind p-8)
 *  - Footer image: full-width, natural height (w-full h-auto object-cover)
 *  - No Puppeteer native header/footer (those are tiny/centred — not what the user designed)
 *  - Font: same as prose-slate defaults (16px base, line-height 1.6)
 *  - Inline styles from Tiptap (font-size, color, text-align, font-family) are preserved
 */
export const pdfGenerator = {
  /**
   * Generates a PDF file from HTML template content.
   * @param {Object}  params
   * @param {string}  params.html         - Body HTML (placeholders already substituted)
   * @param {string}  params.outputPath   - Absolute destination path for the PDF
   * @param {string}  [params.headerImage] - Server-relative or absolute path to header image
   * @param {string}  [params.footerImage] - Server-relative or absolute path to footer image
   * @param {Object}  [params.options]    - Extra layout options (reserved for future use)
   */
  async generatePdf({ html, outputPath, headerImage, footerImage, options = {} }) {
    let browser;
    try {
      // ── 1. Ensure output directory exists ──────────────────────────────────
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // ── 2. Convert header/footer images to base64 ─────────────────────────
      const headerBase64 = getBase64DataUrl(headerImage);
      const footerBase64 = getBase64DataUrl(footerImage);

      // ── 3. Embed inline images in body HTML ────────────────────────────────
      const processedHtml = embedInlineImages(html);

      // ── 4. Build header/footer HTML blocks ─────────────────────────────────
      //    These are placed INSIDE the page body at the top and bottom — exactly
      //    like the A4 preview panel in the template builder (full-width, natural height).
      const headerBlock = headerBase64
        ? `<div class="page-header-img"><img src="${headerBase64}" alt="Header" /></div>`
        : '';

      const footerBlock = footerBase64
        ? `<div class="page-footer-img"><img src="${footerBase64}" alt="Footer" /></div>`
        : '';

      // ── 5. Compose full HTML document ──────────────────────────────────────
      //    CSS mirrors Tailwind's prose-slate + the editor's p-8 padding + text-sm.
      //    @page sets A4 with zero margin so header/footer images bleed edge-to-edge.
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* ── Page layout ──────────────────────────────────────────────────── */
    @page {
      size: A4 portrait;
      margin: 0;           /* Zero margin — images fill edge-to-edge like the preview */
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background: #ffffff;
    }

    /* ── One A4 page wrapper ──────────────────────────────────────────── */
    .a4-page {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    /* ── Header / Footer images — full-width natural height ──────────── */
    .page-header-img,
    .page-footer-img {
      width: 100%;
      line-height: 0;
      display: block;
      flex-shrink: 0;
    }
    .page-header-img img,
    .page-footer-img img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }

    /* ── Spacer placeholder when no image (matches preview placeholder) ─ */
    .page-header-placeholder,
    .page-footer-placeholder {
      width: 100%;
      padding: 10px 0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    /* ── Document body — matches p-8 (32px) + prose-slate ────────────── */
    .doc-body {
      flex: 1;
      padding: 32px;        /* matches Tailwind p-8 used in the live preview */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, "Helvetica Neue", sans-serif;
      font-size: 14px;      /* matches text-sm in the editor */
      line-height: 1.6;
      color: #1e293b;       /* slate-800 */
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* ── Typography — mirrors Tailwind prose-slate ────────────────────── */
    h1 {
      font-size: 1.875em;   /* text-3xl */
      font-weight: 800;
      line-height: 1.2;
      margin: 0 0 0.75em 0;
      color: #0f172a;
    }
    h2 {
      font-size: 1.5em;     /* text-2xl */
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 0.65em 0;
      color: #0f172a;
    }
    h3 {
      font-size: 1.25em;    /* text-xl */
      font-weight: 700;
      line-height: 1.4;
      margin: 0 0 0.55em 0;
      color: #0f172a;
    }
    h4 { font-size: 1.125em; font-weight: 700; margin: 0 0 0.5em 0; color: #0f172a; }
    h5 { font-size: 1em;     font-weight: 700; margin: 0 0 0.4em 0; color: #0f172a; }
    h6 { font-size: 0.875em; font-weight: 700; margin: 0 0 0.4em 0; color: #0f172a; }

    p {
      margin: 0 0 0.75em 0;
      line-height: 1.6;
    }
    /* Preserve empty paragraphs as blank lines (matches editor behaviour) */
    p:empty::before,
    p:has(> br:only-child)::before {
      content: "\\00a0";
      display: inline;
    }

    strong, b { font-weight: 700; }
    em, i { font-style: italic; }
    u  { text-decoration: underline; }
    s  { text-decoration: line-through; }
    sup { font-size: 0.75em; vertical-align: super; line-height: 0; }
    sub { font-size: 0.75em; vertical-align: sub;   line-height: 0; }

    ul, ol {
      margin: 0 0 0.75em 0;
      padding-left: 1.5em;
    }
    li { margin-bottom: 0.25em; line-height: 1.6; }

    /* ── Tables ───────────────────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5em 0 1em 0;
      table-layout: auto;
      font-size: inherit;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
      line-height: 1.5;
    }
    th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #0f172a;
    }
    tr:nth-child(even) td { background-color: #f8fafc; }

    /* ── Inline images inside editor content ─────────────────────────── */
    .doc-body img {
      max-width: 100%;
      height: auto;
      display: inline-block;
    }

    /* ── Horizontal rule ─────────────────────────────────────────────── */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1em 0;
    }

    /* ── Blockquote ──────────────────────────────────────────────────── */
    blockquote {
      margin: 0 0 0.75em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #6366f1;
      color: #475569;
      font-style: italic;
    }

    /* ── Code ────────────────────────────────────────────────────────── */
    code {
      font-family: "Courier New", Courier, monospace;
      font-size: 0.875em;
      background: #f1f5f9;
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
    pre { background: #f1f5f9; padding: 1em; border-radius: 6px; overflow: auto; }
    pre code { background: none; padding: 0; }

    /* ── Page break markers ──────────────────────────────────────────── */
    .page-break,
    [data-page-break="true"] {
      page-break-after: always !important;
      break-after: page !important;
      height: 0;
      display: block;
    }

    /* ── Text alignment (Tiptap text-align extension) ────────────────── */
    [style*="text-align: left"]   { text-align: left !important; }
    [style*="text-align: center"] { text-align: center !important; }
    [style*="text-align: right"]  { text-align: right !important; }
    [style*="text-align: justify"]{ text-align: justify !important; }
  </style>
</head>
<body>
  <div class="a4-page">
    ${headerBlock}
    <div class="doc-body">
      ${processedHtml}
    </div>
    ${footerBlock}
  </div>
</body>
</html>`;

      // ── 6. Launch headless Chromium ────────────────────────────────────────
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
        ],
      });

      const page = await browser.newPage();

      // Set viewport to A4 width at 96 DPI (794px ≈ 210mm)
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

      await page.setContent(fullHtml, { waitUntil: ['load', 'networkidle0'] });

      // ── 7. Render PDF ─────────────────────────────────────────────────────
      //    margin: 0 because header/footer images are in-body (edge-to-edge)
      await page.pdf({
        path: outputPath,
        format: 'A4',
        landscape: false,
        printBackground: true,
        displayHeaderFooter: false,   // ← OFF: we handle header/footer in-body
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: true,
      });

      console.log(`[pdfGenerator] PDF saved → ${outputPath}`);
      return true;
    } catch (err) {
      console.error('[pdfGenerator] Generation failed:', err);
      throw err;
    } finally {
      if (browser) await browser.close();
    }
  },
};
