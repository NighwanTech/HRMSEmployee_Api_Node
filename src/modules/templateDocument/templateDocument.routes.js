import { Router } from 'express';
import { templateDocumentController } from './templateDocument.controller.js';
import { templateDocumentValidation } from './templateDocument.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { uploadDocument } from '../../middleware/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TemplateDocuments
 *   description: Upload and convert existing files (PDF/DOCX/DOC) to editable templates
 */

/**
 * @swagger
 * /api/v1/template-documents/upload:
 *   post:
 *     summary: 1. Upload an existing document (PDF/DOCX/DOC)
 *     tags: [TemplateDocuments]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [template_id, file]
 *             properties:
 *               template_id:
 *                 type: integer
 *                 description: ID of target Template Master
 *                 example: 1
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, DOCX, DOC) up to 10MB
 *     responses:
 *       201:
 *         description: Document uploaded and conversion initialized in background
 *       400:
 *         description: Invalid input or unsupported format
 *       404:
 *         description: Template ID does not exist
 */
router.post(
  '/upload',
  uploadDocument.single('file'),
  validate(templateDocumentValidation.uploadDocument),
  templateDocumentController.uploadDocument
);

/**
 * @swagger
 * /api/v1/template-documents/template/{templateId}:
 *   get:
 *     summary: 2. Get uploaded documents for a Template Master
 *     tags: [TemplateDocuments]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of documents retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get(
  '/template/:templateId',
  validate(templateDocumentValidation.getDocumentsByTemplateId),
  templateDocumentController.getDocumentsByTemplateId
);

/**
 * @swagger
 * /api/v1/template-documents/{id}:
 *   get:
 *     summary: 3. Get document details (status, page count, converted content)
 *     tags: [TemplateDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document details retrieved successfully
 *       404:
 *         description: Document not found
 */
router.get(
  '/:id',
  validate(templateDocumentValidation.getDocumentById),
  templateDocumentController.getDocumentById
);

/**
 * @swagger
 * /api/v1/template-documents/{id}/convert:
 *   post:
 *     summary: 4. Trigger / retry document conversion manually
 *     tags: [TemplateDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversion completed successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Conversion process failed
 */
router.post(
  '/:id/convert',
  validate(templateDocumentValidation.convertDocument),
  templateDocumentController.convertDocument
);

/**
 * @swagger
 * /api/v1/template-documents/{id}/original:
 *   get:
 *     summary: 6. Serve / download original uploaded document
 *     tags: [TemplateDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document file streamed successfully
 *       404:
 *         description: Document or file not found
 */
router.get(
  '/:id/original',
  validate(templateDocumentValidation.getDocumentById),
  templateDocumentController.downloadOriginal
);

/**
 * @swagger
 * /api/v1/template-documents/{id}:
 *   delete:
 *     summary: 5. Soft-delete document
 *     tags: [TemplateDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deletedRemarks:
 *                 type: string
 *                 example: Outdated file upload
 *     responses:
 *       200:
 *         description: Document soft-deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete(
  '/:id',
  validate(templateDocumentValidation.softDelete),
  templateDocumentController.softDeleteDocument
);

export default router;
