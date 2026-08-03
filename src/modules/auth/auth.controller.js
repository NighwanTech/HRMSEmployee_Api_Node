import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export const authController = {
  /**
   * Handle user registration
   */
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      return sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, 'User logged in successfully', result, 200);
    } catch (error) {
      next(error);
    }
  },
};
