import { Company } from './company.model.js';
import { ApiError } from '../../utils/apiError.js';
import { Op } from 'sequelize';

export const companyService = {
  /**
   * Create a new company record
   */
  async createCompany(companyData, createdBy = null) {
    const existingCode = await Company.findOne({
      where: { companyCode: companyData.companyCode, isDeleted: false },
    });

    if (existingCode) {
      throw new ApiError(400, `Company code '${companyData.companyCode}' is already registered`);
    }

    return await Company.create({
      ...companyData,
      createdBy,
    });
  },

  /**
   * Fetch all active (non-soft-deleted) companies
   */
  async getAllCompanies() {
    return await Company.findAll({
      where: { isDeleted: false },
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Fetch company details by ID
   */
  async getCompanyById(id) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }
    return company;
  },

  /**
   * Update full company details
   */
  async updateCompany(id, updateData, updatedBy = null) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    if (updateData.companyCode && updateData.companyCode !== company.companyCode) {
      const existingCode = await Company.findOne({
        where: { companyCode: updateData.companyCode },
      });
      if (existingCode) {
        throw new ApiError(400, `Company code '${updateData.companyCode}' is already in use`);
      }
    }

    await company.update({
      ...updateData,
      updatedBy,
    });

    return company;
  },

  /**
   * Update company status (PATCH)
   */
  async updateCompanyStatus(id, status, remark = null, updatedBy = null) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    await company.update({
      status,
      isActive: status === 'active',
      remark: remark || company.remark,
      updatedBy,
    });

    return company;
  },

  /**
   * Soft delete a single company record
   */
  async softDeleteCompany(id, deletedRemarks = null, deletedBy = null) {
    const company = await Company.findByPk(id);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    await company.update({
      isDeleted: true,
      isActive: false,
      status: 'inactive',
      deletedRemarks,
      updatedBy: deletedBy,
    });

    return company;
  },

  /**
   * Bulk soft delete multiple companies
   */
  async bulkDeleteCompanies(ids, deletedRemarks = null, deletedBy = null) {
    const [affectedCount] = await Company.update(
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
