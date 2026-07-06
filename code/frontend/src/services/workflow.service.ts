import { apiClient } from '../lib/axios';
import { CVProfile, ApprovalLog } from '../types';

export const workflowService = {
  searchCVs: async (params: { status?: string; page?: number; limit?: number; keyword?: string; slaStatus?: string }) => {
    const response = await apiClient.get<{ data: CVProfile[], total: number }>('/cvs/search', { params });
    return response.data;
  },

  getApprovalLogs: async (cvId: string) => {
    const response = await apiClient.get<{ data: ApprovalLog[] }>(`/cvs/${cvId}/approval-logs`);
    return response.data;
  },

  getAllApprovalLogs: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<{ data: any[], total: number }>('/cvs/approval-logs/all', { params });
    return response.data;
  },

  approveCV: async (cvId: string, level: number, bypass?: boolean) => {
    const response = await apiClient.post(`/cvs/${cvId}/approve`, { level, bypass });
    return response.data;
  },

  rejectCV: async (cvId: string, reason: string, sectionId?: string) => {
    const response = await apiClient.post(`/cvs/${cvId}/reject`, { reason, sectionId });
    return response.data;
  }
};
