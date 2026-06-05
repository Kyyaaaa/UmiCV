import { apiClient } from '../lib/axios';
import { 
  CreateCVInput, 
  UpdateDraftInput, 
  GetCVsResponse, 
  GetCVResponse, 
  CreateCVResponse, 
  UpdateDraftResponse 
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
  }
};
