import { profileService } from './profile.service.js';
import { sendSuccess } from '../../utils/response.js';

export const profileController = {
  /**
   * POST /api/v1/profiles
   */
  async createProfile(req, res, next) {
    try {
      const profile = await profileService.createProfile(req.body, req.user?.id);
      return sendSuccess(res, 'Profile created successfully', profile, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/profiles
   */
  async getAllProfiles(req, res, next) {
    try {
      const profiles = await profileService.getAllProfiles();
      return sendSuccess(res, 'Profiles list retrieved successfully', profiles);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/profiles/:id
   */
  async getProfileById(req, res, next) {
    try {
      const profile = await profileService.getProfileById(req.params.id);
      return sendSuccess(res, 'Profile details retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/profiles/:id
   */
  async updateProfile(req, res, next) {
    try {
      const updatedProfile = await profileService.updateProfile(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Profile updated successfully', updatedProfile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/profiles/:id (Soft delete)
   */
  async softDeleteProfile(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await profileService.softDeleteProfile(
        req.params.id,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Profile soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/profiles/bulk-delete
   */
  async bulkDeleteProfiles(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await profileService.bulkDeleteProfiles(
        ids,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(
        res,
        `${result.affectedCount} profile record(s) bulk soft-deleted successfully`,
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
