import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authValidation } from './auth.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/signup', validate(authValidation.signup), authController.signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(authValidation.login), authController.login);

export default router;
