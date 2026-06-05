import React from 'react';
import { Badge } from '../ui/Badge';
import { CVStatus, Role } from '../../types';

interface StatusBadgeProps {
  status?: CVStatus | Role | string;
  type?: 'cv' | 'user' | 'general';
}

export function StatusBadge({ status, type = 'general' }: StatusBadgeProps) {
  if (!status) return null;

  if (type === 'cv') {
    switch (status as CVStatus) {
      case 'Draft':
        return <Badge variant="secondary">Nháp</Badge>;
      case 'PendingApproval':
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'Outdated':
        return <Badge variant="destructive">Chưa cập nhật</Badge>;
      case 'Updated':
        return <Badge variant="success">Đã cập nhật</Badge>;
      case 'Cancelled':
        return <Badge variant="outline">Hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  }

  if (type === 'user') {
    switch (status as Role) {
      case 'Admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'HR':
        return <Badge variant="info">HR</Badge>;
      case 'TechLead':
        return <Badge variant="warning">Tech Lead</Badge>;
      case 'Employee':
        return <Badge variant="secondary">Employee</Badge>;
      default:
        // Also handle active/locked
        if (status === 'Active') return <Badge variant="success">Hoạt động</Badge>;
        if (status === 'Locked') return <Badge variant="destructive">Đã khóa</Badge>;
        return <Badge variant="default">{status}</Badge>;
    }
  }

  return <Badge variant="default">{status}</Badge>;
}
