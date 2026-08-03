import path from 'path';
import fs from 'fs';
import { GeneratedDocument } from './generatedDocument.model.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';
import { TemplateContent } from '../templateContent/templateContent.model.js';
import { ApiError } from '../../utils/apiError.js';
import { pdfGenerator } from '../../utils/pdfGenerator.js';
import { dynamicDataResolver } from '../../utils/dynamicDataResolver.js';

export const generatedDocumentService = {
  /**
   * String parsing placeholder engine
   * Replaces dynamic variables using the format {{field_key}} with strict validation check.
   */
  replacePlaceholders(content, data) {
    if (!content) return '';
    
    // Scan all occurrences of placeholders like {{key}}
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    let match;
    const missingKeys = [];

    // First, compile a list of all distinct placeholder keys in the template content
    const placeholderKeys = new Set();
    while ((match = regex.exec(content)) !== null) {
      placeholderKeys.add(match[1]);
    }

    // Verify if all found placeholders are supplied in request data
    for (const key of placeholderKeys) {
      if (data[key] === undefined || data[key] === null) {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      throw new ApiError(
        400,
        `Missing required template placeholder variables: [${missingKeys.join(', ')}]`
      );
    }

    // Perform substitution (keep placeholder string if missing/null to satisfy specific placeholder keep rules)
    return content.replace(regex, (fullMatch, key) => {
      return data[key] !== undefined && data[key] !== null ? String(data[key]) : fullMatch;
    });
  },

  /**
   * Helper function to render replaced HTML and compile into A4 PDF file on disk.
   */
  async renderPdfFile(generatedDoc, templateContent, processedHtml) {
    const timestamp = Math.floor(Date.now() / 1000);
    // Sanitize document name to prevent directory traversal
    const safeName = generatedDoc.documentName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${safeName || 'doc'}-${timestamp}-${generatedDoc.id}.pdf`;
    
    const uploadsDir = path.join('uploads', 'generated-documents');
    const absoluteOutputPath = path.resolve(process.cwd(), uploadsDir, filename);
    const relativeFilePath = `/uploads/generated-documents/${filename}`;

    try {
      await pdfGenerator.generatePdf({
        html: processedHtml,
        outputPath: absoluteOutputPath,
        headerImage: templateContent.headerImage,
        footerImage: templateContent.footerImage
      });

      // Update generation metadata on success
      await generatedDoc.update({
        status: 'COMPLETED',
        filePath: relativeFilePath,
        fileName: filename,
        generatedAt: new Date(),
        errorMessage: null
      });
    } catch (err) {
      console.error(`PDF Rendering failed for GeneratedDocument ID ${generatedDoc.id}:`, err.message);
      await generatedDoc.update({
        status: 'FAILED',
        errorMessage: `PDF render error: ${err.message}`
      });
      throw new ApiError(500, `PDF Generation failed: ${err.message}`);
    }
  },

  /**
   * Main service to process document creation
   */
  async generateDocument(payload, userId = null) {
    const { templateId, documentName } = payload;

    // 1. Fetch Template Master
    const template = await TemplateMaster.findByPk(templateId);
    if (!template) {
      throw new ApiError(404, `Template Master with ID ${templateId} does not exist`);
    }

    // 2. Fetch Template Content
    const templateContent = await TemplateContent.findOne({
      where: { templateId, isDeleted: false }
    });
    if (!templateContent || !templateContent.content) {
      throw new ApiError(404, `No content or layout defined for Template ID ${templateId}`);
    }

    // 3. Resolve dynamic data using our resolver
    const resolvedResult = await dynamicDataResolver.resolve({
      templateId,
      employeeId: payload.employeeId,
      companyId: payload.companyId,
      profileId: payload.profileId,
      manualData: payload.data || {}
    });

    // 4. Raise error if required placeholders cannot be filled
    if (resolvedResult.missingFields && resolvedResult.missingFields.length > 0) {
      const error = new ApiError(400, 'Required dynamic data is missing');
      error.missingFields = resolvedResult.missingFields;
      throw error;
    }

    const finalData = resolvedResult.resolvedData;

    // 5. Create GeneratedDocument record in DB with GENERATING status
    const generatedDoc = await GeneratedDocument.create({
      templateId,
      templateContentId: templateContent.id,
      documentTypeId: template.documentTypeId,
      documentName,
      outputFormat: 'PDF',
      status: 'GENERATING',
      generatedData: finalData,
      createdBy: userId,
    });

    // 6. Process placeholders and render
    try {
      const processedHtml = this.replacePlaceholders(templateContent.content, finalData);
      await this.renderPdfFile(generatedDoc, templateContent, processedHtml);
    } catch (error) {
      // If replacePlaceholders failed before renderPdfFile can update status to FAILED
      if (generatedDoc.status === 'GENERATING') {
        await generatedDoc.update({
          status: 'FAILED',
          errorMessage: error.message
        });
      }
      throw error;
    }

    return generatedDoc;
  },


  /**
   * Regenerate PDF for an existing GeneratedDocument
   */
  async regenerateDocument(id, userId = null) {
    const generatedDoc = await GeneratedDocument.findByPk(id);
    if (!generatedDoc || generatedDoc.isDeleted) {
      throw new ApiError(404, 'Generated document not found');
    }

    // Fetch Template Content
    const templateContent = await TemplateContent.findOne({
      where: { templateId: generatedDoc.templateId, isDeleted: false }
    });
    if (!templateContent || !templateContent.content) {
      throw new ApiError(404, 'Template content not found or deleted');
    }

    // Clean up old file if it exists
    if (generatedDoc.filePath) {
      const absoluteOldPath = path.resolve(process.cwd(), generatedDoc.filePath.replace(/^\//, ''));
      if (fs.existsSync(absoluteOldPath)) {
        try {
          fs.unlinkSync(absoluteOldPath);
        } catch (err) {
          console.warn(`Could not clean up old generated file: ${absoluteOldPath}`, err.message);
        }
      }
    }

    // Set back to GENERATING status
    await generatedDoc.update({
      status: 'GENERATING',
      updatedBy: userId
    });

    try {
      const processedHtml = this.replacePlaceholders(templateContent.content, generatedDoc.generatedData);
      await this.renderPdfFile(generatedDoc, templateContent, processedHtml);
    } catch (error) {
      if (generatedDoc.status === 'GENERATING') {
        await generatedDoc.update({
          status: 'FAILED',
          errorMessage: error.message
        });
      }
      throw error;
    }

    return generatedDoc;
  },

  /**
   * Retrieve generated documents list with filter options
   */
  async getDocuments(filters = {}) {
    const where = { isDeleted: false };
    if (filters.templateId) {
      where.templateId = filters.templateId;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    return await GeneratedDocument.findAll({
      where,
      include: [
        {
          model: TemplateMaster,
          as: 'template',
          attributes: ['id', 'templateCode', 'templateName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  /**
   * Retrieve detailed record
   */
  async getDocumentById(id) {
    const doc = await GeneratedDocument.findByPk(id, {
      include: [
        {
          model: TemplateMaster,
          as: 'template',
          attributes: ['id', 'templateCode', 'templateName']
        }
      ]
    });

    if (!doc) {
      throw new ApiError(404, 'Generated document not found');
    }
    return doc;
  },

  /**
   * Soft-delete single record
   */
  async softDeleteDocument(id, deletedRemarks = null, deletedBy = null) {
    const doc = await GeneratedDocument.findByPk(id);
    if (!doc) {
      throw new ApiError(404, 'Generated document not found');
    }

    await doc.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy
    });

    return doc;
  }
};
export const doc = null; // compatibility variable helper
