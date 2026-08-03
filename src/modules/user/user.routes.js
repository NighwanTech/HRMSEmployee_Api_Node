import { Router } from 'express';
import { userController } from './user.controller.js';
import { userValidation } from './user.validation.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

// Protect all user routes with JWT authentication middleware
router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               remark:
 *                 type: string
 *                 example: Updated profile name
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', validate(userValidation.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Batch account cleanup
 *     responses:
 *       200:
 *         description: Bulk delete operation result
 */
router.post('/bulk-delete', validate(userValidation.bulkDelete), userController.bulkDeleteUsers);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get list of all active users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/:id', validate(userValidation.getUserById), userController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Soft-delete single user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Account deactivated upon user request
 *     responses:
 *       200:
 *         description: User soft deleted successfully
 */
router.delete('/:id', validate(userValidation.softDelete), userController.softDeleteUser);

export default router;
