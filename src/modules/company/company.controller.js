import { companyService } from './company.service.js';
import { sendSuccess } from '../../utils/response.js';

export const companyController = {
  /**
   * POST /api/v1/companies
   */
  async createCompany(req, res, next) {
    try {
      const company = await companyService.createCompany(req.body, req.user?.id);
      return sendSuccess(res, 'Company created successfully', company, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/companies
   */
  async getAllCompanies(req, res, next) {
    try {
      const companies = await companyService.getAllCompanies();
      return sendSuccess(res, 'Companies list retrieved successfully', companies);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/companies/:id
   */
  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      return sendSuccess(res, 'Company details retrieved successfully', company);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/companies/:id
   */
  async updateCompany(req, res, next) {
    try {
      const updatedCompany = await companyService.updateCompany(
        req.params.id,
        req.body,
        req.user?.id
      );
      return sendSuccess(res, 'Company updated successfully', updatedCompany);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/companies/:id/status
   */
  async updateCompanyStatus(req, res, next) {
    try {
      const { status, remark } = req.body;
      const updatedCompany = await companyService.updateCompanyStatus(
        req.params.id,
        status,
        remark,
        req.user?.id
      );
      return sendSuccess(res, 'Company status updated successfully', updatedCompany);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/companies/:id (Soft delete)
   */
  async softDeleteCompany(req, res, next) {
    try {
      const { deletedRemarks } = req.body;
      const result = await companyService.softDeleteCompany(
        req.params.id,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(res, 'Company soft-deleted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/companies/bulk-delete
   */
  async bulkDeleteCompanies(req, res, next) {
    try {
      const { ids, deletedRemarks } = req.body;
      const result = await companyService.bulkDeleteCompanies(
        ids,
        deletedRemarks,
        req.user?.id
      );
      return sendSuccess(
        res,
        `${result.affectedCount} company record(s) bulk soft-deleted successfully`,
        result
      );
    } catch (error) {
      next(error);
    }
  },
};
