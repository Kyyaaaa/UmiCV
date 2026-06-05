import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'CV Rejected',
    message: 'Your CV update was rejected by HR. Reason: Please add more details to your recent project experience.',
    type: 'error',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/cv',
  },
  {
    id: 'n2',
    title: 'Batch Request Cancelled',
    message: 'The batch request "End of Year Review 2025" has been cancelled.',
    type: 'warning',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'n3',
    title: 'New CV Pending Approval',
    message: 'Alice Nguyen has submitted a CV for approval.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: '/workflow/cv1',
  },
  {
    id: 'n4',
    title: 'Profile Updated Successfully',
    message: 'Your profile has been updated.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];
