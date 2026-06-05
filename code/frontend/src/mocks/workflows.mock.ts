import { ApprovalLog, BatchRequest } from '../types';

export const mockApprovalLogs: ApprovalLog[] = [
  {
    id: 'log1',
    cvProfileId: 'cv1',
    approverId: 'u2',
    action: 'Approve',
    level: 1,
    reason: null,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'log2',
    cvProfileId: 'cv1',
    approverId: 'u3',
    action: 'Reject',
    level: 2,
    reason: 'Please add more details to your recent project experience.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const mockBatchRequests: BatchRequest[] = [
  {
    id: 'br1',
    createdBy: 'u3',
    title: 'Update CV for Q3 Assessment',
    description: 'Please ensure all your recent projects are updated.',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    targetCount: 50,
    completedCount: 15,
  },
  {
    id: 'br2',
    createdBy: 'u3',
    title: 'End of Year Review 2025',
    description: 'Yearly CV update.',
    deadline: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'Cancelled',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    targetCount: 120,
    completedCount: 0,
  },
];
