import { adminLoginService } from './adminLogin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminLoginController = {
  /**
   * Handle admin login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await adminLoginService.login(username, password);
      return sendSuccess(res, 'Admin logged in successfully', result, 200);
    } catch (error) {
      next(error);
    }
  },
};
