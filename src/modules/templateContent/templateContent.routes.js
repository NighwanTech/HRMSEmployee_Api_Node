import { Router } from 'express';
import { templateContentController } from './templateContent.controller.js';
import { templateContentValidation } from './templateContent.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { uploadImage } from '../../middleware/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/template-contents:
 *   post:
 *     summary: 1. Create Template Content
 *     tags: [TemplateContent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [templateId, contentType]
 *             properties:
 *               templateId:
 *                 type: integer
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 enum: [EDITOR, PDF]
 *                 example: EDITOR
 *               content:
 *                 type: string
 *                 example: "<p>Dear {{employee_name}}, Welcome to our company.</p>"
 *               headerImage:
 *                 type: string
 *                 example: "/uploads/images/img-12345.png"
 *               footerImage:
 *                 type: string
 *                 example: "/uploads/images/img-67890.png"
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive]
 *                 example: draft
 *     responses:
 *       201:
 *         description: Template content created successfully
 */
router.post(
  '/',
  validate(templateContentValidation.createContent),
  templateContentController.createContent
);

/**
 * @swagger
 * /api/v1/template-contents/template/{templateId}:
 *   get:
 *     summary: 2. Get Template Content by Template ID
 *     tags: [TemplateContent]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template content retrieved successfully
 */
router.get(
  '/template/:templateId',
  validate(templateContentValidation.getContentByTemplateId),
  templateContentController.getContentByTemplateId
);

/**
 * @swagger
 * /api/v1/template-contents/{id}/upload:
 *   post:
 *     summary: 5. Upload Header or Footer Image (Phase 3)
 *     tags: [TemplateContent]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [type, file]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [header, footer]
 *                 example: header
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Header or Footer image uploaded successfully
 */
router.post(
  '/:id/upload',
  uploadImage.single('file'),
  validate(templateContentValidation.uploadImage),
  templateContentController.uploadImage
);

/**
 * @swagger
 * /api/v1/template-contents/{id}/image:
 *   delete:
 *     summary: 6. Remove Header or Footer Image (Phase 3)
 *     tags: [TemplateContent]
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
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [header, footer]
 *                 example: header
 *     responses:
 *       200:
 *         description: Header or Footer image removed successfully
 */
router.delete(
  '/:id/image',
  validate(templateContentValidation.removeImage),
  templateContentController.removeImage
);

/**
 * @swagger
 * /api/v1/template-contents/{id}:
 *   put:
 *     summary: 3. Update Template Content
 *     tags: [TemplateContent]
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
 *               content:
 *                 type: string
 *                 example: "<p>Updated template HTML/JSON content</p>"
 *               headerImage:
 *                 type: string
 *                 example: "/uploads/images/new-logo.png"
 *               footerImage:
 *                 type: string
 *                 example: "/uploads/images/new-footer.png"
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive]
 *                 example: active
 *     responses:
 *       200:
 *         description: Template content updated successfully
 *   patch:
 *     summary: 3. Patch Template Content
 *     tags: [TemplateContent]
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
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template content updated successfully
 */
router
  .route('/:id')
  .put(
    validate(templateContentValidation.updateContent),
    templateContentController.updateContent
  )
  .patch(
    validate(templateContentValidation.updateContent),
    templateContentController.updateContent
  )
  /**
   * @swagger
   * /api/v1/template-contents/{id}:
   *   delete:
   *     summary: 4. Delete Template Content
   *     tags: [TemplateContent]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Template content deleted successfully
   */
  .delete(
    validate(templateContentValidation.deleteContent),
    templateContentController.deleteContent
  );

export default router;
