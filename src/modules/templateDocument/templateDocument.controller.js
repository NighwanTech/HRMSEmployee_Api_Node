import path from 'path';
import fs from 'fs';
import { templateDocumentService } from './templateDocument.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ApiError } from '../../utils/apiError.js';

export const templateDocumentController = {
  /**
   * POST /api/v1/template-documents/upload
   */
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'Please upload a file');
      }

      const templateId = Number(req.body.template_id);
      const document = await templateDocumentService.uploadDocument(
        req.file,
        templateId,
        req.user?.id
      );

      return sendSuccess(res, 'Document uploaded successfully. Conversion started in background.', {
        id: document.id,
        templateId: document.templateId,
        originalFileName: document.originalFileName,
        originalFileType: document.originalFileType,
        status: document.status,
        pageCount: document.pageCount,
        convertedContent: document.convertedContent,
      }, 201);
    } catch (error) {
      // Cleanup multer parsed files if error happens before database saves
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  },

  /**
   * GET /api/v1/template-documents/template/:templateId
   */
  async getDocumentsByTemplateId(req, res, next) {
    try {
      const docs = await templateDocumentService.getDocumentsByTemplateId(
        Number(req.params.templateId)
      );
      return sendSuccess(res, 'Template documents retrieved successfully', docs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/template-documents/:id
   */
  async getDocumentById(req, res, next) {
    try {
      const doc = await templateDocumentService.getDocumentById(Number(req.params.id));
      return sendSuccess(res, 'Template document details retrieved successfully', doc);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/template-documents/:id/convert
   */
  async convertDocument(req, res, next) {
    try {
      const doc = await templateDocumentService.convertDocument(
        Number(req.params.id),
        req.user?.id
      );
      return sendSuccess(res, 'Document conversion completed successfully', doc);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/template-documents/:id
   */
  async softDeleteDocument(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await templateDocumentService.softDeleteDocument(
        Number(req.params.id),
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Template document soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/template-documents/:id/original
   */
  async downloadOriginal(req, res, next) {
    try {
      const doc = await templateDocumentService.getDocumentById(Number(req.params.id));
      const absoluteFilePath = path.resolve(process.cwd(), doc.originalFilePath.replace(/^\//, ''));

      if (!fs.existsSync(absoluteFilePath)) {
        throw new ApiError(404, 'File not found on disk');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFileName}"`);
      
      let contentType = 'application/octet-stream';
      if (doc.originalFileType === 'PDF') contentType = 'application/pdf';
      else if (doc.originalFileType === 'DOCX') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (doc.originalFileType === 'DOC') contentType = 'application/msword';
      
      res.setHeader('Content-Type', contentType);
      return res.sendFile(absoluteFilePath);
    } catch (error) {
      next(error);
    }
  },
};
