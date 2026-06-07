import { apiClient } from '../lib/axios';
import { Project, ProjectMember } from '../types';
import { ApiResponse } from './department.service';

import { PaginatedResponse } from './user.service';

export const projectService = {
  getProjects: async (): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects');
    return response.data;
  },

  getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: { name: string; code: string; techLeadId: string }): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<{ name: string; code: string; techLeadId: string }>): Promise<ApiResponse<Project>> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },

  getProjectMembers: async (projectId: string): Promise<ApiResponse<ProjectMember[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
    return response.data;
  },

  assignMembers: async (projectId: string, userIds: string[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/projects/${projectId}/members`, { userIds });
    return response.data;
  },

  removeMember: async (projectId: string, userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/projects/${projectId}/members/${userId}`);
    return response.data;
  }
};
