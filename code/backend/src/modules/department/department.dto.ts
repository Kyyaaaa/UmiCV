import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban không được để trống'),
  code: z.string().min(1, 'Mã phòng ban không được để trống'),
  parentDepartmentId: z.string().uuid('ID phòng ban cha không hợp lệ').optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
