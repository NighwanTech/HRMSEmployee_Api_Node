import { exampleService } from './example.service.js';
import { sendSuccess } from '../../utils/response.js';

export const exampleController = {
  async createExample(req, res, next) {
    try {
      const example = await exampleService.createExample(req.body);
      return sendSuccess(res, 'Example item created', example, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAllExamples(req, res, next) {
    try {
      const examples = await exampleService.getAllExamples();
      return sendSuccess(res, 'Example items retrieved', examples);
    } catch (error) {
      next(error);
    }
  },

  async softDeleteExample(req, res, next) {
    try {
      const { id } = req.params;
      const { deletedRemarks } = req.body;
      const result = await exampleService.softDeleteExample(id, deletedRemarks, req.user?.id);
      return sendSuccess(res, 'Example item soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async bulkDeleteExamples(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await exampleService.bulkDeleteExamples(ids, deletedRemarks, req.user?.id);
      return sendSuccess(res, `${result.affectedCount} item(s) bulk soft-deleted successfully`, result);
    } catch (error) {
      next(error);
    }
  },
};
