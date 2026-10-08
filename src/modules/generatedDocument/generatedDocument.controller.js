import path from 'path';
import fs from 'fs';
import { generatedDocumentService } from './generatedDocument.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ApiError } from '../../utils/apiError.js';
import { dynamicDataResolver } from '../../utils/dynamicDataResolver.js';

export const generatedDocumentController = {
  /**
   * POST /api/v1/generated-documents
   */
  async generateDocument(req, res, next) {
    try {
      const generatedDoc = await generatedDocumentService.generateDocument(
        req.body,
        req.user?.id
      );

      return sendSuccess(res, 'Document generated successfully', {
        id: generatedDoc.id,
        documentName: generatedDoc.documentName,
        status: generatedDoc.status,
        outputFormat: generatedDoc.outputFormat,
        fileName: generatedDoc.fileName,
        filePath: generatedDoc.filePath,
        generatedAt: generatedDoc.generatedAt,
      }, 201);
    } catch (error) {
      if (error.statusCode === 400 && error.message === 'Required dynamic data is missing') {
        return res.status(400).json({
          success: false,
          message: error.message,
          data: {
            missingFields: error.missingFields
          }
        });
      }
      next(error);
    }
  },

  /**
   * POST /api/v1/generated-documents/resolve-data
   */
  async resolveDocumentData(req, res, next) {
    try {
      const { templateId, employeeId, companyId, profileId, manualData } = req.body;
      const resolved = await dynamicDataResolver.resolve({
        templateId,
        employeeId,
        companyId,
        profileId,
        manualData
      });

      if (resolved.missingFields && resolved.missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Required dynamic data is missing',
          data: {
            missingFields: resolved.missingFields
          }
        });
      }

      return sendSuccess(res, 'Dynamic data resolved successfully', resolved);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/generated-documents
   */
  async getDocuments(req, res, next) {
    try {
      const filters = {};
      if (req.query.templateId) {
        filters.templateId = Number(req.query.templateId);
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.companyId) {
        filters.companyId = Number(req.query.companyId);
      }
      if (req.query.profileId) {
        filters.profileId = Number(req.query.profileId);
      }

      const docs = await generatedDocumentService.getDocuments(filters);
      return sendSuccess(res, 'Generated documents retrieved successfully', docs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/generated-documents/:id
   */
  async getDocumentById(req, res, next) {
    try {
      const doc = await generatedDocumentService.getDocumentById(Number(req.params.id));
      return sendSuccess(res, 'Generated document details retrieved successfully', doc);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/generated-documents/:id
   */
  async softDeleteDocument(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await generatedDocumentService.softDeleteDocument(
        Number(req.params.id),
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Generated document soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/generated-documents/:id/download
   */
  async downloadDocument(req, res, next) {
    try {
      const doc = await generatedDocumentService.getDocumentById(Number(req.params.id));
      if (doc.status !== 'COMPLETED' || !doc.filePath) {
        throw new ApiError(400, 'Document generation is not completed yet or failed');
      }

      const absolutePath = path.resolve(process.cwd(), doc.filePath.replace(/^\//, ''));
      if (!fs.existsSync(absolutePath)) {
        throw new ApiError(404, 'Generated PDF file not found on server disk');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName || 'document.pdf'}"`);
      return res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/generated-documents/:id/preview
   */
  async previewDocument(req, res, next) {
    try {
      const doc = await generatedDocumentService.getDocumentById(Number(req.params.id));
      if (doc.status !== 'COMPLETED' || !doc.filePath) {
        throw new ApiError(400, 'Document generation is not completed yet or failed');
      }

      const absolutePath = path.resolve(process.cwd(), doc.filePath.replace(/^\//, ''));
      if (!fs.existsSync(absolutePath)) {
        throw new ApiError(404, 'Generated PDF file not found on server disk');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/generated-documents/:id/regenerate
   */
  async regenerateDocument(req, res, next) {
    try {
      const updatedDoc = await generatedDocumentService.regenerateDocument(
        Number(req.params.id),
        req.user?.id
      );

      return sendSuccess(res, 'Document regenerated successfully', {
        id: updatedDoc.id,
        documentName: updatedDoc.documentName,
        status: updatedDoc.status,
        outputFormat: updatedDoc.outputFormat,
        fileName: updatedDoc.fileName,
        filePath: updatedDoc.filePath,
        generatedAt: updatedDoc.generatedAt,
      });
    } catch (error) {
      next(error);
    }
  },
};
export default generatedDocumentController;
