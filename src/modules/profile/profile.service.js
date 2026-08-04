import { Profile } from './profile.model.js';
import { Company } from '../company/company.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const profileService = {
  /**
   * Create a new profile record
   */
  async createProfile(profileData, createdBy = null) {
    const company = await Company.findByPk(profileData.companyId);
    if (!company) {
      throw new ApiError(404, `Company with ID ${profileData.companyId} does not exist`);
    }

    const existingCode = await Profile.findOne({
      where: {
        companyId: profileData.companyId,
        profileCode: profileData.profileCode,
        isDeleted: false,
      },
    });

    if (existingCode) {
      throw new ApiError(
        400,
        `Profile code '${profileData.profileCode}' already exists for this company`
      );
    }

    return await Profile.create({
      ...profileData,
      createdBy,
    });
  },

  /**
   * Fetch all active profiles with optional Company details
   */
  async getAllProfiles() {
    return await Profile.findAll({
      where: {
        isDeleted: false,
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Fetch profile by ID
   */
  async getProfileById(id) {
    const profile = await Profile.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
      ],
    });

    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }
    return profile;
  },

  /**
   * Update profile details
   */
  async updateProfile(id, updateData, updatedBy = null) {
    const profile = await Profile.findByPk(id);
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    if (updateData.companyId) {
      const company = await Company.findByPk(updateData.companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${updateData.companyId} does not exist`);
      }
    }

    await profile.update({
      ...updateData,
      updatedBy,
    });

    return profile;
  },

  /**
   * Soft delete single profile record
   */
  async softDeleteProfile(id, deletedRemarks = null, deletedBy = null) {
    const profile = await Profile.findByPk(id);
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    await profile.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return profile;
  },

  /**
   * Bulk soft delete multiple profiles
   */
  async bulkDeleteProfiles(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await Profile.update(
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
