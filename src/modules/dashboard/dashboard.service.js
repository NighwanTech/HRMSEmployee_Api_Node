import { Company } from '../company/company.model.js';
import { Profile } from '../profile/profile.model.js';
import { GeneratedDocument } from '../generatedDocument/generatedDocument.model.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';
import { DocumentType } from '../documentType/documentType.model.js';
import { Op } from 'sequelize';

export const dashboardService = {
  async getDashboardStats() {
    let totalCompanies = 0;
    let activeCompanies = 0;
    let totalProfiles = 0;
    let activeProfiles = 0;
    let totalGeneratedDocs = 0;
    let completedDocs = 0;
    let pendingDocs = 0;
    let failedDocs = 0;
    let totalTemplates = 0;
    let totalDocumentTypes = 0;
    let companiesList = [];

    try {
      totalCompanies = await Company.count({ where: { isDeleted: false } });
      activeCompanies = await Company.count({ where: { isDeleted: false, isActive: true } });
      const compRows = await Company.findAll({
        where: { isDeleted: false },
        attributes: ['id', 'companyName'],
        order: [['companyName', 'ASC']],
      });
      companiesList = compRows.map((c) => c.companyName);
    } catch (e) {}

    try {
      totalProfiles = await Profile.count({ where: { isDeleted: false } });
      activeProfiles = await Profile.count({ where: { isDeleted: false, isActive: true } });
    } catch (e) {}

    try {
      totalGeneratedDocs = await GeneratedDocument.count({ where: { isDeleted: false } });
      completedDocs = await GeneratedDocument.count({ where: { isDeleted: false, status: 'COMPLETED' } });
      pendingDocs = await GeneratedDocument.count({ where: { isDeleted: false, status: 'GENERATING' } });
      failedDocs = await GeneratedDocument.count({ where: { isDeleted: false, status: 'FAILED' } });
    } catch (e) {}

    try {
      totalTemplates = await TemplateMaster.count({ where: { isDeleted: false } });
    } catch (e) {}

    try {
      totalDocumentTypes = await DocumentType.count({ where: { isDeleted: false } });
    } catch (e) {}

    // 2. Recent Generated Documents Activity (latest 6)
    let recentActivity = [];
    try {
      const recentDocuments = await GeneratedDocument.findAll({
        where: { isDeleted: false },
        order: [['createdAt', 'DESC']],
        limit: 6,
        include: [
          { model: TemplateMaster, as: 'template', attributes: ['id', 'templateName', 'templateCode'], required: false },
          { model: DocumentType, as: 'documentType', attributes: ['id', 'name'], required: false },
        ],
      });

      recentActivity = recentDocuments.map((doc) => {
        const data = doc.generatedData || {};
        return {
          id: doc.id,
          documentName: doc.documentName,
          companyName: data.companyName || data.company_name || 'System Enterprise',
          profileName: data.fullName || data.full_name || data.employeeName || data.name || 'Employee',
          templateName: doc.template?.templateName || doc.documentType?.name || doc.documentName || 'Document',
          status: doc.status === 'COMPLETED' ? 'Completed' : doc.status === 'FAILED' ? 'Failed' : 'Processing',
          createdAt: doc.createdAt || doc.generatedAt,
        };
      });
    } catch (e) {
      console.error('Error fetching recent documents for dashboard:', e);
    }

    // 3. Monthly Trends (pichhle 6 months counts)
    const monthlyStats = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });

      let count = 0;
      try {
        count = await GeneratedDocument.count({
          where: {
            isDeleted: false,
            createdAt: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        });
      } catch (e) {}

      monthlyStats.push({ month: monthName, count });
    }

    // 4. Document Types Real Distribution
    let documentTypeDistribution = [];
    try {
      const docTypes = await DocumentType.findAll({
        where: { isDeleted: false },
        attributes: ['id', 'name'],
        limit: 5,
      });

      for (const dt of docTypes) {
        const cnt = await GeneratedDocument.count({
          where: { isDeleted: false, documentTypeId: dt.id },
        });
        documentTypeDistribution.push({ name: dt.name, count: cnt });
      }
    } catch (e) {}

    // 5. Template Usage Real Distribution
    let templateUsage = [];
    try {
      const tpls = await TemplateMaster.findAll({
        where: { isDeleted: false },
        attributes: ['id', 'templateName'],
        limit: 5,
      });

      for (const tpl of tpls) {
        const cnt = await GeneratedDocument.count({
          where: { isDeleted: false, templateId: tpl.id },
        });
        templateUsage.push({ name: tpl.templateName, count: cnt });
      }
    } catch (e) {}

    return {
      kpi: {
        totalCompanies,
        activeCompanies,
        totalProfiles,
        activeProfiles,
        totalGeneratedDocs,
        completedDocs,
        pendingDocs,
        failedDocs,
        totalTemplates,
        totalDocumentTypes,
      },
      companiesList,
      recentActivity,
      monthlyStats,
      documentTypeDistribution,
      templateUsage,
      statusDistribution: {
        completed: completedDocs,
        pending: pendingDocs,
        failed: failedDocs,
      },
    };
  },
};
