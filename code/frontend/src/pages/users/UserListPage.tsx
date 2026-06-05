import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockUsers, mockDepartments } from '../../mocks/users.mock';
import { User } from '../../types';
import { Plus, Edit2, Lock, Unlock } from 'lucide-react';
import { UserFormModal } from './UserFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [userToLock, setUserToLock] = useState<User | null>(null);

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nhân sự',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.fullName}`} alt={u.fullName} className="h-8 w-8 rounded-full" />
          <div>
            <p className="font-medium text-slate-900">{u.fullName}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Tên đăng nhập',
    },
    {
      key: 'department',
      header: 'Phòng ban',
      render: (u) => mockDepartments.find(d => d.id === u.departmentId)?.name || '-',
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u) => <StatusBadge status={u.role} type="user" />,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) => <StatusBadge status={u.status} type="user" />,
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setIsFormOpen(true); }}
          >
            <Edit2 size={16} className="text-slate-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { 
              e.stopPropagation(); 
              setUserToLock(u); 
              setIsLockOpen(true); 
            }}
          >
            {u.status === 'Active' 
              ? <Lock size={16} className="text-red-500" /> 
              : <Unlock size={16} className="text-green-500" />
            }
          </Button>
        </div>
      ),
    },
  ];

  const handleSaveUser = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleToggleLock = () => {
    setIsLockOpen(false);
    setUserToLock(null);
  };

  return (
    <div>
      <PageHeader 
        title="Quản lý Nhân sự" 
        description="Quản lý tài khoản, vai trò và phân quyền trong hệ thống" 
        actions={
          <Button onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}>
            <Plus size={16} className="mr-2" />
            Thêm nhân sự
          </Button>
        }
      />

      <FilterPanel>
        <div className="w-64">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Tìm theo tên hoặc email..." />
        </div>
        <div className="w-48">
          <Select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'Admin', label: 'Admin' },
              { value: 'HR', label: 'HR' },
              { value: 'TechLead', label: 'Tech Lead' },
              { value: 'Employee', label: 'Employee' },
            ]}
          />
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
      />

      <UserFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <ConfirmModal
        isOpen={isLockOpen}
        onClose={() => setIsLockOpen(false)}
        onConfirm={handleToggleLock}
        title={userToLock?.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        description={`Bạn có chắc chắn muốn ${userToLock?.status === 'Active' ? 'khóa' : 'mở khóa'} tài khoản của ${userToLock?.fullName}?`}
        confirmText={userToLock?.status === 'Active' ? 'Khóa' : 'Mở khóa'}
        type={userToLock?.status === 'Active' ? 'danger' : 'info'}
      />
    </div>
  );
}
