import { z } from 'zod';

export const createBatchRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    deadline: z.string().datetime().refine(val => new Date(val) > new Date(), { message: 'Hạn chót phải lớn hơn thời gian hiện tại' }),
    targetUserIds: z.array(z.string().uuid()).max(500, 'Maximum 500 users allowed per batch request'),
  }),
});

export const updateBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
    description: z.string().optional(),
    deadline: z.string().datetime().refine(val => new Date(val) > new Date(), { message: 'Hạn chót phải lớn hơn thời gian hiện tại' }).optional(),
    targetUserIds: z.array(z.string().uuid()).max(500, 'Maximum 500 users allowed per batch request').optional(),
  }),
});

export const deleteBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
});

export const cancelBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
});

export const remindTargetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

export const getBatchRequestsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    keyword: z.string().optional(),
    status: z.enum(['Active', 'Cancelled', 'Completed']).optional(),
  }),
});

export const getBatchRequestTargetsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
  query: z.object({
    status: z.enum(['Outdated', 'Updated']).optional(),
  }),
});

export type CreateBatchRequestInput = z.infer<typeof createBatchRequestSchema>['body'];
export type UpdateBatchRequestInput = z.infer<typeof updateBatchRequestSchema>['body'];
