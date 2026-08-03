import { DynamicField } from '../modules/dynamicField/dynamicField.model.js';
import { Company } from '../modules/company/company.model.js';
import { Profile } from '../modules/profile/profile.model.js';
import { TemplateContent } from '../modules/templateContent/templateContent.model.js';
import { ApiError } from './apiError.js';

// In-memory mock database for Employee since there is no existing employee module or database table.
const MOCK_EMPLOYEES = {
  1: {
    id: 1,
    employee_name: 'Kumar Adarsh',
    employee_code: 'EMP001',
    designation: 'Software Developer',
    department: 'Engineering',
    joining_date: '02-Feb-2026',
    email: 'kumar.adarsh@example.com',
    phone: '+91 99999 88888',
    salary: '7000',
    address: 'Bhubaneswar, Odisha'
  },
  12: {
    id: 12,
    employee_name: 'Rahul Kumar',
    employee_code: 'EMP012',
    designation: 'Software Engineer',
    department: 'Engineering',
    joining_date: '2026-08-01',
    email: 'rahul.kumar@example.com',
    phone: '+91 98765 43210',
    salary: '45000',
    address: 'Patna, Bihar'
  }
};

/**
 * Core dynamic data resolver to bind placeholders to dynamic data sources.
 */
export const dynamicDataResolver = {
  /**
   * Main resolve routine
   */
  async resolve({ templateId, employeeId, companyId, profileId, manualData = {} }) {
    // 1. Fetch template content
    const templateContent = await TemplateContent.findOne({
      where: { templateId, isDeleted: false }
    });
    if (!templateContent || !templateContent.content) {
      throw new ApiError(404, `No active layout/content found for Template ID ${templateId}`);
    }

    // 2. Extract placeholders
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const placeholders = new Set();
    let match;
    while ((match = regex.exec(templateContent.content)) !== null) {
      placeholders.add(match[1]);
    }

    const fieldsList = [];
    const resolvedData = {};
    const missingFields = [];

    // Pre-load data sources
    let employee = null;
    if (employeeId) {
      employee = MOCK_EMPLOYEES[employeeId];
      if (!employee) {
        throw new ApiError(404, `Employee with ID ${employeeId} does not exist`);
      }
    }

    let company = null;
    if (companyId) {
      company = await Company.findByPk(companyId);
      if (!company) {
        throw new ApiError(404, `Company with ID ${companyId} does not exist`);
      }
    }

    let profile = null;
    if (profileId) {
      profile = await Profile.findByPk(profileId);
      if (!profile) {
        throw new ApiError(404, `Profile with ID ${profileId} does not exist`);
      }
    }

    // 3. Resolve each placeholder
    for (const key of placeholders) {
      // Find metadata from active Dynamic Field
      const dynamicField = await DynamicField.findOne({
        where: { fieldKey: key, isDeleted: false, isActive: true }
      });

      if (!dynamicField) {
        throw new ApiError(400, `Template contains undefined dynamic field: ${key}`);
      }

      let value = null;
      let source = dynamicField.dataSource;
      let editable = true;

      // Rule: SYSTEM fields cannot be overridden by clients
      if (source === 'SYSTEM') {
        editable = false;
        const now = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        if (key === 'current_date') {
          const day = String(now.getDate()).padStart(2, '0');
          const month = monthNames[now.getMonth()];
          value = `${day} ${month} ${now.getFullYear()}`;
        } else if (key === 'current_year') {
          value = String(now.getFullYear());
        } else if (key === 'current_datetime') {
          value = now.toISOString().replace('T', ' ').substring(0, 19);
        } else if (key === 'generated_at') {
          value = now.toISOString();
        } else {
          // General system default format for other keys
          value = now.toDateString();
        }
      } else {
        // Priority logic: 1. ManualData (supplied by client) / 2. Automatic DB lookup / 3. null
        if (manualData && manualData[key] !== undefined && manualData[key] !== null) {
          value = manualData[key];
        } else {
          // Resolve automatically depending on dataSource mapping
          if (source === 'EMPLOYEE') {
            if (!employeeId) {
              value = null; // Mark as unresolved since ID is missing
            } else if (employee) {
              value = employee[key] !== undefined ? employee[key] : null;
            }
          } else if (source === 'COMPANY') {
            if (!companyId) {
              value = null;
            } else if (company) {
              // Map DB attributes
              if (key === 'company_name') value = company.companyName;
              else if (key === 'company_address') value = company.registeredAddressLine1;
              else if (key === 'company_email') value = company.officialEmail;
              else if (key === 'company_phone') value = company.phoneNumber;
              else if (key === 'company_logo') value = company.logoUrl;
              else if (key === 'gst_number' || key === 'company_gst') value = company.gstNumber;
              else if (key === 'cin_number' || key === 'company_cin') value = company.cinNumber;
              else if (key === 'website') value = company.website;
              else value = company[key] !== undefined ? company[key] : null;
            }
          } else if (source === 'PROFILE') {
            if (!profileId) {
              value = null;
            } else if (profile) {
              if (key === 'profile_name') value = profile.profileName;
              else if (key === 'user_name') value = profile.profileName;
              else if (key === 'designation') value = profile.designation;
              else if (key === 'department') value = profile.department;
              else value = profile[key] !== undefined ? profile[key] : null;
            }
          } else if (source === 'MANUAL') {
            value = null; // Awaiting client manual entry
          }
        }
      }

      // Check required field resolution
      if (dynamicField.isRequired && (value === null || value === undefined || value === '')) {
        missingFields.push(key);
      }

      fieldsList.push({
        fieldKey: dynamicField.fieldKey,
        fieldName: dynamicField.fieldName,
        fieldType: dynamicField.fieldType,
        dataSource: dynamicField.dataSource,
        isRequired: dynamicField.isRequired,
        value,
        source,
        editable
      });

      if (value !== null && value !== undefined) {
        resolvedData[key] = value;
      }
    }

    return {
      templateId,
      fields: fieldsList,
      resolvedData,
      missingFields
    };
  }
};
