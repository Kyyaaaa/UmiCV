export type Role = 'Employee' | 'TechLead' | 'HR' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  departmentId: string;
  status: 'Active' | 'Locked';
  avatarUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  children?: Department[]; // For tree structure
  childDepartments?: Department[]; // Added by backend getDepartmentTree
}

export interface Project {
  id: string;
  name: string;
  code: string;
  techLeadId: string;
  techLead?: User; // joined relation
  createdAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User; // joined relation
  joinedAt: string;
}

export type CVStatus = 'Draft' | 'PendingApproval' | 'Outdated' | 'Updated' | 'Cancelled';

export interface CVProfile {
  id: string;
  userId: string;
  languageCode: 'vi' | 'en' | 'jp';
  status: CVStatus;
  versionNumber: number;
  sectionsData: CVSections;
  submittedAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  slaStatus?: 'Safe' | 'Warning' | 'Overdue';
}

export interface CVSections {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    title: string;
    summary: string;
  };
  skills: { name: string; level: string }[];
  experience: { company: string; role: string; startDate: string; endDate: string; description: string }[];
  projects: { name: string; role: string; technologies: string[]; description: string }[];
  education: { school: string; degree: string; year: string }[];
  [key: string]: any; // Support for custom dynamic sections
}

export interface BatchRequest {
  id: string;
  createdBy: string;
  title: string;
  description: string;
  deadline: string;
  status: 'Active' | 'Cancelled';
  createdAt: string;
  targetCount: number;
  completedCount: number;
}

export interface BatchRequestTarget {
  id: string;
  batchRequestId: string;
  userId: string;
  status: 'Outdated' | 'Updated';
  updatedAt: string;
  user?: User;
}

export interface ApprovalLog {
  id: string;
  cvProfileId: string;
  approverId: string;
  approverName?: string;
  action: 'Approve' | 'Reject';
  level: 1 | 2;
  reason: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}
