import fs from 'fs';
import path from 'path';
import { TemplateContent } from './templateContent.model.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * Helper to safely delete an old image file from disk without breaking runtime
 */
const safeDeleteFile = (relativeFilePath) => {
  if (!relativeFilePath) return;
  try {
    const fullPath = path.resolve(process.cwd(), relativeFilePath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn(`Warning: Could not delete file at ${relativeFilePath}:`, err.message);
  }
};

export const templateContentService = {
  /**
   * 1. Create Template Content
   */
  async createTemplateContent(data, userId = null) {
    // Validate that referenced Template Master record exists
    const template = await TemplateMaster.findByPk(data.templateId);
    if (!template || template.isDeleted) {
      throw new ApiError(404, `Template Master with ID ${data.templateId} does not exist`);
    }

    // Prevent duplicate Template Content for the same template_id
    const existingContent = await TemplateContent.findOne({
      where: { templateId: data.templateId },
    });

    if (existingContent) {
      throw new ApiError(
        400,
        `Template Content already exists for template_id ${data.templateId}. Please use Update API instead.`
      );
    }

    return await TemplateContent.create({
      ...data,
      createdBy: userId,
    });
  },

  /**
   * 2. Get Template Content by Template ID
   */
  async getContentByTemplateId(templateId) {
    const template = await TemplateMaster.findByPk(templateId);
    if (!template || template.isDeleted) {
      throw new ApiError(404, `Template Master with ID ${templateId} does not exist`);
    }

    const content = await TemplateContent.findOne({
      where: { templateId },
      include: [
        {
          model: TemplateMaster,
          as: 'template',
          attributes: ['id', 'templateCode', 'templateName', 'companyId', 'documentTypeId'],
        },
      ],
    });

    if (!content) {
      throw new ApiError(404, `No Template Content found for template_id ${templateId}`);
    }

    return content;
  },

  /**
   * 3. Update Template Content by Content ID
   */
  async updateTemplateContent(id, updateData, userId = null) {
    const contentRecord = await TemplateContent.findByPk(id);
    if (!contentRecord || contentRecord.isDeleted) {
      throw new ApiError(404, `Template Content record with ID ${id} does not exist`);
    }

    await contentRecord.update({
      ...updateData,
      updatedBy: userId,
    });

    return contentRecord;
  },

  /**
   * 4. Delete Template Content by Content ID
   */
  async deleteTemplateContent(id, userId = null) {
    const contentRecord = await TemplateContent.findByPk(id);
    if (!contentRecord || contentRecord.isDeleted) {
      throw new ApiError(404, `Template Content record with ID ${id} does not exist`);
    }

    // Soft delete record by marking isDeleted true
    await contentRecord.update({
      isDeleted: true,
      isActive: false,
      status: 'inactive',
      updatedBy: userId,
    });

    return { message: 'Template Content deleted successfully' };
  },

  /**
   * 5. Upload & Replace Header or Footer Image (Phase 3)
   */
  async uploadTemplateImage(contentId, type, relativeFilePath, userId = null) {
    const contentRecord = await TemplateContent.findByPk(contentId);
    if (!contentRecord || contentRecord.isDeleted) {
      throw new ApiError(404, `Template Content record with ID ${contentId} does not exist`);
    }

    if (type === 'header') {
      // Delete old header image if exists
      if (contentRecord.headerImage) {
        safeDeleteFile(contentRecord.headerImage);
      }
      await contentRecord.update({
        headerImage: relativeFilePath,
        updatedBy: userId,
      });
    } else if (type === 'footer') {
      // Delete old footer image if exists
      if (contentRecord.footerImage) {
        safeDeleteFile(contentRecord.footerImage);
      }
      await contentRecord.update({
        footerImage: relativeFilePath,
        updatedBy: userId,
      });
    } else {
      throw new ApiError(400, "Invalid image type. Type must be 'header' or 'footer'");
    }

    return contentRecord;
  },

  /**
   * 6. Remove Header or Footer Image (Phase 3)
   */
  async removeTemplateImage(contentId, type, userId = null) {
    const contentRecord = await TemplateContent.findByPk(contentId);
    if (!contentRecord || contentRecord.isDeleted) {
      throw new ApiError(404, `Template Content record with ID ${contentId} does not exist`);
    }

    if (type === 'header') {
      if (contentRecord.headerImage) {
        safeDeleteFile(contentRecord.headerImage);
      }
      await contentRecord.update({
        headerImage: null,
        updatedBy: userId,
      });
    } else if (type === 'footer') {
      if (contentRecord.footerImage) {
        safeDeleteFile(contentRecord.footerImage);
      }
      await contentRecord.update({
        footerImage: null,
        updatedBy: userId,
      });
    } else {
      throw new ApiError(400, "Invalid image type. Type must be 'header' or 'footer'");
    }

    return contentRecord;
  },
};
