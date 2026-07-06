import { apiClient } from '../lib/axios';
import { CVProfile } from '../types';

export interface DashboardStats {
  total: number;
  pending: number;
  updated: number;
  outdated: number;
}

export const dashboardService = {
  getStats: () => {
    return apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
  },
  
  getRecentCVs: () => {
    return apiClient.get<{ data: CVProfile[] }>('/dashboard/recent-cvs');
  }
};
