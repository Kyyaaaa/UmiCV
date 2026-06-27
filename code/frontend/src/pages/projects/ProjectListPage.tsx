import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Project, User } from '../../types';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectMembersModal } from './ProjectMembersModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../hooks/useAuth';

export function ProjectListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [projects, setProjects] = useState<Project[]>([]);
  const [techLeads, setTechLeads] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [projectForMembers, setProjectForMembers] = useState<Project | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchData = async () => {
    await Promise.resolve(); // Prevent synchronous setState in useEffect
    try {
      setIsLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        projectService.getProjects(),
        userService.getUsers({ role: 'TechLead', limit: 100 })
      ]);
      setProjects(projectsRes.data || []);
      setTechLeads(usersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch projects data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Tên dự án',
      render: (p) => <span className="font-medium text-slate-900">{p.name}</span>,
    },
    {
      key: 'code',
      header: 'Mã dự án',
    },
    {
      key: 'techLead',
      header: 'Tech Lead',
      render: (p) => p.techLead?.fullName || '-',
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (p) => p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '-',
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setProjectForMembers(p); setIsMembersOpen(true); }}
            title="Quản lý thành viên"
          >
            <Users size={16} className="text-blue-600" />
          </Button>
          {isAdmin && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSelectedProject(p); setIsFormOpen(true); }}
                title="Chỉnh sửa"
              >
                <Edit2 size={16} className="text-slate-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setProjectToDelete(p); setDeleteError(''); setIsDeleteOpen(true); }}
                title="Xóa"
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteError('');
      await projectService.deleteProject(projectToDelete.id);
      setIsDeleteOpen(false);
      setProjectToDelete(null);
      fetchData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setDeleteError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa dự án');
    }
  };

  return (
    <div>
      <PageHeader 
        title="Quản lý Dự án" 
        description="Quản lý danh sách dự án và nhân sự tham gia" 
        actions={
          isAdmin && (
            <Button onClick={() => { setSelectedProject(null); setIsFormOpen(true); }}>
              <Plus size={16} className="mr-2" />
              Thêm dự án
            </Button>
          )
        }
      />

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <DataTable
          columns={columns}
          data={projects}
          keyExtractor={(item) => item.id}
        />
      </div>

      <ProjectFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={selectedProject}
        techLeads={techLeads}
        onSave={handleSave}
      />

      <ProjectMembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        project={projectForMembers}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa dự án"
        description={`Bạn có chắc chắn muốn xóa dự án ${projectToDelete?.name}?`}
        confirmText="Xóa"
        type="danger"
        error={deleteError}
      />
    </div>
  );
}
