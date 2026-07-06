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
  createdAt: string;
  updatedAt: string;
  user?: Partial<User> & { department?: Department };
  slaStatus?: 'Safe' | 'Warning' | 'Overdue';
}

export interface CVSections {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    role: string;
    about: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
  };
  skills: { name: string }[];
  experience: { company: string; title: string; date: string; desc: string }[];
  projects: { name: string; link: string; desc: string }[];
  education: { institution: string; date: string; qualification: string }[];
  [key: string]: any; // Support for custom dynamic sections
}

export interface BatchRequest {
  id: string;
  createdBy: string;
  title: string;
  description: string;
  deadline: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  targetCount: number;
  completedCount: number;
}

export interface BatchRequestTarget {
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
