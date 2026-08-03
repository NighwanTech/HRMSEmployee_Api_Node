import path from 'path';
import fs from 'fs';
import { TemplateDocument } from './templateDocument.model.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';
import { ApiError } from '../../utils/apiError.js';
import { documentConverter } from '../../utils/documentConverter.js';

export const templateDocumentService = {
  /**
   * Register a new uploaded document in database and trigger async conversion
   * @param {Object} file - File object from multer
   * @param {number} templateId - Target template master ID
   * @param {number} userId - ID of creating user
   */
  async uploadDocument(file, templateId, userId = null) {
    // Verify template existence
    const template = await TemplateMaster.findByPk(templateId);
    if (!template) {
      // Clean up uploaded file if template doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(404, `Template with ID ${templateId} does not exist`);
    }

    // Determine type
    const ext = path.extname(file.originalname).toUpperCase().replace('.', '');
    const allowedTypes = ['PDF', 'DOCX', 'DOC'];
    if (!allowedTypes.includes(ext)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(400, 'Invalid file type. Only PDF, DOCX, and DOC documents are allowed.');
    }

    // Save relative path for storage
    const relativePath = `/uploads/documents/${path.basename(file.path)}`;

    // Create DB record with status UPLOADED
    const document = await TemplateDocument.create({
      templateId,
      originalFileName: file.originalname,
      originalFilePath: relativePath,
      originalFileType: ext,
      status: 'UPLOADED',
      createdBy: userId,
    });

    // Run conversion in background without blocking API response
    this.convertDocumentInBackground(document.id);

    return document;
  },

  /**
   * Run the file parsing & conversion logic
   * @param {number} documentId
   */
  async convertDocument(documentId, userId = null) {
    const document = await TemplateDocument.findByPk(documentId);
    if (!document) {
      throw new ApiError(404, 'Template document not found');
    }

    const absoluteFilePath = path.resolve(process.cwd(), document.originalFilePath.replace(/^\//, ''));

    if (!fs.existsSync(absoluteFilePath)) {
      document.status = 'FAILED';
      document.conversionError = 'Original uploaded file could not be found on disk.';
      if (userId) document.updatedBy = userId;
      await document.save();
      throw new ApiError(404, 'Uploaded file not found on disk.');
    }

    try {
      // Convert
      const { convertedContent, pageCount } = await documentConverter.convertToHtml(
        absoluteFilePath,
        document.originalFileType
      );

      document.convertedContent = convertedContent;
      document.pageCount = pageCount;
      document.status = 'CONVERTED';
      document.conversionError = null;
      if (userId) document.updatedBy = userId;
      await document.save();

      return document;
    } catch (error) {
      document.status = 'FAILED';
      document.conversionError = error.message;
      if (userId) document.updatedBy = userId;
      await document.save();
      throw new ApiError(500, `Conversion failed: ${error.message}`);
    }
  },

  /**
   * Safely run conversion in the background
   */
  async convertDocumentInBackground(documentId) {
    try {
      await this.convertDocument(documentId);
    } catch (error) {
      console.error(`Background conversion failed for document ${documentId}:`, error.message);
    }
  },

  /**
   * Retrieve uploaded documents for a template
   */
  async getDocumentsByTemplateId(templateId) {
    const template = await TemplateMaster.findByPk(templateId);
    if (!template) {
      throw new ApiError(404, 'Template not found');
    }
    return await TemplateDocument.findAll({
      where: { templateId, isDeleted: false },
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Get template document details
   */
  async getDocumentById(id) {
    const doc = await TemplateDocument.findByPk(id);
    if (!doc) {
      throw new ApiError(404, 'Template document not found');
    }
    return doc;
  },

  /**
   * Soft delete document
   */
  async softDeleteDocument(id, deletedRemarks = null, deletedBy = null) {
    const doc = await TemplateDocument.findByPk(id);
    if (!doc) {
      throw new ApiError(404, 'Template document not found');
    }

    await doc.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return doc;
  },
};
