import { z } from 'zod';

export const approveSchema = z.object({
  body: z.object({
    level: z.number().int().min(1).max(2),
  }),
});

export const rejectSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Reason is required'),
    sectionId: z.string().optional(),
  }),
});

export type ApproveInput = z.infer<typeof approveSchema>['body'];
export type RejectInput = z.infer<typeof rejectSchema>['body'];
