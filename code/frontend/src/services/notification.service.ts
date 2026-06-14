import { apiClient as api } from '../lib/axios';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: () => {
    return api.get<{ success: boolean; data: Notification[] }>('/notifications');
  },
  
  broadcastNotification: (data: { title: string; message: string; type?: string; link?: string }) => {
    return api.post<{ success: boolean; message: string }>('/notifications/broadcast', data);
  },
  
  checkNew: () => {
    return api.get<{ success: boolean; data: { hasNew: boolean } }>('/notifications/check-new');
  },

  markChecked: () => {
    return api.put<{ success: boolean }>('/notifications/mark-checked');
  }
};
