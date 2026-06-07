import { apiClient } from '../lib/axios';
import { Department } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const departmentService = {
  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    const response = await apiClient.get<ApiResponse<Department[]>>('/departments');
    return response.data;
  },

  getDepartmentTree: async (): Promise<ApiResponse<Department[]>> => {
    const response = await apiClient.get<ApiResponse<Department[]>>('/departments/tree');
    return response.data;
  },

  getDepartmentById: async (id: string): Promise<ApiResponse<Department>> => {
    const response = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: { name: string; code: string; parentDepartmentId?: string | null }): Promise<ApiResponse<Department>> => {
    const response = await apiClient.post<ApiResponse<Department>>('/departments', data);
    return response.data;
  },

  updateDepartment: async (id: string, data: Partial<{ name: string; code: string; parentDepartmentId?: string | null }>): Promise<ApiResponse<Department>> => {
    const response = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/departments/${id}`);
    return response.data;
  }
};
