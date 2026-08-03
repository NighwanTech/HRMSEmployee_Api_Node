import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

/**
 * Converts a relative path (e.g., /uploads/images/file.png) to a base64 Data URL so Puppeteer can load it locally.
 * @param {string} relativePath
 * @returns {string} Base64 Data URL or empty string
 */
function getBase64DataUrl(relativePath) {
  if (!relativePath) return '';
  try {
    // Sanitize path to prevent directory traversal
    const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\))+/, '');
    const absolutePath = path.resolve(process.cwd(), normalized.replace(/^\//, ''));
    if (!fs.existsSync(absolutePath)) {
      console.warn(`File not found for base64 conversion: ${absolutePath}`);
      return '';
    }
    const fileBuffer = fs.readFileSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mime};base64,${fileBuffer.toString('base64')}`;
  } catch (err) {
    console.error(`Error converting file to base64: ${relativePath}`, err.message);
    return '';
  }
}

/**
 * HTML/CSS to Production PDF Generator using Puppeteer/Chromium.
 */
export const pdfGenerator = {
  /**
   * Generates a PDF file from HTML content.
   * @param {Object} params
   * @param {string} params.html - Document body HTML content (placeholders already replaced)
   * @param {string} params.outputPath - Absolute destination file path on server
   * @param {string} [params.headerImage] - Relative or absolute path to header image
   * @param {string} [params.footerImage] - Relative or absolute path to footer image
   * @param {Object} [params.options] - Custom layout/margins settings
   */
  async generatePdf({ html, outputPath, headerImage, footerImage, options = {} }) {
    let browser;
    try {
      // 1. Setup output directory
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 2. Prepare images by converting relative local paths to Base64 (so Puppeteer renders them instantly without network calls)
      const headerBase64 = headerImage ? getBase64DataUrl(headerImage) : '';
      const footerBase64 = footerImage ? getBase64DataUrl(footerImage) : '';

      // Convert any relative image paths inside the body HTML content to base64
      let processedHtml = html;
      const imgRegex = /src=["'](\/uploads\/[^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        const relativeSrc = match[1];
        const base64Url = getBase64DataUrl(relativeSrc);
        if (base64Url) {
          processedHtml = processedHtml.replace(relativeSrc, base64Url);
        }
      }

      // 3. Define page templates for Puppeteer's native headerTemplate/footerTemplate
      let headerTemplate = '<div></div>'; // Puppeteer requires a non-empty string or standard wrapper to hide default header
      if (headerBase64) {
        headerTemplate = `
          <div style="width: 100%; text-align: center; font-size: 10px; padding: 0 20mm; box-sizing: border-box;">
            <img src="${headerBase64}" style="max-height: 45px; width: auto; object-fit: contain;" />
          </div>
        `;
      }

      let footerTemplate = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-family: Arial, sans-serif; color: #777; padding: 0 20mm; box-sizing: border-box;">
          <span style="margin-top: 5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `;
      if (footerBase64) {
        footerTemplate = `
          <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-family: Arial, sans-serif; color: #777; padding: 0 20mm; box-sizing: border-box;">
            <img src="${footerBase64}" style="max-height: 45px; width: auto; object-fit: contain; margin-bottom: 5px;" />
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `;
      }

      // 4. Wrap body HTML in styling to support page breaks and typography
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #333;
              margin: 0;
              padding: 0;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #111;
              margin-top: 0;
            }
            p {
              margin: 0 0 10pt 0;
              text-align: justify;
            }
            ul, ol {
              margin: 0 0 10pt 0;
              padding-left: 20pt;
            }
            li {
              margin-bottom: 4pt;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15pt;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            /* Visual page break helpers */
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            /* Absolute-positioned page layout imports support */
            .pdf-page-container {
              position: relative;
              page-break-after: always;
              break-after: page;
              box-sizing: border-box;
            }
            .pdf-line {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${processedHtml}
        </body>
        </html>
      `;

      // 5. Launch headless browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'load' });

      // 6. Define margins
      const defaultMargins = {
        top: '25mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm',
      };

      const margins = { ...defaultMargins, ...options.margins };

      // 7. Render PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        landscape: false,
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: margins,
      });

      return true;
    } catch (err) {
      console.error('PDF Generation Error:', err);
      throw err;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
};
