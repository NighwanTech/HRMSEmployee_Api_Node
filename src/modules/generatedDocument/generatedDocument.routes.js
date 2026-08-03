import { Router } from 'express';
import { generatedDocumentController } from './generatedDocument.controller.js';
import { generatedDocumentValidation } from './generatedDocument.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: GeneratedDocuments
 *   description: Document Generation — replace template content placeholders and render/download PDF files
 */

/**
 * @swagger
 * /api/v1/generated-documents:
 *   post:
 *     summary: 1. Generate a new document and render PDF
 *     tags: [GeneratedDocuments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [templateId, documentName, data]
 *             properties:
 *               templateId:
 *                 type: integer
 *                 example: 1
 *               documentName:
 *                 type: string
 *                 example: "Employee Offer Letter - Kumar Adarsh"
 *               data:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   employee_name: "Kumar Adarsh"
 *                   designation: "Software Developer"
 *                   joining_date: "02-Feb-2026"
 *                   salary: "7000"
 *     responses:
 *       201:
 *         description: Document generated and PDF rendered successfully
 *       400:
 *         description: Missing dynamic fields placeholder mappings
 *       404:
 *         description: Template master or active content layout not found
 *       500:
 *         description: PDF generation engine failure
 */
router.post(
  '/',
  validate(generatedDocumentValidation.generateDocument),
  generatedDocumentController.generateDocument
);

/**
 * @swagger
 * /api/v1/generated-documents/resolve-data:
 *   post:
 *     summary: 8. Resolve dynamic placeholders before document generation
 *     tags: [GeneratedDocuments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [templateId]
 *             properties:
 *               templateId:
 *                 type: integer
 *                 example: 1
 *               employeeId:
 *                 type: integer
 *                 example: 12
 *               companyId:
 *                 type: integer
 *                 example: 3
 *               profileId:
 *                 type: integer
 *                 example: 5
 *               manualData:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   custom_bonus: "10000"
 *     responses:
 *       200:
 *         description: Dynamic data resolved successfully
 *       400:
 *         description: Required dynamic data is missing or undefined placeholder configuration
 *       404:
 *         description: Reference entity not found
 */
router.post(
  '/resolve-data',
  validate(generatedDocumentValidation.resolveDocumentData),
  generatedDocumentController.resolveDocumentData
);

/**
 * @swagger
 * /api/v1/generated-documents:
 *   get:
 *     summary: 2. Get all active generated documents
 *     tags: [GeneratedDocuments]
 *     parameters:
 *       - in: query
 *         name: templateId
 *         schema:
 *           type: integer
 *         description: Filter by Template Master ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [GENERATING, COMPLETED, FAILED]
 *         description: Filter by generation status
 *     responses:
 *       200:
 *         description: List of generated documents retrieved successfully
 */
router.get(
  '/',
  validate(generatedDocumentValidation.getDocuments),
  generatedDocumentController.getDocuments
);

/**
 * @swagger
 * /api/v1/generated-documents/{id}:
 *   get:
 *     summary: 3. Get generated document details by ID
 *     tags: [GeneratedDocuments]
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
 *         description: Generated document not found
 */
router.get(
  '/:id',
  validate(generatedDocumentValidation.getDocumentById),
  generatedDocumentController.getDocumentById
);

/**
 * @swagger
 * /api/v1/generated-documents/{id}/download:
 *   get:
 *     summary: 5. Download generated PDF file
 *     tags: [GeneratedDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF file binary stream
 *       400:
 *         description: Document is not in COMPLETED state
 *       404:
 *         description: Document record or generated file not found
 */
router.get(
  '/:id/download',
  validate(generatedDocumentValidation.getDocumentById),
  generatedDocumentController.downloadDocument
);

/**
 * @swagger
 * /api/v1/generated-documents/{id}/preview:
 *   get:
 *     summary: 6. Preview generated PDF inline in browser
 *     tags: [GeneratedDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF file binary inline preview
 *       400:
 *         description: Document is not in COMPLETED state
 *       404:
 *         description: Document record or generated file not found
 */
router.get(
  '/:id/preview',
  validate(generatedDocumentValidation.getDocumentById),
  generatedDocumentController.previewDocument
);

/**
 * @swagger
 * /api/v1/generated-documents/{id}/regenerate:
 *   post:
 *     summary: 7. Re-run parsing and overwrite PDF file using stored data parameters
 *     tags: [GeneratedDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document regenerated and PDF file updated successfully
 *       404:
 *         description: Generated document or content not found
 */
router.post(
  '/:id/regenerate',
  validate(generatedDocumentValidation.getDocumentById),
  generatedDocumentController.regenerateDocument
);

/**
 * @swagger
 * /api/v1/generated-documents/{id}:
 *   delete:
 *     summary: 4. Soft-delete generated document log record
 *     tags: [GeneratedDocuments]
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
 *                 example: Outdated test generation log
 *     responses:
 *       200:
 *         description: Record soft-deleted successfully
 *       404:
 *         description: Record not found
 */
router.delete(
  '/:id',
  validate(generatedDocumentValidation.softDelete),
  generatedDocumentController.softDeleteDocument
);

export default router;
