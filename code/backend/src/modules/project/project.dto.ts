import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống'),
  code: z.string().min(1, 'Mã dự án không được để trống'),
  techLeadId: z.string().uuid('ID Tech Lead không hợp lệ'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const assignMembersSchema = z.object({
  userIds: z.array(z.string().uuid('ID user không hợp lệ')).min(1, 'Danh sách user không được trống'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignMembersInput = z.infer<typeof assignMembersSchema>;
