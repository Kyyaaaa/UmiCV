import { apiClient } from '../lib/axios';
import { 
  CreateCVInput, 
  UpdateDraftInput, 
  GetCVsResponse, 
  GetCVResponse, 
  CreateCVResponse, 
  UpdateDraftResponse,
  GetVersionsResponse,
  GetVersionByIdResponse,
  RestoreVersionResponse,
  PublishCVResponse,
  GetDiffResponse
} from '../types/cv';

export const cvService = {
  getMyCVs: async (): Promise<GetCVsResponse> => {
    const response = await apiClient.get<GetCVsResponse>('/cvs/me');
    return response.data;
  },

  createCV: async (data: CreateCVInput): Promise<CreateCVResponse> => {
    const response = await apiClient.post<CreateCVResponse>('/cvs', data);
    return response.data;
  },

  getCVById: async (id: string): Promise<GetCVResponse> => {
    const response = await apiClient.get<GetCVResponse>(`/cvs/${id}`);
    return response.data;
  },

  updateDraft: async (id: string, data: UpdateDraftInput): Promise<UpdateDraftResponse> => {
    const response = await apiClient.put<UpdateDraftResponse>(`/cvs/${id}/draft`, data);
    return response.data;
  },

  getVersions: async (id: string): Promise<GetVersionsResponse> => {
    const response = await apiClient.get<GetVersionsResponse>(`/cvs/${id}/versions`);
    return response.data;
  },

  getVersionById: async (id: string, versionId: string): Promise<GetVersionByIdResponse> => {
    const response = await apiClient.get<GetVersionByIdResponse>(`/cvs/${id}/versions/${versionId}`);
    return response.data;
  },

  restoreVersion: async (id: string, versionId: string): Promise<RestoreVersionResponse> => {
    const response = await apiClient.post<RestoreVersionResponse>(`/cvs/${id}/versions/${versionId}/restore`);
    return response.data;
  },

  publishCV: async (id: string): Promise<PublishCVResponse> => {
    const response = await apiClient.post<PublishCVResponse>(`/cvs/${id}/publish`);
    return response.data;
  },

  getDiff: async (id: string): Promise<GetDiffResponse> => {
    const response = await apiClient.get<GetDiffResponse>(`/cvs/${id}/diff`);
    return response.data;
  },

  copyLocalization: async (id: string, targetLanguageCode: string): Promise<CreateCVResponse> => {
    const response = await apiClient.post<CreateCVResponse>(`/cvs/${id}/localizations/copy`, { targetLanguageCode });
    return response.data;
  }
};
