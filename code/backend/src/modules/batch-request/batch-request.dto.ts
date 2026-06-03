import { z } from 'zod';

export const createBatchRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    deadline: z.string().datetime(), // ISO datetime string
    targetUserIds: z.array(z.string().uuid()).max(500, 'Maximum 500 users allowed per batch request'),
  }),
});

export type CreateBatchRequestInput = z.infer<typeof createBatchRequestSchema>['body'];
