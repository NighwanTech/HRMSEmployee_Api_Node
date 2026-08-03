import { templateMasterService } from './templateMaster.service.js';
import { sendSuccess } from '../../utils/response.js';

export const templateMasterController = {
  /**
   * POST /api/v1/template-masters
   */
  async createTemplate(req, res, next) {
    try {
      const template = await templateMasterService.createTemplate(req.body, req.user?.id);
      return sendSuccess(res, 'Template master created successfully', template, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/template-masters
   */
  async getAllTemplates(req, res, next) {
    try {
      const templates = await templateMasterService.getAllTemplates();
      return sendSuccess(res, 'Template masters list retrieved successfully', templates);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/template-masters/:id
   */
  async getTemplateById(req, res, next) {
    try {
      const template = await templateMasterService.getTemplateById(req.params.id);
      return sendSuccess(res, 'Template master details retrieved successfully', template);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/template-masters/:id
   */
  async updateTemplate(req, res, next) {
    try {
      const updated = await templateMasterService.updateTemplate(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Template master updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/template-masters/:id/status
   */
  async updateTemplateStatus(req, res, next) {
    try {
      const { status, remark } = req.body;
      const updated = await templateMasterService.updateTemplateStatus(
        req.params.id,
        status,
        remark,
        req.user?.id
      );
      return sendSuccess(res, 'Template master status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/template-masters/:id (Soft delete)
   */
  async softDeleteTemplate(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await templateMasterService.softDeleteTemplate(
        req.params.id,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Template master soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/template-masters/bulk-delete
   */
  async bulkDeleteTemplates(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await templateMasterService.bulkDeleteTemplates(
        ids,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(
        res,
        `${result.affectedCount} template master record(s) bulk soft-deleted successfully`,
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
