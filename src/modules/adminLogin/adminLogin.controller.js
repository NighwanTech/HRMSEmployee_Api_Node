import { adminLoginService } from './adminLogin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminLoginController = {
  /**
   * Handle admin login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const meta = {
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
      };
      const result = await adminLoginService.login(username, password, meta);
      return sendSuccess(res, 'Admin logged in successfully', result, 200);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Profile
   */
  async getProfile(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const profile = await adminLoginService.getProfile(adminId);
      return sendSuccess(res, 'Admin profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Profile
   */
  async updateProfile(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const updated = await adminLoginService.updateProfile(adminId, req.body);
      return sendSuccess(res, 'Admin profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change Password
   */
  async changePassword(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const { currentPassword, newPassword } = req.body;
      const result = await adminLoginService.changePassword(adminId, currentPassword, newPassword);
      return sendSuccess(res, 'Password changed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Active Sessions
   */
  async getSessions(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const currentToken = req.headers.authorization?.replace('Bearer ', '') || '';
      const sessions = await adminLoginService.getSessions(adminId, currentToken);
      return sendSuccess(res, 'Active sessions retrieved successfully', sessions);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Revoke single session
   */
  async revokeSession(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const sessionId = Number(req.params.id);
      const result = await adminLoginService.revokeSession(adminId, sessionId);
      return sendSuccess(res, 'Session revoked successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Revoke all other sessions
   */
  async revokeOtherSessions(req, res, next) {
    try {
      const adminId = req.user?.id || 1;
      const currentToken = req.headers.authorization?.replace('Bearer ', '') || '';
      const result = await adminLoginService.revokeOtherSessions(adminId, currentToken);
      return sendSuccess(res, 'All other sessions revoked successfully', result);
    } catch (error) {
      next(error);
    }
  },
};

export default adminLoginController;
