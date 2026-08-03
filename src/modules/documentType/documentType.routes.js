import { Router } from 'express';
import { documentTypeController } from './documentType.controller.js';
import { documentTypeValidation } from './documentType.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/document-types:
 *   post:
 *     summary: Create a new document type
 *     tags: [DocumentTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, documentTypeCode, documentTypeName]
 *             properties:
 *               companyId:
 *                 type: integer
 *                 example: 1
 *               documentTypeCode:
 *                 type: string
 *                 example: DT-OFFER-01
 *               documentTypeName:
 *                 type: string
 *                 example: Employment Offer Letter
 *               description:
 *                 type: string
 *                 example: Template for generating candidate offer letters
 *               category:
 *                 type: string
 *                 example: HR & Recruitment
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, archived]
 *                 example: active
 *     responses:
 *       201:
 *         description: Document type created successfully
 */
router.post(
  '/',
  validate(documentTypeValidation.createDocumentType),
  documentTypeController.createDocumentType
);

/**
 * @swagger
 * /api/v1/document-types:
 *   get:
 *     summary: Get all active document types
 *     tags: [DocumentTypes]
 *     responses:
 *       200:
 *         description: List of document types retrieved successfully
 */
router.get('/', documentTypeController.getAllDocumentTypes);

/**
 * @swagger
 * /api/v1/document-types/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple document types
 *     tags: [DocumentTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               deletedRemarks:
 *                 type: string
 *                 example: Batch removal of legacy document categories
 *     responses:
 *       200:
 *         description: Bulk delete result
 */
router.post(
  '/bulk-delete',
  validate(documentTypeValidation.bulkDelete),
  documentTypeController.bulkDeleteDocumentTypes
);

/**
 * @swagger
 * /api/v1/document-types/{id}:
 *   get:
 *     summary: Get document type details by ID
 *     tags: [DocumentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document type details retrieved successfully
 */
router.get(
  '/:id',
  validate(documentTypeValidation.getDocumentTypeById),
  documentTypeController.getDocumentTypeById
);

/**
 * @swagger
 * /api/v1/document-types/{id}:
 *   put:
 *     summary: Update document type details
 *     tags: [DocumentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentTypeName:
 *                 type: string
 *                 example: Revised Offer Letter Template
 *               category:
 *                 type: string
 *                 example: Talent Acquisition
 *     responses:
 *       200:
 *         description: Document type updated successfully
 */
router.put(
  '/:id',
  validate(documentTypeValidation.updateDocumentType),
  documentTypeController.updateDocumentType
);

/**
 * @swagger
 * /api/v1/document-types/{id}/status:
 *   patch:
 *     summary: Update document type status
 *     tags: [DocumentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, archived]
 *                 example: archived
 *               remark:
 *                 type: string
 *                 example: Deprecated version
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch(
  '/:id/status',
  validate(documentTypeValidation.updateStatus),
  documentTypeController.updateDocumentTypeStatus
);

/**
 * @swagger
 * /api/v1/document-types/{id}:
 *   delete:
 *     summary: Soft-delete single document type by ID
 *     tags: [DocumentTypes]
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
 *                 example: Document type no longer in use
 *     responses:
 *       200:
 *         description: Document type soft deleted successfully
 */
router.delete(
  '/:id',
  validate(documentTypeValidation.softDelete),
  documentTypeController.softDeleteDocumentType
);

export default router;
