import { Router } from 'express';
import { adminLoginController } from './adminLogin.controller.js';
import { adminLoginValidation } from './adminLogin.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Authenticate admin with username & password
 *     tags: [AdminLogin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(adminLoginValidation.login), adminLoginController.login);

export default router;
