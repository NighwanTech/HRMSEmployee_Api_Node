import fs from 'fs';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Parses and extracts text content from PDF with coordinates, sorting them
 * from top-to-bottom and left-to-right to preserve layout structures.
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<{ pages: Array<{ pageNumber: number, width: number, height: number, htmlContent: string }>, pageCount: number }>}
 */
async function parsePdfWithLayout(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  
  const instance = new pdfParse.PDFParse(uint8Array);
  const doc = await instance.load();
  
  const pageCount = doc.numPages;
  const pages = [];
  
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.25 }); // scale slightly to fit standard editor viewports
    const textContent = await page.getTextContent();
    
    const width = viewport.width;
    const height = viewport.height;
    
    // Sort text items by vertical position descending (top-to-bottom) and horizontal ascending (left-to-right)
    const items = textContent.items.map(item => {
      const scaleX = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);
      const scaleY = Math.sqrt(item.transform[2] * item.transform[2] + item.transform[3] * item.transform[3]);
      
      // Convert standard PDF coordinates (origin at bottom-left) to browser HTML absolute coordinates (origin at top-left)
      const x = item.transform[4] * 1.25;
      const y = height - (item.transform[5] * 1.25);
      
      return {
        text: item.str,
        x,
        y,
        fontSize: scaleY * 1.25,
        width: item.width * 1.25,
        height: scaleY * 1.25,
        hasEOL: item.hasEOL
      };
    });
    
    // Sort top-to-bottom primarily, left-to-right secondarily
    items.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > 8) return yDiff; // merge close elements on the same baseline
      return a.x - b.x;
    });
    
    // Group items into rows/lines to make text selection and editing more cohesive
    const lines = [];
    let currentLine = [];
    let currentY = null;
    
    for (const item of items) {
      if (currentY === null || Math.abs(item.y - currentY) > 8) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [item];
        currentY = item.y;
      } else {
        currentLine.push(item);
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // Build HTML representation that keeps visual alignment while maintaining raw text content flow
    let html = `<div class="pdf-page-container" style="position: relative; width: ${Math.round(width)}px; height: ${Math.round(height)}px; background: white; border: 1px solid #ddd; margin: 0 auto 30px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; box-sizing: border-box; overflow: hidden;">`;
    html += `<!-- Page ${pageNum} Boundaries -->\n`;
    
    for (const line of lines) {
      // Find the bounding box/position of the constructed line
      const minX = Math.min(...line.map(i => i.x));
      const minY = Math.min(...line.map(i => i.y));
      const maxHeight = Math.max(...line.map(i => i.height));
      const totalWidth = line.reduce((sum, item) => sum + item.width, 0) + (line.length - 1) * 4;
      const combinedText = line.map(item => item.text).join(' ').trim();
      const avgFontSize = Math.round(line.reduce((sum, item) => sum + item.fontSize, 0) / line.length);
      
      if (!combinedText) continue;

      // Check if combinedText is a stringified image JSON or raw base64 image data
      let processedContent = combinedText;
      if (combinedText.includes('data:image/') || (combinedText.includes('"src"') && combinedText.includes('base64'))) {
        const srcMatch = combinedText.match(/"src"\s*:\s*"([^"]+)"/) || combinedText.match(/(data:image\/[a-zA-Z+]+;base64,[^\s"'}]+)/);
        if (srcMatch && srcMatch[1]) {
          const alignMatch = combinedText.match(/"align"\s*:\s*"([^"]+)"/);
          const align = alignMatch ? alignMatch[1] : 'left';
          const alignStyle = align === 'center' ? 'margin: 0 auto;' : align === 'right' ? 'margin: 0 0 0 auto;' : 'margin: 0;';
          processedContent = `<img src="${srcMatch[1]}" style="max-width: 100%; height: auto; display: block; ${alignStyle}" />`;
        }
      }
      
      // Determine simple font traits based on size heuristics
      let fontWeight = 'normal';
      let textDecoration = 'none';
      if (avgFontSize > 14) fontWeight = 'bold';
      
      // Check for lists or bullet indicators
      const isBullet = combinedText.startsWith('•') || combinedText.startsWith('-') || /^\d+\./.test(combinedText);
      const paddingLeft = isBullet ? '15px' : '0px';

      // Output absolute-positioned divs containing inline blocks to preserve x layout and tiptap editing support
      html += `  <div class="pdf-line" style="position: absolute; left: ${Math.round(minX)}px; top: ${Math.round(minY - maxHeight)}px; min-width: ${Math.round(totalWidth)}px; min-height: ${Math.round(maxHeight)}px; font-size: ${avgFontSize}px; font-weight: ${fontWeight}; text-decoration: ${textDecoration}; padding-left: ${paddingLeft}; white-space: nowrap; line-height: 1;">`;
      html += processedContent;
      html += `</div>\n`;
    }
    
    html += `</div>`;
    
    pages.push({
      pageNumber: pageNum,
      width: Math.round(width),
      height: Math.round(height),
      htmlContent: html
    });
  }
  
  return {
    pages,
    pageCount
  };
}

/**
 * Main Document Converter Helper
 */
export const documentConverter = {
  /**
   * Convert file to HTML content and return pages info
   * @param {string} filePath - Absolute file path
   * @param {string} fileType - 'PDF', 'DOCX', or 'DOC'
   * @returns {Promise<{ convertedContent: string, pageCount: number }>}
   */
  async convertToHtml(filePath, fileType) {
    if (fileType === 'PDF') {
      const { pages, pageCount } = await parsePdfWithLayout(filePath);
      // Combine all absolute page HTML structures
      const htmlContent = pages.map(p => p.htmlContent).join('\n');
      return {
        convertedContent: htmlContent,
        pageCount
      };
    } 
    
    if (fileType === 'DOCX') {
      const result = await mammoth.convertToHtml({ path: filePath });
      const rawHtml = result.value || '';
      // Wrapper inside a standard relative single page block for DOCX
      const wrappedHtml = `<div class="docx-page" data-page="1" style="position: relative; border: 1px solid #ddd; padding: 40px; margin: 0 auto 30px auto; background: white; max-width: 800px; min-height: 1000px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; line-height: 1.6;">${rawHtml}</div>`;
      return {
        convertedContent: wrappedHtml,
        pageCount: 1
      };
    }

    if (fileType === 'DOC') {
      throw new Error('Direct .DOC format conversion is not natively supported. Please convert it to DOCX or PDF first.');
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  }
};
