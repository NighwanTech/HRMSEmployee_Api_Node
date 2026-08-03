import { DocumentType } from './documentType.model.js';
import { Company } from '../company/company.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const documentTypeService = {
  /**
   * Create a new document type
   */
  async createDocumentType(data, createdBy = null) {
    const company = await Company.findByPk(data.companyId);
    if (!company) {
      throw new ApiError(404, `Company with ID ${data.companyId} does not exist`);
    }

    const existingCode = await DocumentType.findOne({
      where: {
        companyId: data.companyId,
        documentTypeCode: data.documentTypeCode,
      },
    });

    if (existingCode) {
      throw new ApiError(
        400,
        `Document type code '${data.documentTypeCode}' already exists for this company`
      );
    }

    return await DocumentType.create({
      ...data,
      createdBy,
    });
  },

  /**
   * Fetch all active document types with Company details
   */
  async getAllDocumentTypes() {
    return await DocumentType.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Fetch document type by ID
   */
  async getDocumentTypeById(id) {
    const docType = await DocumentType.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
      ],
    });

    if (!docType) {
      throw new ApiError(404, 'Document type not found');
    }
    return docType;
  },

  /**
   * Update document type
   */
  async updateDocumentType(id, updateData, updatedBy = null) {
    const docType = await DocumentType.findByPk(id);
    if (!docType) {
      throw new ApiError(404, 'Document type not found');
    }

    if (updateData.companyId) {
      const company = await Company.findByPk(updateData.companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${updateData.companyId} does not exist`);
      }
    }

    await docType.update({
      ...updateData,
      updatedBy,
    });

    return docType;
  },

  /**
   * Update status (PATCH)
   */
  async updateDocumentTypeStatus(id, status, remark = null, updatedBy = null) {
    const docType = await DocumentType.findByPk(id);
    if (!docType) {
      throw new ApiError(404, 'Document type not found');
    }

    await docType.update({
      status,
      isActive: status === 'active',
      remark: remark || docType.remark,
      updatedBy,
    });

    return docType;
  },

  /**
   * Soft delete single document type
   */
  async softDeleteDocumentType(id, deletedRemarks = null, deletedBy = null) {
    const docType = await DocumentType.findByPk(id);
    if (!docType) {
      throw new ApiError(404, 'Document type not found');
    }

    await docType.update({
      isDeleted: true,
      isActive: false,
      status: 'inactive',
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return docType;
  },

  /**
   * Bulk soft delete document types
   */
  async bulkDeleteDocumentTypes(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await DocumentType.update(
      {
        isDeleted: true,
        isActive: false,
        status: 'inactive',
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
