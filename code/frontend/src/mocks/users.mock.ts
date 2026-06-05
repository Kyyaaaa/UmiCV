import { User, Department } from '../types';

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Board of Directors', code: 'BOD', parentDepartmentId: null },
  { id: 'd2', name: 'Engineering', code: 'ENG', parentDepartmentId: 'd1' },
  { id: 'd3', name: 'Human Resources', code: 'HR', parentDepartmentId: 'd1' },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@umicv.com',
    fullName: 'System Administrator',
    role: 'Admin',
    departmentId: 'd1',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
  },
  {
    id: 'u2',
    username: 'techlead1',
    email: 'techlead1@umicv.com',
    fullName: 'John Doe',
    role: 'TechLead',
    departmentId: 'd2',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
  },
  {
    id: 'u3',
    username: 'hr_manager',
    email: 'hr@umicv.com',
    fullName: 'Jane Smith',
    role: 'HR',
    departmentId: 'd3',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
  },
  {
    id: 'u4',
    username: 'employee1',
    email: 'emp1@umicv.com',
    fullName: 'Alice Nguyen',
    role: 'Employee',
    departmentId: 'd2',
    status: 'Active',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Nguyen&background=random',
  },
  {
    id: 'u5',
    username: 'employee2',
    email: 'emp2@umicv.com',
    fullName: 'Bob Tran',
    role: 'Employee',
    departmentId: 'd2',
    status: 'Locked',
  },
];

// Current logged in user
export const currentUser: User = mockUsers[1]; // Logged in as Tech Lead for demo
