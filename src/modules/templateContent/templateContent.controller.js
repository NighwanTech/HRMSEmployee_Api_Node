import { templateContentService } from './templateContent.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ApiError } from '../../utils/apiError.js';

export const templateContentController = {
  /**
   * 1. POST /template-content
   */
  async createContent(req, res, next) {
    try {
      const content = await templateContentService.createTemplateContent(req.body, req.user?.id);
      return sendSuccess(res, 'Template content created successfully', content, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 2. GET /template-content/template/:templateId
   */
  async getContentByTemplateId(req, res, next) {
    try {
      const { templateId } = req.params;
      const content = await templateContentService.getContentByTemplateId(templateId);
      return sendSuccess(res, 'Template content retrieved successfully', content);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 3. PUT/PATCH /template-content/:id
   */
  async updateContent(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await templateContentService.updateTemplateContent(id, req.body, req.user?.id);
      return sendSuccess(res, 'Template content updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4. DELETE /template-content/:id
   */
  async deleteContent(req, res, next) {
    try {
      const { id } = req.params;
      const result = await templateContentService.deleteTemplateContent(id, req.user?.id);
      return sendSuccess(res, 'Template content deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 5. POST /template-contents/:id/upload (Phase 3 Image Upload API)
   */
  async uploadImage(req, res, next) {
    try {
      const { id } = req.params;
      const { type } = req.body;

      if (!req.file) {
        throw new ApiError(400, 'Image file is required');
      }

      if (!type || !['header', 'footer'].includes(type)) {
        throw new ApiError(400, "Image type is required and must be either 'header' or 'footer'");
      }

      const relativeFilePath = `/uploads/images/${req.file.filename}`;
      const updatedContent = await templateContentService.uploadTemplateImage(
        id,
        type,
        relativeFilePath,
        req.user?.id
      );

      return sendSuccess(res, `Template ${type} image uploaded successfully`, updatedContent);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 6. DELETE /template-contents/:id/image (Phase 3 Image Removal API)
   */
  async removeImage(req, res, next) {
    try {
      const { id } = req.params;
      const type = req.body?.type || req.query?.type;

      if (!type || !['header', 'footer'].includes(type)) {
        throw new ApiError(400, "Image type is required and must be either 'header' or 'footer'");
      }

      const updatedContent = await templateContentService.removeTemplateImage(
        id,
        type,
        req.user?.id
      );

      return sendSuccess(res, `Template ${type} image removed successfully`, updatedContent);
    } catch (error) {
      next(error);
    }
  },
};
