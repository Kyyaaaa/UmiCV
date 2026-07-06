import { apiClient as api } from '../lib/axios';
import { BatchRequest, BatchRequestTarget } from '../types';

export const batchRequestService = {
  getBatchRequests: (params?: any) => {
    return api.get<{ data: BatchRequest[]; total: number; page: number; limit: number }>('/batch-requests', { params });
  },

  getBatchRequestTargets: (id: string, params?: any) => {
    return api.get<{ data: BatchRequestTarget[]; total: number; page: number; limit: number }>(`/batch-requests/${id}/targets`, { params });
  },

  createBatchRequest: (data: { title: string; description?: string; deadline: string; targetUserIds: string[] }) => {
    return api.post<{ success: boolean; data: BatchRequest }>('/batch-requests', data);
  },

  cancelBatchRequest: (id: string) => {
    return api.post<{ success: boolean; data: BatchRequest }>(`/batch-requests/${id}/cancel`);
  },

  remindTarget: (id: string, userId: string) => {
    return api.post<{ success: boolean; message: string }>(`/batch-requests/${id}/targets/${userId}/remind`);
  },

  updateBatchRequest: (id: string, data: { title?: string; description?: string; deadline?: string; targetUserIds?: string[] }) => {
    return api.put<{ success: boolean; data: BatchRequest }>(`/batch-requests/${id}`, data);
  },

  deleteBatchRequest: (id: string) => {
    return api.delete<{ success: boolean }>(`/batch-requests/${id}`);
  },
};
