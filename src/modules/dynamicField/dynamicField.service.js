import { DynamicField } from './dynamicField.model.js';
import { Company } from '../company/company.model.js';
import { DocumentType } from '../documentType/documentType.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const dynamicFieldService = {
  /**
   * Create a new dynamic field
   */
  async createDynamicField(data, createdBy = null) {
    // Validate company if provided
    if (data.companyId) {
      const company = await Company.findByPk(data.companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${data.companyId} does not exist`);
      }
    }

    // Validate document type if provided
    if (data.documentTypeId) {
      const docType = await DocumentType.findByPk(data.documentTypeId);
      if (!docType) {
        throw new ApiError(404, `DocumentType with ID ${data.documentTypeId} does not exist`);
      }
    }

    // field_key must be globally unique
    const existingKey = await DynamicField.findOne({
      where: { fieldKey: data.fieldKey },
    });
    if (existingKey) {
      throw new ApiError(
        409,
        `Field key '${data.fieldKey}' already exists. field_key must be globally unique.`
      );
    }

    return await DynamicField.create({ ...data, createdBy });
  },

  /**
   * Fetch all active dynamic fields with optional filters and search
   *
   * Supported query params:
   *   document_type_id  – filter by document type
   *   field_type        – filter by field type ENUM value
   *   data_source       – filter by data source ENUM value
   *   is_active         – filter by active status (true/false)
   *   search            – partial match on field_name, field_key, description
   */
  async getAllDynamicFields(filters = {}) {
    const where = {};

    if (filters.documentTypeId !== undefined) {
      where.documentTypeId = filters.documentTypeId;
    }
    if (filters.fieldType) {
      where.fieldType = filters.fieldType.toUpperCase();
    }
    if (filters.dataSource) {
      where.dataSource = filters.dataSource.toUpperCase();
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.search) {
      where[Op.or] = [
        { fieldName: { [Op.like]: `%${filters.search}%` } },
        { fieldKey: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    return await DynamicField.findAll({
      where,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
          required: false,
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'documentTypeCode', 'documentTypeName'],
          required: false,
        },
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
  },

  /**
   * Fetch dynamic field by ID
   */
  async getDynamicFieldById(id) {
    const field = await DynamicField.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
          required: false,
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'documentTypeCode', 'documentTypeName'],
          required: false,
        },
      ],
    });

    if (!field) {
      throw new ApiError(404, 'Dynamic field not found');
    }
    return field;
  },

  /**
   * Fetch all dynamic fields for a specific document type
   */
  async getFieldsByDocumentTypeId(documentTypeId) {
    return await DynamicField.findAll({
      where: { documentTypeId },
      order: [['displayOrder', 'ASC']],
    });
  },

  /**
   * Update dynamic field
   */
  async updateDynamicField(id, updateData, updatedBy = null) {
    const field = await DynamicField.findByPk(id);
    if (!field) {
      throw new ApiError(404, 'Dynamic field not found');
    }

    // Validate company if changing it
    if (updateData.companyId) {
      const company = await Company.findByPk(updateData.companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${updateData.companyId} does not exist`);
      }
    }

    // Validate document type if changing it
    if (updateData.documentTypeId) {
      const docType = await DocumentType.findByPk(updateData.documentTypeId);
      if (!docType) {
        throw new ApiError(404, `DocumentType with ID ${updateData.documentTypeId} does not exist`);
      }
    }

    // Check global uniqueness if field_key is being changed
    if (updateData.fieldKey && updateData.fieldKey !== field.fieldKey) {
      const duplicate = await DynamicField.findOne({
        where: { fieldKey: updateData.fieldKey },
      });
      if (duplicate) {
        throw new ApiError(
          409,
          `Field key '${updateData.fieldKey}' already exists. field_key must be globally unique.`
        );
      }
    }

    await field.update({ ...updateData, updatedBy });
    return field;
  },

  /**
   * Soft delete single dynamic field
   */
  async softDeleteDynamicField(id, deletedRemarks = null, deletedBy = null) {
    const field = await DynamicField.findByPk(id);
    if (!field) {
      throw new ApiError(404, 'Dynamic field not found');
    }

    await field.update({
      isDeleted: true,
      isActive: false,
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return field;
  },

  /**
   * Bulk soft delete dynamic fields
   */
  async bulkDeleteDynamicFields(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await DynamicField.update(
      {
        isDeleted: true,
        isActive: false,
        deletedRemarks,
        updatedBy: deletedBy,
      },
      {
        where: {
          id: { [Op.in]: ids },
          isDeleted: false,
        },
      }
    );

    return { affectedCount };
  },
};
