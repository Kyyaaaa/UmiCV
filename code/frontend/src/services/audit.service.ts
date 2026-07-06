import { apiClient } from '../lib/axios';

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  resourceId: string;
  timestamp: string;
  user?: {
    fullName: string;
    username: string;
  };
}

export const auditService = {
  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<{ data: AuditLog[], total: number }>('/audit-logs', { params });
    return response.data;
  }
};
