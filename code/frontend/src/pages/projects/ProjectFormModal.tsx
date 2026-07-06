import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Project, User } from '../../types';
import { projectService } from '../../services/project.service';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  techLeads: User[];
  onSave: () => void;
}

export function ProjectFormModal({ isOpen, onClose, project, techLeads, onSave }: ProjectFormModalProps) {
  const isEdit = Boolean(project);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    techLeadId: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
        techLeadId: project.techLeadId,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        techLeadId: '',
      });
    }
    setError('');
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isEdit) {
        await projectService.updateProject(project!.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      onSave();
    } catch (err: any) {
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const fieldLabels: Record<string, string> = {
          name: 'Tên dự án',
          code: 'Mã dự án',
          techLeadId: 'Tech Lead phụ trách'
        };
        const detailErrors = err.response.data.errors.map((e: any) => {
          const rawField = e.field.replace(/^(body\.|query\.|params\.)/, '');
          const label = fieldLabels[rawField] || rawField;
          return `${label} ${e.message}`;
        }).join(', ');
        setError(`${err.response?.data?.message} - Chi tiết: ${detailErrors}`);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dự án');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa thông tin dự án' : 'Thêm dự án mới'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        
        <Input 
          label="Tên dự án" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        
        <Input 
          label="Mã dự án" 
          required 
          value={formData.code}
          onChange={e => setFormData({...formData, code: e.target.value})}
        />
        
        <Select 
          label="Tech Lead phụ trách" 
          required
          value={formData.techLeadId}
          onChange={e => setFormData({...formData, techLeadId: e.target.value})}
          options={[
            { value: '', label: 'Chọn Tech Lead...' },
            ...techLeads.map(t => ({ value: t.id, label: t.fullName }))
          ]}
        />
      </form>
    </Modal>
  );
}
