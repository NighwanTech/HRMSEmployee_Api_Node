import { Router } from 'express';
import { templateMasterController } from './templateMaster.controller.js';
import { templateMasterValidation } from './templateMaster.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/template-masters:
 *   post:
 *     summary: Create a new template master definition
 *     tags: [TemplateMasters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, documentTypeId, templateCode, templateName]
 *             properties:
 *               companyId:
 *                 type: integer
 *                 example: 1
 *               documentTypeId:
 *                 type: integer
 *                 example: 1
 *               profileId:
 *                 type: integer
 *                 example: 1
 *               templateCode:
 *                 type: string
 *                 example: TMP-OFFER-STD-01
 *               templateName:
 *                 type: string
 *                 example: Standard Employment Offer Template
 *               description:
 *                 type: string
 *                 example: Standard company template for full-time hires
 *               version:
 *                 type: string
 *                 example: 1.0.0
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive, archived]
 *                 example: active
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Template master created successfully
 */
router.post(
  '/',
  validate(templateMasterValidation.createTemplate),
  templateMasterController.createTemplate
);

/**
 * @swagger
 * /api/v1/template-masters:
 *   get:
 *     summary: Get all active template master records
 *     tags: [TemplateMasters]
 *     responses:
 *       200:
 *         description: List of template masters retrieved successfully
 */
router.get('/', templateMasterController.getAllTemplates);

/**
 * @swagger
 * /api/v1/template-masters/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple template masters
 *     tags: [TemplateMasters]
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
 *                 example: Deprecated template versions removal
 *     responses:
 *       200:
 *         description: Bulk delete result
 */
router.post(
  '/bulk-delete',
  validate(templateMasterValidation.bulkDelete),
  templateMasterController.bulkDeleteTemplates
);

/**
 * @swagger
 * /api/v1/template-masters/{id}:
 *   get:
 *     summary: Get template master details by ID
 *     tags: [TemplateMasters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template master details retrieved successfully
 */
router.get(
  '/:id',
  validate(templateMasterValidation.getTemplateById),
  templateMasterController.getTemplateById
);

/**
 * @swagger
 * /api/v1/template-masters/{id}:
 *   put:
 *     summary: Update template master details
 *     tags: [TemplateMasters]
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
 *               templateName:
 *                 type: string
 *                 example: Revised Standard Offer Template
 *               version:
 *                 type: string
 *                 example: 1.1.0
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Template master updated successfully
 */
router.put(
  '/:id',
  validate(templateMasterValidation.updateTemplate),
  templateMasterController.updateTemplate
);

/**
 * @swagger
 * /api/v1/template-masters/{id}/status:
 *   patch:
 *     summary: Update template master status
 *     tags: [TemplateMasters]
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
 *                 enum: [draft, active, inactive, archived]
 *                 example: active
 *               remark:
 *                 type: string
 *                 example: Published template version
 *     responses:
 *       200:
 *         description: Template master status updated successfully
 */
router.patch(
  '/:id/status',
  validate(templateMasterValidation.updateStatus),
  templateMasterController.updateTemplateStatus
);

/**
 * @swagger
 * /api/v1/template-masters/{id}:
 *   delete:
 *     summary: Soft-delete single template master by ID
 *     tags: [TemplateMasters]
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
 *                 example: Template archived and removed
 *     responses:
 *       200:
 *         description: Template master soft deleted successfully
 */
router.delete(
  '/:id',
  validate(templateMasterValidation.softDelete),
  templateMasterController.softDeleteTemplate
);

export default router;
