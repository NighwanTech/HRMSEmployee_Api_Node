import { userService } from './user.service.js';
import { sendSuccess } from '../../utils/response.js';

export const userController = {
  /**
   * Get authenticated user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      return sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all active users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(res, 'Users list retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, 'User details retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update current authenticated user profile
   */
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(req.user.id, req.body, req.user?.id);
      return sendSuccess(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soft delete a single user record
   */
  async softDeleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const { deletedRemarks } = req.body;
      const result = await userService.softDeleteUser(id, deletedRemarks, req.user?.id);
      return sendSuccess(res, 'User soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk soft delete multiple users
   */
  async bulkDeleteUsers(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await userService.bulkDeleteUsers(ids, deletedRemarks, req.user?.id);
      return sendSuccess(res, `${result.affectedCount} user(s) bulk soft-deleted successfully`, result);
    } catch (error) {
      next(error);
    }
  },
};
