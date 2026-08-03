import { User } from './user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const userService = {
  /**
   * Fetch all registered users (excluding soft-deleted)
   */
  async getAllUsers() {
    return await User.findAll({
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Fetch user details by ID
   */
  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  /**
   * Update user details
   */
  async updateUser(id, updateData, updatedBy = null) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    await user.update(updateData);
    return user;
  },

  /**
   * Soft delete a single user record
   */
  async softDeleteUser(id, deletedRemarks = null, deletedBy = null) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await user.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return user;
  },

  /**
   * Bulk soft delete users by array of IDs
   */
  async bulkDeleteUsers(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await User.update(
      {
        isDeleted: true,
        isActive: false,
        deletedRemarks,
        updatedBy: deletedBy,
      },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
          isDeleted: false,
        },
      }
    );

    return { affectedCount };
  },
};
