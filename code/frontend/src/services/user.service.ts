import { apiClient } from '../lib/axios';
import { User } from '../types';
import { ApiResponse } from './department.service';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; departmentId?: string }): Promise<PaginatedResponse<User>> => {
    const apiParams = {
      ...params,
      keyword: params?.search,
    };
    delete apiParams.search;
    
    // Filter out empty strings to avoid sending '?role=' which might cause issues
    Object.keys(apiParams).forEach(key => {
      if (apiParams[key as keyof typeof apiParams] === '') {
        delete apiParams[key as keyof typeof apiParams];
      }
    });

    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params: apiParams });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  lockUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/lock`);
    return response.data;
  },

  unlockUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/unlock`);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  updateMe: async (data: any): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  },

  updatePassword: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>('/users/me/password', data);
    return response.data;
  }
};
