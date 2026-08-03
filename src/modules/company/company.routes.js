import { Router } from 'express';
import { companyController } from './company.controller.js';
import { companyValidation } from './company.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyCode, companyName]
 *             properties:
 *               companyCode:
 *                 type: string
 *                 example: TECH001
 *               companyName:
 *                 type: string
 *                 example: Acme Corporation
 *               legalName:
 *                 type: string
 *                 example: Acme Pvt Ltd
 *               displayName:
 *                 type: string
 *                 example: Acme
 *               companyType:
 *                 type: string
 *                 example: Private Limited
 *               industry:
 *                 type: string
 *                 example: Information Technology
 *               officialEmail:
 *                 type: string
 *                 example: contact@acme.com
 *               phoneNumber:
 *                 type: string
 *                 example: +919876543210
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended]
 *                 example: active
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post('/', validate(companyValidation.createCompany), companyController.createCompany);

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get list of all active companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /api/v1/companies/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple companies
 *     tags: [Companies]
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
 *                 example: Batch delete inactive companies
 *     responses:
 *       200:
 *         description: Bulk delete result
 */
router.post('/bulk-delete', validate(companyValidation.bulkDelete), companyController.bulkDeleteCompanies);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   get:
 *     summary: Get company details by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 */
router.get('/:id', validate(companyValidation.getCompanyById), companyController.getCompanyById);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   put:
 *     summary: Update company details
 *     tags: [Companies]
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
 *               companyName:
 *                 type: string
 *                 example: Acme Global Pvt Ltd
 *               website:
 *                 type: string
 *                 example: https://acme.com
 *     responses:
 *       200:
 *         description: Company updated successfully
 */
router.put('/:id', validate(companyValidation.updateCompany), companyController.updateCompany);

/**
 * @swagger
 * /api/v1/companies/{id}/status:
 *   patch:
 *     summary: Update company status
 *     tags: [Companies]
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
 *                 enum: [active, inactive, pending, suspended]
 *                 example: inactive
 *               remark:
 *                 type: string
 *                 example: Temporary suspension
 *     responses:
 *       200:
 *         description: Company status updated successfully
 */
router.patch('/:id/status', validate(companyValidation.updateStatus), companyController.updateCompanyStatus);

/**
 * @swagger
 * /api/v1/companies/{id}:
 *   delete:
 *     summary: Soft-delete single company by ID
 *     tags: [Companies]
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
 *                 example: Company soft deleted per administrative request
 *     responses:
 *       200:
 *         description: Company soft deleted successfully
 */
router.delete('/:id', validate(companyValidation.softDelete), companyController.softDeleteCompany);

export default router;
