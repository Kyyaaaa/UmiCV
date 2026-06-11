import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { User, Department } from '../../types';
import { Plus, Edit2, Lock, Unlock } from 'lucide-react';
import { UserFormModal } from './UserFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { userService } from '../../services/user.service';
import { departmentService } from '../../services/department.service';
import { useAuth } from '../../hooks/useAuth';

export function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const { user: currentUser } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [userToLock, setUserToLock] = useState<User | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, page]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments();
      setDepartments(res.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getUsers({
        page,
        limit: 10,
        search: searchTerm,
        role: roleFilter
      });
      setUsers(res.data || []);
      setTotalItems(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      render: (u) => departments.find(d => d.id === u.departmentId)?.name || '-',
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
      render: (u) => {
        const isAdminButNotMe = u.role === 'Admin' && u.id !== currentUser?.id;
        const isMe = u.id === currentUser?.id;

        return (
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isAdminButNotMe}
              title={isAdminButNotMe ? "Không thể thao tác trên tài khoản Quản trị viên khác" : "Sửa"}
              onClick={(e) => { e.stopPropagation(); setSelectedUser(u); setIsFormOpen(true); }}
            >
              <Edit2 size={16} className={isAdminButNotMe ? "text-slate-300" : "text-slate-500"} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={isMe || isAdminButNotMe}
              title={isMe ? "Không thể khóa tài khoản của chính mình" : (isAdminButNotMe ? "Không thể thao tác trên tài khoản Quản trị viên khác" : (u.status === 'Active' ? 'Khóa' : 'Mở khóa'))}
              onClick={(e) => { 
                e.stopPropagation(); 
                setUserToLock(u); 
                setIsLockOpen(true); 
              }}
            >
              {u.status === 'Active' 
                ? <Lock size={16} className={isMe || isAdminButNotMe ? "text-slate-300" : "text-red-500"} /> 
                : <Unlock size={16} className={isMe || isAdminButNotMe ? "text-slate-300" : "text-green-500"} />
              }
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSaveUser = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh list after save
  };

  const handleToggleLock = async () => {
    if (!userToLock) return;
    try {
      if (userToLock.status === 'Active') {
        await userService.lockUser(userToLock.id);
      } else {
        await userService.unlockUser(userToLock.id);
      }
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle lock status:', error);
    } finally {
      setIsLockOpen(false);
      setUserToLock(null);
    }
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

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
        />
        
        {totalItems > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium">{(page - 1) * 10 + 1}</span> đến <span className="font-medium">{Math.min(page * 10, totalItems)}</span> trong <span className="font-medium">{totalItems}</span> nhân sự
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= totalItems}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUser}
        departments={departments}
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
