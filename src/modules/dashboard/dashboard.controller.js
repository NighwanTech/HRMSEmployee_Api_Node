import { dashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return sendSuccess(res, 'Dashboard statistics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};
