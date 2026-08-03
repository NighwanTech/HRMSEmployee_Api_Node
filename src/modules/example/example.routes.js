import { Router } from 'express';
import { exampleController } from './example.controller.js';
import { exampleValidation } from './example.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/examples:
 *   post:
 *     summary: Create an example item
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sample Title
 *               description:
 *                 type: string
 *                 example: Sample Description
 *               remark:
 *                 type: string
 *                 example: Initial creation remark
 *     responses:
 *       201:
 *         description: Example item created
 */
router.post('/', validate(exampleValidation.create), exampleController.createExample);

/**
 * @swagger
 * /api/v1/examples:
 *   get:
 *     summary: Get all example items
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: List of example items
 */
router.get('/', exampleController.getAllExamples);

/**
 * @swagger
 * /api/v1/examples/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete example items
 *     tags: [Example]
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
 *                 example: Deprecated entries cleanup
 *     responses:
 *       200:
 *         description: Bulk delete result
 */
router.post('/bulk-delete', validate(exampleValidation.bulkDelete), exampleController.bulkDeleteExamples);

/**
 * @swagger
 * /api/v1/examples/{id}:
 *   delete:
 *     summary: Soft-delete single example item by ID
 *     tags: [Example]
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
 *                 example: No longer relevant
 *     responses:
 *       200:
 *         description: Example item soft deleted successfully
 */
router.delete('/:id', validate(exampleValidation.softDelete), exampleController.softDeleteExample);

export default router;
