import { Router } from 'express';
import { adminLoginController } from './adminLogin.controller.js';
import { adminLoginValidation } from './adminLogin.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Public login route
router.post('/login', validate(adminLoginValidation.login), adminLoginController.login);

// Profile & Security routes (authenticated)
router.get('/profile', authenticate, adminLoginController.getProfile);
router.put('/profile', authenticate, adminLoginController.updateProfile);
router.put('/change-password', authenticate, adminLoginController.changePassword);

// Device Sessions routes
router.get('/sessions', authenticate, adminLoginController.getSessions);
router.delete('/sessions/:id', authenticate, adminLoginController.revokeSession);
router.post('/sessions/revoke-others', authenticate, adminLoginController.revokeOtherSessions);

export default router;
