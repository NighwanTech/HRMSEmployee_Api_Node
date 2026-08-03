import { dynamicFieldService } from './dynamicField.service.js';
import { sendSuccess } from '../../utils/response.js';

export const dynamicFieldController = {
  /**
   * POST /api/v1/dynamic-fields
   */
  async createDynamicField(req, res, next) {
    try {
      const field = await dynamicFieldService.createDynamicField(req.body, req.user?.id);
      return sendSuccess(res, 'Dynamic field created successfully', field, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/dynamic-fields
   * Supports query filters: document_type_id, field_type, data_source, is_active, search
   */
  async getAllDynamicFields(req, res, next) {
    try {
      const { document_type_id, field_type, data_source, is_active, search } = req.query;
      const filters = {
        ...(document_type_id !== undefined && { documentTypeId: Number(document_type_id) }),
        ...(field_type       !== undefined && { fieldType: field_type }),
        ...(data_source      !== undefined && { dataSource: data_source }),
        ...(is_active        !== undefined && { isActive: is_active }),
        ...(search           !== undefined && { search }),
      };
      const fields = await dynamicFieldService.getAllDynamicFields(filters);
      return sendSuccess(res, 'Dynamic fields retrieved successfully', fields);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/dynamic-fields/:id
   */
  async getDynamicFieldById(req, res, next) {
    try {
      const field = await dynamicFieldService.getDynamicFieldById(req.params.id);
      return sendSuccess(res, 'Dynamic field details retrieved successfully', field);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/dynamic-fields/document-type/:documentTypeId
   */
  async getFieldsByDocumentTypeId(req, res, next) {
    try {
      const fields = await dynamicFieldService.getFieldsByDocumentTypeId(
        req.params.documentTypeId
      );
      return sendSuccess(res, 'Document type dynamic fields retrieved successfully', fields);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/dynamic-fields/:id
   */
  async updateDynamicField(req, res, next) {
    try {
      const updated = await dynamicFieldService.updateDynamicField(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Dynamic field updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/dynamic-fields/:id (Soft delete)
   */
  async softDeleteDynamicField(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await dynamicFieldService.softDeleteDynamicField(
        req.params.id,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Dynamic field soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/dynamic-fields/bulk-delete
   */
  async bulkDeleteDynamicFields(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await dynamicFieldService.bulkDeleteDynamicFields(
        ids,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(
        res,
        `${result.affectedCount} dynamic field record(s) bulk soft-deleted successfully`,
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
