import { Router } from 'express';
import { dynamicFieldController } from './dynamicField.controller.js';
import { dynamicFieldValidation } from './dynamicField.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DynamicFields
 *   description: Dynamic Field Master — define reusable template placeholder fields
 */

/**
 * @swagger
 * /api/v1/dynamic-fields:
 *   post:
 *     summary: Create a new dynamic field
 *     tags: [DynamicFields]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fieldKey, fieldName]
 *             properties:
 *               companyId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               documentTypeId:
 *                 type: integer
 *                 nullable: true
 *                 description: Optional — field can be reused across document types
 *                 example: 2
 *               fieldKey:
 *                 type: string
 *                 description: Globally unique, lowercase snake_case. Used as {{field_key}} in templates.
 *                 example: employee_name
 *               fieldName:
 *                 type: string
 *                 maxLength: 150
 *                 example: Employee Name
 *               fieldType:
 *                 type: string
 *                 enum: [TEXT, NUMBER, DATE, CURRENCY, EMAIL, PHONE, BOOLEAN]
 *                 default: TEXT
 *                 example: TEXT
 *               dataSource:
 *                 type: string
 *                 enum: [EMPLOYEE, COMPANY, PROFILE, SYSTEM, MANUAL]
 *                 default: MANUAL
 *                 example: EMPLOYEE
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Full legal name of the employee
 *               placeholder:
 *                 type: string
 *                 example: Enter employee full name
 *               defaultValue:
 *                 type: string
 *                 example: ""
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               isSystem:
 *                 type: boolean
 *                 example: false
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               displayOrder:
 *                 type: integer
 *                 example: 1
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: []
 *               validationRules:
 *                 type: object
 *                 example: {}
 *               remark:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Dynamic field created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: field_key already exists (globally unique conflict)
 */
router.post(
  '/',
  validate(dynamicFieldValidation.createDynamicField),
  dynamicFieldController.createDynamicField
);

/**
 * @swagger
 * /api/v1/dynamic-fields:
 *   get:
 *     summary: Get all active dynamic fields (with optional filters and search)
 *     tags: [DynamicFields]
 *     parameters:
 *       - in: query
 *         name: document_type_id
 *         schema:
 *           type: integer
 *         description: Filter by Document Type ID
 *       - in: query
 *         name: field_type
 *         schema:
 *           type: string
 *           enum: [TEXT, NUMBER, DATE, CURRENCY, EMAIL, PHONE, BOOLEAN]
 *         description: Filter by field type
 *       - in: query
 *         name: data_source
 *         schema:
 *           type: string
 *           enum: [EMPLOYEE, COMPANY, PROFILE, SYSTEM, MANUAL]
 *         description: Filter by data source
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial match search on field_name, field_key, description
 *     responses:
 *       200:
 *         description: List of dynamic fields retrieved successfully
 */
router.get(
  '/',
  validate(dynamicFieldValidation.getAllDynamicFields),
  dynamicFieldController.getAllDynamicFields
);

/**
 * @swagger
 * /api/v1/dynamic-fields/document-type/{documentTypeId}:
 *   get:
 *     summary: Get all dynamic fields scoped to a specific document type
 *     tags: [DynamicFields]
 *     parameters:
 *       - in: path
 *         name: documentTypeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document type dynamic fields retrieved successfully
 */
router.get(
  '/document-type/:documentTypeId',
  validate(dynamicFieldValidation.getByDocumentType),
  dynamicFieldController.getFieldsByDocumentTypeId
);

/**
 * @swagger
 * /api/v1/dynamic-fields/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple dynamic fields
 *     tags: [DynamicFields]
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
 *                 example: [1, 2, 3]
 *               deletedRemarks:
 *                 type: string
 *                 example: Deprecated batch removal
 *     responses:
 *       200:
 *         description: Bulk soft-delete result
 */
router.post(
  '/bulk-delete',
  validate(dynamicFieldValidation.bulkDelete),
  dynamicFieldController.bulkDeleteDynamicFields
);

/**
 * @swagger
 * /api/v1/dynamic-fields/{id}:
 *   get:
 *     summary: Get dynamic field details by ID
 *     tags: [DynamicFields]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dynamic field details
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  validate(dynamicFieldValidation.getDynamicFieldById),
  dynamicFieldController.getDynamicFieldById
);

/**
 * @swagger
 * /api/v1/dynamic-fields/{id}:
 *   put:
 *     summary: Update dynamic field
 *     tags: [DynamicFields]
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
 *               fieldName:
 *                 type: string
 *                 example: Updated Employee Name
 *               fieldType:
 *                 type: string
 *                 enum: [TEXT, NUMBER, DATE, CURRENCY, EMAIL, PHONE, BOOLEAN]
 *                 example: TEXT
 *               dataSource:
 *                 type: string
 *                 enum: [EMPLOYEE, COMPANY, PROFILE, SYSTEM, MANUAL]
 *                 example: EMPLOYEE
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               displayOrder:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Dynamic field updated successfully
 *       404:
 *         description: Not found
 *       409:
 *         description: field_key already exists (globally unique conflict)
 */
router.put(
  '/:id',
  validate(dynamicFieldValidation.updateDynamicField),
  dynamicFieldController.updateDynamicField
);

/**
 * @swagger
 * /api/v1/dynamic-fields/{id}:
 *   delete:
 *     summary: Soft-delete a dynamic field by ID
 *     tags: [DynamicFields]
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
 *                 example: Field removed — no longer needed
 *     responses:
 *       200:
 *         description: Dynamic field soft-deleted successfully
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  validate(dynamicFieldValidation.softDelete),
  dynamicFieldController.softDeleteDynamicField
);

export default router;
