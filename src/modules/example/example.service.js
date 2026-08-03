import { Example } from './example.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const exampleService = {
  async createExample(data) {
    return await Example.create(data);
  },

  async getAllExamples() {
    return await Example.findAll();
  },

  async softDeleteExample(id, deletedRemarks = null, deletedBy = null) {
    const item = await Example.findByPk(id);
    if (!item) {
      throw new ApiError(404, 'Example item not found');
    }

    await item.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return item;
  },

  async bulkDeleteExamples(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await Example.update(
      {
        isDeleted: true,
        isActive: false,
        deletedRemarks,
        updatedBy: deletedBy,
      },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
          isDeleted: false,
        },
      }
    );

    return { affectedCount };
  },
};
