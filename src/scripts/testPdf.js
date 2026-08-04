import path from 'path';
import fs from 'fs';
import { pdfGenerator } from '../utils/pdfGenerator.js';

const outputPath = path.resolve(process.cwd(), 'uploads/generated-documents/test-preview-match.pdf');

const sampleHtml = `
<h2 style="text-align: center;">OFFER OF EMPLOYMENT</h2>
<p>Dear <strong>Rahul Sharma</strong>,</p>
<p>We are pleased to offer you the position of <strong>Software Development Engineer Intern</strong> at <strong>Nighwan Technology Private Limited</strong>.</p>
<table style="width:100%; border-collapse:collapse;">
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #cbd5e1;"><strong>Department</strong></td>
      <td style="padding:8px; border:1px solid #cbd5e1;">Software Engineering</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #cbd5e1;"><strong>Location</strong></td>
      <td style="padding:8px; border:1px solid #cbd5e1;">Corporate HQ</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #cbd5e1;"><strong>Start Date</strong></td>
      <td style="padding:8px; border:1px solid #cbd5e1;">2026-09-01</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #cbd5e1;"><strong>CTC</strong></td>
      <td style="padding:8px; border:1px solid #cbd5e1;">INR 10,000 / month</td>
    </tr>
  </tbody>
</table>
<p>Please confirm your acceptance by signing and returning this letter within 5 business days.</p>
<p style="text-align: right;">Sincerely,<br/><strong>HR Department</strong><br/>Nighwan Technology Pvt. Ltd.</p>
`;

try {
  await pdfGenerator.generatePdf({
    html: sampleHtml,
    outputPath,
    headerImage: '/uploads/images/img-1785824987282-423233065.png',
    footerImage: '/uploads/images/img-1785824994475-699160597.png',
  });
  const stat = fs.statSync(outputPath);
  console.log('SUCCESS! PDF generated:', stat.size, 'bytes');
  console.log('Output:', outputPath);
} catch (err) {
  console.error('FAILED:', err.message);
  process.exit(1);
}
