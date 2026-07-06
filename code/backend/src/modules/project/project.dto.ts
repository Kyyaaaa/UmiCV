import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  techLeadId: z.string().uuid(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const assignMembersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignMembersInput = z.infer<typeof assignMembersSchema>;

export const getProjectMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});
