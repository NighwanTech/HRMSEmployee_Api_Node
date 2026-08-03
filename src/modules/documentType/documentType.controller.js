import { documentTypeService } from './documentType.service.js';
import { sendSuccess } from '../../utils/response.js';

export const documentTypeController = {
  /**
   * POST /api/v1/document-types
   */
  async createDocumentType(req, res, next) {
    try {
      const docType = await documentTypeService.createDocumentType(req.body, req.user?.id);
      return sendSuccess(res, 'Document type created successfully', docType, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/document-types
   */
  async getAllDocumentTypes(req, res, next) {
    try {
      const docTypes = await documentTypeService.getAllDocumentTypes();
      return sendSuccess(res, 'Document types retrieved successfully', docTypes);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/document-types/:id
   */
  async getDocumentTypeById(req, res, next) {
    try {
      const docType = await documentTypeService.getDocumentTypeById(req.params.id);
      return sendSuccess(res, 'Document type details retrieved successfully', docType);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/document-types/:id
   */
  async updateDocumentType(req, res, next) {
    try {
      const updated = await documentTypeService.updateDocumentType(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Document type updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/document-types/:id/status
   */
  async updateDocumentTypeStatus(req, res, next) {
    try {
      const { status, remark } = req.body;
      const updated = await documentTypeService.updateDocumentTypeStatus(
        req.params.id,
        status,
        remark,
        req.user?.id
      );
      return sendSuccess(res, 'Document type status updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/document-types/:id (Soft delete)
   */
  async softDeleteDocumentType(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await documentTypeService.softDeleteDocumentType(
        req.params.id,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Document type soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/document-types/bulk-delete
   */
  async bulkDeleteDocumentTypes(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await documentTypeService.bulkDeleteDocumentTypes(
        ids,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(
        res,
        `${result.affectedCount} document type record(s) bulk soft-deleted successfully`,
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
