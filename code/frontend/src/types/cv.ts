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

export interface VersionSummary {
  id: string;
  versionNumber: number;
  createdAt: string;
}

export interface VersionDetail {
  id: string;
  cvProfileId: string;
  versionNumber: number;
  snapshotData: CVSections;
  createdAt: string;
}

export interface GetVersionsResponse {
  success: boolean;
  data: VersionSummary[];
}

export interface GetVersionByIdResponse {
  success: boolean;
  data: VersionDetail;
}

export interface RestoreVersionResponse {
  success: boolean;
  data: CVProfile;
}

export interface PublishCVResponse {
  success: boolean;
  message: string;
  data: CVProfile;
}

export interface DiffChange {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
}

export interface GetDiffResponse {
  success: boolean;
  data: DiffChange[];
}
