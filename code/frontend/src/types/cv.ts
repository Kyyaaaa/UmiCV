import { CVProfile, CVSections } from './index';

export interface CreateCVInput {
  languageCode: 'vi' | 'en' | 'jp';
}

export interface UpdateDraftInput {
  sectionsData: CVSections;
}

export interface GetCVsResponse {
  success: boolean;
  data: CVProfile[];
}

export interface GetCVResponse {
  success: boolean;
  data: CVProfile;
}

export interface CreateCVResponse {
  success: boolean;
  data: CVProfile;
}

export interface UpdateDraftResponse {
  success: boolean;
  data: CVProfile;
}
