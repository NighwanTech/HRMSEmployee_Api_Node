import { TemplateMaster } from './templateMaster.model.js';
import { Company } from '../company/company.model.js';
import { DocumentType } from '../documentType/documentType.model.js';
import { Profile } from '../profile/profile.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const templateMasterService = {
  /**
   * Create a new template master record
   */
  async createTemplate(data, createdBy = null) {
    const company = await Company.findByPk(data.companyId);
    if (!company) {
      throw new ApiError(404, `Company with ID ${data.companyId} does not exist`);
    }

    const docType = await DocumentType.findByPk(data.documentTypeId);
    if (!docType) {
      throw new ApiError(404, `DocumentType with ID ${data.documentTypeId} does not exist`);
    }

    if (data.profileId) {
      const profile = await Profile.findByPk(data.profileId);
      if (!profile) {
        throw new ApiError(404, `Profile with ID ${data.profileId} does not exist`);
      }
    }

    const existingCode = await TemplateMaster.findOne({
      where: {
        companyId: data.companyId,
        templateCode: data.templateCode,
      },
    });

    if (existingCode) {
      throw new ApiError(
        400,
        `Template code '${data.templateCode}' already exists for this company`
      );
    }

    // Handle isDefault logic (If marked as default, unmark other default templates for this docType)
    if (data.isDefault) {
      await TemplateMaster.update(
        { isDefault: false },
        {
          where: {
            companyId: data.companyId,
            documentTypeId: data.documentTypeId,
            isDefault: true,
          },
        }
      );
    }

    return await TemplateMaster.create({
      ...data,
      createdBy,
    });
  },

  /**
   * Fetch all active templates with Company, DocumentType & Profile associations
   */
  async getAllTemplates() {
    return await TemplateMaster.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'documentTypeCode', 'documentTypeName'],
        },
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'profileCode', 'profileName', 'jobTitle'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Fetch template by ID
   */
  async getTemplateById(id) {
    const template = await TemplateMaster.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'companyCode', 'companyName', 'displayName'],
        },
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'documentTypeCode', 'documentTypeName'],
        },
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'profileCode', 'profileName', 'jobTitle'],
        },
      ],
    });

    if (!template) {
      throw new ApiError(404, 'Template master record not found');
    }
    return template;
  },

  /**
   * Update template master record
   */
  async updateTemplate(id, updateData, updatedBy = null) {
    const template = await TemplateMaster.findByPk(id);
    if (!template) {
      throw new ApiError(404, 'Template master record not found');
    }

    if (updateData.companyId) {
      const company = await Company.findByPk(updateData.companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${updateData.companyId} does not exist`);
      }
    }

    if (updateData.documentTypeId) {
      const docType = await DocumentType.findByPk(updateData.documentTypeId);
      if (!docType) {
        throw new ApiError(404, `DocumentType with ID ${updateData.documentTypeId} does not exist`);
      }
    }

    if (updateData.profileId) {
      const profile = await Profile.findByPk(updateData.profileId);
      if (!profile) {
        throw new ApiError(404, `Profile with ID ${updateData.profileId} does not exist`);
      }
    }

    if (updateData.isDefault) {
      await TemplateMaster.update(
        { isDefault: false },
        {
          where: {
            companyId: updateData.companyId || template.companyId,
            documentTypeId: updateData.documentTypeId || template.documentTypeId,
            isDefault: true,
            id: { [Op.ne]: id },
          },
        }
      );
    }

    await template.update({
      ...updateData,
      updatedBy,
    });

    return template;
  },

  /**
   * Update template status (PATCH)
   */
  async updateTemplateStatus(id, status, remark = null, updatedBy = null) {
    const template = await TemplateMaster.findByPk(id);
    if (!template) {
      throw new ApiError(404, 'Template master record not found');
    }

    await template.update({
      status,
      isActive: status === 'active',
      remark: remark || template.remark,
      updatedBy,
    });

    return template;
  },

  /**
   * Soft delete single template
   */
  async softDeleteTemplate(id, deletedRemarks = null, deletedBy = null) {
    const template = await TemplateMaster.findByPk(id);
    if (!template) {
      throw new ApiError(404, 'Template master record not found');
    }

    await template.update({
      isDeleted: true,
      isActive: false,
      status: 'inactive',
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return template;
  },

  /**
   * Bulk soft delete templates
   */
  async bulkDeleteTemplates(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await TemplateMaster.update(
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
